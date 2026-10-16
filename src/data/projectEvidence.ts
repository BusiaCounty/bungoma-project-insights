import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const EVIDENCE_BUCKET = "project-evidence";
export const MAX_EVIDENCE_SIZE = 20 * 1024 * 1024;
export type ProjectEvidence = Tables<"project_evidence"> & { url: string | null };

export function validateEvidence(file: File) {
  if (!file.size || file.size > MAX_EVIDENCE_SIZE) throw new Error("Choose a non-empty file up to 20 MB.");
  if (!["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.type)) {
    throw new Error("Choose a JPEG, PNG, WebP photograph or PDF document.");
  }
}

export async function fetchProjectEvidence(projectId: string): Promise<ProjectEvidence[]> {
  const records: Tables<"project_evidence">[] = [];
  for (let start = 0; ; start += 1000) {
    const { data, error } = await supabase.from("project_evidence").select("*")
      .eq("project_id", projectId).order("created_at", { ascending: false }).order("id")
      .range(start, start + 999);
    if (error) throw error;
    records.push(...data);
    if (data.length < 1000) break;
  }
  return Promise.all(records.map(async (record) => {
    const { data } = await supabase.storage.from(EVIDENCE_BUCKET).createSignedUrl(record.storage_path, 300);
    return { ...record, url: data?.signedUrl ?? null };
  }));
}

export async function uploadProjectEvidence(projectId: string, file: File, caption: string) {
  validateEvidence(file);
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error("Sign in to upload evidence.");
  const extension = file.type === "application/pdf" ? "pdf" : file.type.split("/")[1];
  const path = `${projectId}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from(EVIDENCE_BUCKET).upload(path, file, { contentType: file.type });
  if (uploadError) throw uploadError;
  const { error } = await supabase.from("project_evidence").insert({ project_id: projectId,
    storage_path: path, file_name: file.name, mime_type: file.type, file_size: file.size,
    caption: caption.trim() || null, uploaded_by: user.id });
  if (error) {
    await supabase.storage.from(EVIDENCE_BUCKET).remove([path]);
    throw error;
  }
}

export async function removeProjectEvidence(evidence: ProjectEvidence) {
  const { error: fileError } = await supabase.storage.from(EVIDENCE_BUCKET).remove([evidence.storage_path]);
  if (fileError) throw fileError;
  const { error } = await supabase.from("project_evidence").delete().eq("id", evidence.id);
  if (error) throw error;
}
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Project = Tables<"projects">;
export type WhistleblowerReport = TablesInsert<"whistleblower_reports">;
export type ProjectFeedback = TablesInsert<"project_feedback">;

export const SUB_COUNTIES = [
  "Matayos",
  "Nambale",
  "Butula",
  "Funyula",
  "Budalang'i",
  "Teso North",
  "Teso South",
];

export const SECTORS = [
  "Health and Sanitation",
  "Education and Industrial Skills Development",
  "Transport, Roads and Public Works",
  "Water, Irrigation, Environment, Natural Resources, Climate Change and Energy",
  "Smart Agriculture, Livestock, Fisheries, Blue Economy",
  "Energy",
  "Trade, Investment, Industrialization, Cooperatives and Small Micro Enterprises (SME)",
  "Strategic Partnerships, ICT and Digital Economy",
  "Youth, Sports, Tourism, Culture Social Protection, Gender Affairs and Creative Arts",
  "The County Treasury and Economic Planning",
  "Lands, Housing and Urban Development",
  "Public Service Management & Governance",
];

export const STATUSES = ["Completed", "Ongoing", "Stalled"] as const;

export const FINANCIAL_YEARS = [
  "2020/2021",
  "2021/2022",
  "2022/2023",
  "2023/2024",
  "2024/2025",
];

const WARDS: Record<string, string[]> = {
  Matayos: ["Bukhayo West", "Matayos South", "Busibwabo", "Burumba", "Mayenje"],
  Nambale: [
    "Nambale Township",
    "Khasoko",
    "Bukhayo East",
    "Bukhayo North/Walatsi",
    "Bukhayo Central",
  ],
  Butula: [
    "Marachi West",
    "Marachi North",
    "Elugulu",
    "Kingandole",
    "Marachi Central",
    "Marachi East",
  ],
  Funyula: [
    "Funyula",
    "Nangina",
    "Agenga/Nanguba",
    "Bwiri",
    "Namboboto Nambuku",
  ],
  "Budalang'i": [
    "Bunyala Central",
    "Bunyala North",
    "Bunyala West",
    "Bunyala East",
    "Khajula",
    "Port Victoria",
  ],
  "Teso North": [
    "Malaba Central",
    "Malaba North",
    "Angurai South",
    "Angurai North",
    "Angurai East",
    "Malaba South",
  ],
  "Teso South": [
    "Chakol South",
    "Chakol North",
    "Amukura West",
    "Amukura Central",
    "Amukura East",
    "Kakurio",
  ],
};

export const getWards = (subCounty?: string) => {
  if (!subCounty || subCounty === "all") return Object.values(WARDS).flat();
  return WARDS[subCounty] || [];
};

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function submitWhistleblowerReport(report: WhistleblowerReport) {
  const { error } = await supabase.from("whistleblower_reports").insert(report);
  if (error) throw error;
}

export async function submitFeedback(feedback: ProjectFeedback) {
  const { error } = await supabase.from("project_feedback").insert(feedback);
  if (error) throw error;
}

export async function fetchFeedback(projectId?: string) {
  let query = supabase
    .from("project_feedback")
    .select("*")
    .order("created_at", { ascending: false });
  if (projectId) query = query.eq("project_id", projectId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createProject(
  project: Omit<Tables<"projects">, "id" | "created_at" | "updated_at">,
): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .insert(project)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProject(
  id: string,
  updates: Partial<
    Omit<Tables<"projects">, "id" | "created_at" | "updated_at">
  >,
): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

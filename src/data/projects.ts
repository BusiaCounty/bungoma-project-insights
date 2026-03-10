import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Project = Tables<"projects">;
export type WhistleblowerReport = TablesInsert<"whistleblower_reports">;
export type ProjectFeedback = TablesInsert<"project_feedback">;

export const SUB_COUNTIES = [
  "Bumula", "Kabuchai", "Kanduyi", "Kimilili", "Mt. Elgon",
  "Sirisia", "Tongaren", "Webuye East", "Webuye West"
];

export const SECTORS = [
  "Health", "Education", "Roads & Infrastructure", "Water & Sanitation",
  "Agriculture", "Energy", "Trade & Industry", "ICT"
];

export const STATUSES = ["Completed", "Ongoing", "Stalled"] as const;

export const FINANCIAL_YEARS = [
  "2020/2021", "2021/2022", "2022/2023", "2023/2024", "2024/2025"
];

const WARDS: Record<string, string[]> = {
  "Bumula": ["Bumula", "Khasoko", "Kabula", "South Bukusu", "Siboti", "West Bukusu"],
  "Kabuchai": ["Kabuchai", "Chwele/Kabula", "West Nalondo", "Bwake/Luuya"],
  "Kanduyi": ["Khalaba", "Musikoma", "East Sang'alo", "Marakaru/Tuuti", "Sang'alo/West", "Township"],
  "Kimilili": ["Kimilili", "Kibingei", "Maeni", "Kamukuywa"],
  "Mt. Elgon": ["Cheptais", "Chesikaki", "Chepyuk", "Kapkateny", "Kaptama", "Elgon"],
  "Sirisia": ["Sirisia", "Malakisi/South Kulisiru", "Lwandanyi", "Namwela"],
  "Tongaren": ["Tongaren", "Naitiri/Kabuyefwe", "Milima", "Ndalu/Tabani", "Soysambu/Mitua"],
  "Webuye East": ["Mihuu", "Ndivisi", "Maraka"],
  "Webuye West": ["Sitikho", "Matulo", "Bokoli", "Misikhu"],
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
  const { error } = await supabase
    .from("whistleblower_reports")
    .insert(report);
  if (error) throw error;
}

export async function submitFeedback(feedback: ProjectFeedback) {
  const { error } = await supabase
    .from("project_feedback")
    .insert(feedback);
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

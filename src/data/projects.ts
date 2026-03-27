import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Project = Tables<"projects">;
export type WhistleblowerReport = TablesInsert<"whistleblower_reports">;
export type ProjectFeedback = TablesInsert<"project_feedback">;

// Enhanced whistleblower form interface
export interface PersonInvolved {
  name: string;
  position: string;
  department: string;
  relationship: string;
}

export interface EnhancedWhistleblowerReport {
  // Section 1: Reporter Information
  reportType: "Anonymous" | "Identified";
  fullName: string;
  contactEmail: string;
  phoneNumber: string;
  preferredContactMethod: "Email" | "Phone" | "None";
  relationshipToOrg: "Employee" | "Contractor" | "Citizen/Public" | "Vendor/Partner" | "Other";
  relationshipOther: string;

  // Section 2: Incident Details
  reportTitle: string;
  misconductType: "Fraud" | "Corruption" | "Abuse of Office" | "Harassment" | "Financial Mismanagement" | "Procurement Irregularities" | "Data Misuse" | "Other";
  misconductOther: string;
  incidentDescription: string;
  incidentDate: string;
  incidentDateEnd: string;
  county: string;
  subCounty: string;
  ward: string;
  specificLocation: string;

  // Section 3: Persons Involved
  personsInvolved: PersonInvolved[];

  // Section 4: Evidence & Documentation
  evidenceDescription: string;
  additionalWitnesses: boolean;
  witnessDetails: string;

  // Section 5: Impact & Risk Assessment
  estimatedImpact: string[];
  issueOngoing: boolean;
  urgencyLevel: "Low" | "Medium" | "High" | "Critical";

  // Section 6: Confidentiality & Consent
  confidentialityPreference: boolean;
  consentToContact: boolean;
  consentStatement: boolean;
  policyAcknowledgment: boolean;

  // Section 7: Follow-Up
  receiveUpdates: boolean;
  trackingCode: string;

  // Legacy fields
  projectName: string;
  evidence: string;
}

export const SUB_COUNTIES = [
  "Matayos",
  "Nambale",
  "Butula",
  "Samia",
  "Bunyala",
  "Teso North",
  "Teso South",
  "Countywide",
];

export const SECTORS = [
  "Health and Sanitation",
  "Education and Industrial Skills Development",
  "Transport Roads and Public Works",
  "Water Irrigation Environment Natural Resources Climate Change and Energy",
  "Smart Agriculture Livestock Fisheries Blue Economy",
  "Trade Investment Industrialization Cooperatives and Small Micro Enterprises (SME)",
  "Strategic Partnership ICT and Digital Economy",
  "Youth Sports Tourism Culture Social Protection Gender Affairs and Creative Arts",
  "The County Treasury and Economic Planning",
  "Lands Housing and Urban Development",
  "Public Service Management & Governance",
  "Governorship",
];

export const STATUSES = ["Completed", "Ongoing", "Stalled"] as const;

export const FINANCIAL_YEARS = [
  "2013/2014",
  "2014/2015",
  "2015/2016",
  "2016/2017",
  "2017/2018",
  "2018/2019",
  "2019/2020",
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
  Samia: [
    "Funyula",
    "Nangina",
    "Agenga/Nanguba",
    "Bwiri",
    "Namboboto Nambuku",
  ],
  "Bunyala": [
    "Bunyala Central",
    "Bunyala North",
    "Bunyala West",
    "Bunyala East",
    "Bunyala South",
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
    "Angorom",
  ],
  "Countywide": [
    "Countywide",
  ],
};


export const getWards = (subCounty?: string) => {
  if (!subCounty || subCounty === "all") return Object.values(WARDS).flat();
  return WARDS[subCounty] || [];
};

export async function fetchProjects(): Promise<Project[]> {
  let allData: Project[] = [];
  let from = 0;
  const step = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, from + step - 1);

    if (error) throw error;

    if (data) {
      allData = [...allData, ...data];
      if (data.length < step) {
        break;
      }
      from += step;
    } else {
      break;
    }
  }

  return allData;
}

export async function submitWhistleblowerReport(report: EnhancedWhistleblowerReport) {
  try {
    console.log("Starting whistleblower report submission");
    
    // Check if Supabase is configured
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || SUPABASE_URL.includes('undefined') || SUPABASE_PUBLISHABLE_KEY.includes('undefined')) {
      console.warn("Supabase environment variables not configured. Simulating successful submission for testing.");
      
      // Simulate a successful submission for testing purposes
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("Successfully simulated report submission");
      return { id: 'mock-id-' + Date.now(), ...report };
    }
    
    // Map to the existing database schema (basic fields only)
    // The enhanced migration hasn't been run yet, so we use the current schema
    // Map to the enhanced existing database schema
    const fullReport = {
      report_type: report.reportType,
      full_name: report.fullName || null,
      contact_email: report.contactEmail || null,
      phone_number: report.phoneNumber || null,
      preferred_contact_method: report.preferredContactMethod || 'None',
      relationship_to_org: report.relationshipToOrg || null,
      relationship_other: report.relationshipOther || null,
      
      report_title: report.reportTitle,
      misconduct_type: report.misconductType,
      misconduct_other: report.misconductOther || null,
      incident_description: report.incidentDescription,
      incident_date: report.incidentDate || null,
      incident_date_end: report.incidentDateEnd || null,
      county: report.county || null,
      sub_county: report.subCounty || null,
      ward: report.ward || null,
      specific_location: report.specificLocation || null,
      
      persons_involved: report.personsInvolved || [],
      
      evidence_description: report.evidenceDescription || null,
      additional_witnesses: report.additionalWitnesses || false,
      witness_details: report.witnessDetails || null,
      
      estimated_impact: report.estimatedImpact || [],
      issue_ongoing: report.issueOngoing || false,
      urgency_level: report.urgencyLevel || 'Medium',
      
      confidentiality_preference: report.confidentialityPreference ?? true,
      consent_to_contact: report.consentToContact || false,
      consent_statement: report.consentStatement || false,
      policy_acknowledgment: report.policyAcknowledgment || false,
      
      receive_updates: report.receiveUpdates || false,
      
      // legacy
      project_name: report.projectName || null,
      evidence: report.evidence || null,
    };

    console.log("Submitting full report:", fullReport);
    console.log("Supabase URL:", SUPABASE_URL);
    console.log("Supabase Key exists:", !!SUPABASE_PUBLISHABLE_KEY);

    // Try to insert with updated schema
    console.log("Attempting to insert into whistleblower_reports table...");
    
    // First, let's test if we can read from the table
    const { data: testData, error: testError } = await supabase
      .from("whistleblower_reports")
      .select("*")
      .limit(1);
    
    console.log("Table test - data:", testData);
    console.log("Table test - error:", testError);
    
    // Now try the insert - using 'any' to bypass stale typescript types
    const { data, error } = await supabase.from("whistleblower_reports").insert(fullReport as any).select().single();
    
    console.log("Supabase response data:", data);
    console.log("Supabase response error:", error);
    
    if (error) {
      console.error("Supabase error:", error);
      
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log("Successfully submitted report:", data);
    return data;
  } catch (error) {
    console.error("Error in submitWhistleblowerReport:", error);
    throw error;
  }
}

export async function submitFeedback(feedback: ProjectFeedback) {
  const { data, error } = await supabase
    .from("project_feedback")
    .insert(feedback)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchFeedback(projectId?: string) {
  let query = supabase
    .from("project_feedback")
    .select("*, projects(name)")
    .order("created_at", { ascending: false });
  if (projectId) query = query.eq("project_id", projectId);
  const { data, error } = await query;
  if (error) throw error;
  // Flatten: attach project_name from the joined relation
  return (data || []).map((f: any) => ({
    ...f,
    project_name: f.projects?.name || null,
  }));
}

export async function updateFeedbackStatus(feedbackId: string, status: string) {
  const { error } = await supabase
    .from("project_feedback")
    .update({ status })
    .eq("id", feedbackId);
  if (error) throw error;
}

export async function fetchFeedbackReplies(feedbackId: string) {
  const { data, error } = await supabase
    .from("feedback_replies")
    .select("*")
    .eq("feedback_id", feedbackId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function submitFeedbackReply(
  reply: Omit<TablesInsert<"feedback_replies">, "id" | "created_at">,
) {
  const { error } = await supabase
    .from("feedback_replies")
    .insert(reply);
  if (error) throw error;
}

export async function lookupFeedbackByTracking(trackingNumber: string) {
  const { data, error } = await supabase
    .from("project_feedback")
    .select("*")
    .eq("tracking_number", trackingNumber.trim().toUpperCase())
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createProject(
  project: Omit<TablesInsert<"projects">, "id" | "created_at" | "updated_at">,
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
  updates: Omit<TablesUpdate<"projects">, "id" | "created_at" | "updated_at">,
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

export async function bulkUpdateProjectLocation(ids: string[], sub_county: string, ward: string): Promise<void> {
  const { error } = await supabase
    .from("projects")
    .update({ sub_county, ward, updated_at: new Date().toISOString() })
    .in("id", ids);
  if (error) throw error;
}

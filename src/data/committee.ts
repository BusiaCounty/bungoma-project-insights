import { supabase } from "@/integrations/supabase/client";

export interface CommitteeMember {
  id: string;
  project_id: string;
  full_name: string;
  role: string;
  phone: string | null;
  email: string | null;
  photo_url: string | null;
  created_at: string;
}

export interface CommitteeMeeting {
  id: string;
  project_id: string;
  meeting_date: string;
  agenda: string;
  decisions: string | null;
  attendees: string[];
  created_at: string;
}

export interface CommitteeTask {
  id: string;
  project_id: string;
  assigned_to: string | null;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  created_at: string;
}

export async function fetchCommitteeMembers(projectId?: string): Promise<CommitteeMember[]> {
  let allData: CommitteeMember[] = [];
  let from = 0;
  const step = 1000;

  while (true) {
    let query = supabase.from("committee_members").select("*").order("created_at", { ascending: false }).range(from, from + step - 1);
    if (projectId) query = query.eq("project_id", projectId);
    
    const { data, error } = await query;
    if (error) throw error;
    
    if (data) {
      allData = [...allData, ...(data as CommitteeMember[])];
      if (data.length < step) break;
      from += step;
    } else {
      break;
    }
  }
  
  return allData;
}

export async function fetchCommitteeMeetings(projectId?: string): Promise<CommitteeMeeting[]> {
  let allData: CommitteeMeeting[] = [];
  let from = 0;
  const step = 1000;

  while (true) {
    let query = supabase.from("committee_meetings").select("*").order("meeting_date", { ascending: false }).range(from, from + step - 1);
    if (projectId) query = query.eq("project_id", projectId);
    
    const { data, error } = await query;
    if (error) throw error;
    
    if (data) {
      allData = [...allData, ...(data as CommitteeMeeting[])];
      if (data.length < step) break;
      from += step;
    } else {
      break;
    }
  }
  
  return allData;
}

export async function fetchCommitteeTasks(projectId?: string): Promise<CommitteeTask[]> {
  let allData: CommitteeTask[] = [];
  let from = 0;
  const step = 1000;

  while (true) {
    let query = supabase.from("committee_tasks").select("*").order("created_at", { ascending: false }).range(from, from + step - 1);
    if (projectId) query = query.eq("project_id", projectId);
    
    const { data, error } = await query;
    if (error) throw error;
    
    if (data) {
      allData = [...allData, ...(data as CommitteeTask[])];
      if (data.length < step) break;
      from += step;
    } else {
      break;
    }
  }
  
  return allData;
}

export async function createCommitteeMember(member: Omit<CommitteeMember, "id" | "created_at">) {
  const { error } = await supabase.from("committee_members").insert(member);
  if (error) throw error;
}

export async function deleteCommitteeMember(id: string) {
  const { error } = await supabase.from("committee_members").delete().eq("id", id);
  if (error) throw error;
}

export async function createCommitteeMeeting(meeting: Omit<CommitteeMeeting, "id" | "created_at">) {
  const { error } = await supabase.from("committee_meetings").insert(meeting);
  if (error) throw error;
}

export async function deleteCommitteeMeeting(id: string) {
  const { error } = await supabase.from("committee_meetings").delete().eq("id", id);
  if (error) throw error;
}

export async function createCommitteeTask(task: Omit<CommitteeTask, "id" | "created_at">) {
  const { error } = await supabase.from("committee_tasks").insert(task);
  if (error) throw error;
}

export async function updateCommitteeTaskStatus(id: string, status: string) {
  const { error } = await supabase.from("committee_tasks").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function deleteCommitteeTask(id: string) {
  const { error } = await supabase.from("committee_tasks").delete().eq("id", id);
  if (error) throw error;
}

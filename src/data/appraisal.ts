import { supabase } from "@/integrations/supabase/client";

export interface AppraisalWorkflow {
  id: string;
  project_id: string;
  current_step: AppraisalStepName;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'on_hold';
  initiator_id: string;
  initiator_name: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface AppraisalStep {
  id: string;
  workflow_id: string;
  step_name: AppraisalStepName;
  step_order: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'rejected';
  assigned_to?: string;
  assigned_role: AppraisalRole;
  due_date?: string;
  completed_at?: string;
  completed_by?: string;
  notes?: string;
  documents?: string[];
  created_at: string;
  updated_at: string;
}

export type AppraisalStepName = 
  | 'project_identification'
  | 'pre_feasibility_analysis'
  | 'feasibility_study'
  | 'technical_appraisal'
  | 'financial_appraisal'
  | 'economic_appraisal'
  | 'environmental_social_review'
  | 'risk_assessment'
  | 'final_review_approval';

export type AppraisalRole = 
  | 'project_officer'
  | 'economist'
  | 'planner'
  | 'treasury_reviewer'
  | 'environmental_officer'
  | 'risk_manager'
  | 'director'
  | 'permanent_secretary';

export interface AppraisalComment {
  id: string;
  step_id: string;
  workflow_id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  comment: string;
  created_at: string;
  is_internal: boolean;
}

export interface AppraisalDocument {
  id: string;
  step_id: string;
  workflow_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  uploaded_at: string;
  description?: string;
}

export const APPRAISAL_STEPS: Record<AppraisalStepName, { 
  name: string; 
  description: string; 
  requiredRole: AppraisalRole;
  estimatedDays: number;
  deliverables: string[];
}> = {
  project_identification: {
    name: 'Project Identification',
    description: 'Initial project identification and basic documentation',
    requiredRole: 'project_officer',
    estimatedDays: 3,
    deliverables: ['Project Concept Note', 'Initial Scope Document']
  },
  pre_feasibility_analysis: {
    name: 'Pre-feasibility Analysis',
    description: 'Preliminary analysis of project viability and requirements',
    requiredRole: 'project_officer',
    estimatedDays: 5,
    deliverables: ['Pre-feasibility Report', 'Resource Requirements']
  },
  feasibility_study: {
    name: 'Feasibility Study',
    description: 'Comprehensive feasibility analysis including technical and market analysis',
    requiredRole: 'economist',
    estimatedDays: 10,
    deliverables: ['Feasibility Study Report', 'Market Analysis', 'Technical Specifications']
  },
  technical_appraisal: {
    name: 'Technical Appraisal',
    description: 'Detailed technical evaluation of project design and implementation',
    requiredRole: 'planner',
    estimatedDays: 7,
    deliverables: ['Technical Appraisal Report', 'Implementation Plan', 'Risk Matrix']
  },
  financial_appraisal: {
    name: 'Financial Appraisal',
    description: 'Financial analysis including cost-benefit, funding requirements, and sustainability',
    requiredRole: 'treasury_reviewer',
    estimatedDays: 7,
    deliverables: ['Financial Appraisal Report', 'Budget Breakdown', 'Funding Plan']
  },
  economic_appraisal: {
    name: 'Economic Appraisal',
    description: 'Economic impact assessment and contribution to development goals',
    requiredRole: 'economist',
    estimatedDays: 5,
    deliverables: ['Economic Impact Assessment', 'Benefit Analysis']
  },
  environmental_social_review: {
    name: 'Environmental & Social Safeguards Review',
    description: 'Environmental and social impact assessment (NEMA compliant)',
    requiredRole: 'environmental_officer',
    estimatedDays: 10,
    deliverables: ['Environmental Impact Assessment', 'Social Impact Assessment', 'NEMA Compliance Report']
  },
  risk_assessment: {
    name: 'Risk Assessment',
    description: 'Comprehensive risk analysis and mitigation strategies',
    requiredRole: 'risk_manager',
    estimatedDays: 5,
    deliverables: ['Risk Assessment Report', 'Mitigation Plan', 'Contingency Planning']
  },
  final_review_approval: {
    name: 'Final Review and Approval',
    description: 'Final review and approval by senior management',
    requiredRole: 'director',
    estimatedDays: 3,
    deliverables: ['Final Approval Document', 'Implementation Authorization']
  }
};

// Mock functions for now since database tables don't exist yet
export async function createAppraisalWorkflow(projectId: string, initiatorId: string, initiatorName: string): Promise<AppraisalWorkflow> {
  // Mock implementation - in real app this would create database records
  const mockWorkflow: AppraisalWorkflow = {
    id: `workflow-${Date.now()}`,
    project_id: projectId,
    current_step: 'project_identification',
    status: 'pending',
    initiator_id: initiatorId,
    initiator_name: initiatorName,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  console.log('Mock appraisal workflow created:', mockWorkflow);
  return mockWorkflow;
}

export async function fetchAppraisalWorkflows(projectId?: string): Promise<AppraisalWorkflow[]> {
  // Mock implementation - return empty array for now
  console.log('Fetching appraisal workflows for project:', projectId);
  return [];
}

export async function updateAppraisalStep(
  stepId: string, 
  updates: Partial<AppraisalStep>
): Promise<void> {
  console.log('Mock update appraisal step:', stepId, updates);
}

export async function addAppraisalComment(
  stepId: string,
  workflowId: string,
  userId: string,
  userName: string,
  userRole: string,
  comment: string,
  isInternal: boolean = false
): Promise<void> {
  console.log('Mock add appraisal comment:', { stepId, workflowId, userId, userName, userRole, comment, isInternal });
}

export async function fetchAppraisalComments(stepId: string): Promise<AppraisalComment[]> {
  console.log('Mock fetching comments for step:', stepId);
  return [];
}

export async function advanceWorkflow(workflowId: string, nextStep: AppraisalStepName): Promise<void> {
  console.log('Mock advance workflow:', workflowId, nextStep);
}

export async function completeWorkflow(workflowId: string): Promise<void> {
  console.log('Mock complete workflow:', workflowId);
}

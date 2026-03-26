import { useState } from "react";
import { CheckCircle, Clock, Users, FileText, AlertTriangle, ChevronRight, ChevronDown, Plus, Calendar, MessageSquare, Upload, User, TrendingUp, Shield, DollarSign, TreePine, Target } from "lucide-react";
import { toast } from "sonner";
import { APPRAISAL_STEPS, AppraisalWorkflow, AppraisalStep, AppraisalStepName, AppraisalRole, createAppraisalWorkflow, advanceWorkflow, updateAppraisalStep, addAppraisalComment } from "@/data/appraisal";

interface AppraisalWorkflowProps {
  projects: any[];
  isAdmin?: boolean;
}

const AppraisalWorkflowTab = ({ projects, isAdmin = false }: AppraisalWorkflowProps) => {
  const [workflows, setWorkflows] = useState<AppraisalWorkflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<AppraisalWorkflow | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [showNewWorkflow, setShowNewWorkflow] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const getStepIcon = (stepName: AppraisalStepName) => {
    const iconMap = {
      project_identification: Target,
      pre_feasibility_analysis: FileText,
      feasibility_study: TrendingUp,
      technical_appraisal: Users,
      financial_appraisal: DollarSign,
      economic_appraisal: TrendingUp,
      environmental_social_review: TreePine,
      risk_assessment: Shield,
      final_review_approval: CheckCircle,
    };
    return iconMap[stepName] || FileText;
  };

  const getStepStatusColor = (status: string) => {
    const colorMap = {
      not_started: 'bg-gray-100 text-gray-600 border-gray-200',
      in_progress: 'bg-blue-100 text-blue-600 border-blue-200',
      completed: 'bg-green-100 text-green-600 border-green-200',
      rejected: 'bg-red-100 text-red-600 border-red-200',
    };
    return colorMap[status as keyof typeof colorMap] || colorMap.not_started;
  };

  const getWorkflowStatusColor = (status: string) => {
    const colorMap = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      on_hold: 'bg-gray-100 text-gray-800',
    };
    return colorMap[status as keyof typeof colorMap] || colorMap.pending;
  };

  const handleCreateWorkflow = async () => {
    if (!selectedProject) {
      toast.error("Please select a project");
      return;
    }

    setLoading(true);
    try {
      const workflow = await createAppraisalWorkflow(
        selectedProject,
        "current-user", // This would come from auth context
        "Current User"   // This would come from auth context
      );
      
      setWorkflows(prev => [workflow, ...prev]);
      setSelectedWorkflow(workflow);
      setShowNewWorkflow(false);
      setSelectedProject("");
      toast.success("Appraisal workflow created successfully");
    } catch (error) {
      toast.error("Failed to create workflow");
    } finally {
      setLoading(false);
    }
  };

  const renderWorkflowCard = (workflow: AppraisalWorkflow) => {
    const project = projects.find(p => p.id === workflow.project_id);
    const currentStepData = APPRAISAL_STEPS[workflow.current_step];
    const StepIcon = getStepIcon(workflow.current_step);

    return (
      <div 
        key={workflow.id}
        className="bg-card rounded-xl border border-border shadow-card p-6 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setSelectedWorkflow(workflow)}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              {project?.name || 'Unknown Project'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Initiated by {workflow.initiator_name}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getWorkflowStatusColor(workflow.status)}`}>
            {workflow.status.replace('_', ' ')}
          </span>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <StepIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {currentStepData.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {currentStepData.description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Created {new Date(workflow.created_at).toLocaleDateString()}</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    );
  };

  const renderWorkflowDetail = () => {
    if (!selectedWorkflow) return null;

    const project = projects.find(p => p.id === selectedWorkflow.project_id);
    const steps = Object.entries(APPRAISAL_STEPS).map(([key, data], index) => ({
      stepName: key as AppraisalStepName,
      ...data,
      order: index + 1,
      status: key === selectedWorkflow.current_step ? 'in_progress' : 
               index < Object.keys(APPRAISAL_STEPS).indexOf(selectedWorkflow.current_step) ? 'completed' : 'not_started'
    }));

    return (
      <div className="bg-card rounded-xl border border-border shadow-card">
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                {project?.name || 'Unknown Project'} - Appraisal Workflow
              </h2>
              <p className="text-sm text-muted-foreground">
                Workflow ID: {selectedWorkflow.id} | Status: {selectedWorkflow.status}
              </p>
            </div>
            <button
              onClick={() => setSelectedWorkflow(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {steps.map((step) => {
              const StepIcon = getStepIcon(step.stepName);
              const isActive = step.stepName === selectedWorkflow.current_step;
              
              return (
                <div key={step.stepName} className="border border-border rounded-lg overflow-hidden">
                  <div
                    className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                      isActive ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => toggleSection(step.stepName)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isActive ? 'bg-primary/20' : 'bg-muted'
                      }`}>
                        <StepIcon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">
                          {step.order}. {step.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getStepStatusColor(step.status)}`}>
                        {step.status.replace('_', ' ')}
                      </span>
                      {expandedSections.includes(step.stepName) ? 
                        <ChevronDown className="w-4 h-4" /> : 
                        <ChevronRight className="w-4 h-4" />
                      }
                    </div>
                  </div>

                  {expandedSections.includes(step.stepName) && (
                    <div className="p-4 border-t border-border bg-muted/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Assigned Role</p>
                          <p className="text-sm text-foreground capitalize">
                            {step.requiredRole.replace('_', ' ')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Estimated Duration</p>
                          <p className="text-sm text-foreground">{step.estimatedDays} days</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Required Deliverables</p>
                        <div className="space-y-1">
                          {step.deliverables.map((deliverable, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-foreground">{deliverable}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {isActive && isAdmin && (
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs font-medium hover:opacity-90">
                            Start Step
                          </button>
                          <button className="px-3 py-1 bg-muted text-muted-foreground rounded text-xs font-medium hover:bg-muted/80">
                            Add Comment
                          </button>
                          <button className="px-3 py-1 bg-muted text-muted-foreground rounded text-xs font-medium hover:bg-muted/80">
                            Upload Documents
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Appraisal Workflow Management</h2>
          <p className="text-sm text-muted-foreground">
            Track and manage project appraisal processes with role-based approvals
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowNewWorkflow(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            New Workflow
          </button>
        )}
      </div>

      {/* New Workflow Modal */}
      {showNewWorkflow && (
        <div className="bg-card rounded-xl border border-border shadow-card p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Create New Appraisal Workflow</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Select Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Choose a project...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateWorkflow}
                disabled={loading || !selectedProject}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Workflow'}
              </button>
              <button
                onClick={() => {
                  setShowNewWorkflow(false);
                  setSelectedProject("");
                }}
                className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/80"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workflow List */}
      {!selectedWorkflow && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.length > 0 ? (
            workflows.map(renderWorkflowCard)
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Appraisal Workflows</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first appraisal workflow to get started
              </p>
              {isAdmin && (
                <button
                  onClick={() => setShowNewWorkflow(true)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
                >
                  Create Workflow
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Workflow Detail */}
      {selectedWorkflow && renderWorkflowDetail()}
    </div>
  );
};

export default AppraisalWorkflowTab;

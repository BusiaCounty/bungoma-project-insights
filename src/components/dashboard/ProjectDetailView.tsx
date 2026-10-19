import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Project } from "@/data/projects";
import { recordedExpenditure } from "@/data/projectFinancials";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ProjectEvidencePanel from "./ProjectEvidencePanel";
import ProjectFeedbackPanel from "./ProjectFeedbackPanel";
import ProjectLocationMap from "./ProjectLocationMap";

export interface ProjectDetailViewProps {
  project: Project | null; open: boolean; onOpenChange: (open: boolean) => void;
}
export const currency = (value: number | null | undefined) => value == null ? 'Not recorded' : `KES ${Number(value).toLocaleString('en-KE', { maximumFractionDigits: 2 })}`;
export const expenditure = (project: Project) => recordedExpenditure(project) == null ? 'Not confirmed' : currency(recordedExpenditure(project));

export default function ProjectDetailView({ project, open, onOpenChange }: ProjectDetailViewProps) {
  const saved = useQuery({ queryKey: ['project', project?.id], enabled: open && !!project,
    queryFn: async () => {
      if (!project) throw new Error('No project selected.');
      const { data, error } = await supabase.from('projects').select('*').eq('id', project.id).single();
      if (error) throw error;
      return data;
    } });
  const record = saved.data ?? project;
  if (!record) return null;
  const fields = [
    ['Specific location', record.specific_location || 'Not recorded'],
    ['Sub-county', record.sub_county], ['Ward', record.ward], ['Sector', record.sector],
    ['Implementing department', record.implementing_department || 'Not recorded'],
    ['Contractor', record.contractor || 'Not recorded'], ['Contract value', currency(record.contract_value)],
    ['Budget', currency(record.budget)], ['Expenditure', expenditure(record)],
    ['Projected cost', currency(record.projected_cost)], ['Financial year', record.fy],
    ['Expected completion date', record.expected_completion_date ? new Date(`${record.expected_completion_date}T00:00:00`).toLocaleDateString('en-KE') : 'Not recorded'],
  ];
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto min-w-0">
      <DialogHeader><DialogTitle className="text-xl pr-6 break-words">{record.name}</DialogTitle>
        <DialogDescription>{record.ward} · {record.sub_county} · {record.fy}</DialogDescription></DialogHeader>
      {saved.error && <p role="alert" className="text-sm text-destructive">Unable to refresh saved details: {saved.error.message}</p>}
      <div className="space-y-6 min-w-0">
        <section className="space-y-3 border-b border-border pb-5">
          <div className="flex flex-wrap justify-between items-center gap-3"><Badge variant="outline" className={record.status === 'Completed' ? 'text-success border-success' : record.status === 'Stalled' ? 'text-stalled border-stalled' : 'text-primary border-primary'}>{record.status}</Badge>
            <span className="text-sm font-medium">Physical progress: {record.progress}%</span></div>
          <Progress value={record.progress} />
        </section>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          {fields.map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-xs text-muted-foreground mb-1">{label}</dt><dd className="text-sm font-medium break-words">{value}</dd></div>)}
        </dl>
        <section className="space-y-3 border-y border-border py-5"><h3 className="font-semibold">Description</h3><p className="text-sm whitespace-pre-wrap break-words">{record.description || 'Not recorded'}</p>
          <h3 className="font-semibold">Challenges</h3><p className="text-sm whitespace-pre-wrap break-words">{record.challenges || 'Not recorded'}</p></section>
        <section className="space-y-3"><h3 className="font-semibold">Project location</h3>
          {record.latitude != null && record.longitude != null ? <><p className="text-sm text-muted-foreground">{record.latitude}, {record.longitude}</p><div className="h-80 overflow-hidden rounded-lg border border-border"><ProjectLocationMap projects={[record]} highlightedId={record.id} className="w-full h-full" /></div></> : <p className="text-sm text-muted-foreground">GPS coordinates not recorded.</p>}
        </section>
        <ProjectEvidencePanel key={`evidence-${record.id}`} projectId={record.id} />
        <section><h3 className="font-semibold">Citizen feedback</h3><ProjectFeedbackPanel key={`feedback-${record.id}`} project={record} /></section>
      </div>
    </DialogContent>
  </Dialog>;
}
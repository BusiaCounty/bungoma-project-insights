import type { Project } from "@/data/projects";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export type ProjectInformation = Pick<Project, "implementing_department" | "contractor" | "contract_value" | "expected_completion_date" | "challenges" | "specific_location" | "expenditure_confirmed">;
export const emptyProjectInformation: ProjectInformation = {
  implementing_department: null, contractor: null, contract_value: null,
  expected_completion_date: null, challenges: null, specific_location: null, expenditure_confirmed: false,
};
export function projectInformation(project: Project): ProjectInformation {
  return Object.fromEntries(Object.keys(emptyProjectInformation).map(key => [key, project[key as keyof ProjectInformation] ?? emptyProjectInformation[key as keyof ProjectInformation]])) as ProjectInformation;
}

export default function ProjectInformationFields({ value, onChange }: {
  value: ProjectInformation; onChange: (value: ProjectInformation) => void;
}) {
  const set = <K extends keyof ProjectInformation>(key: K, next: ProjectInformation[K]) => onChange({ ...value, [key]: next });
  return <fieldset className="space-y-4 border-t border-border pt-4">
    <legend className="text-sm font-semibold">Implementation details</legend>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {([['implementing_department', 'Implementing department'], ['contractor', 'Contractor'], ['specific_location', 'Specific location']] as const).map(([key, label]) =>
        <div key={key} className="space-y-2"><label htmlFor={`project-${key}`} className="text-sm font-medium">{label}</label>
          <Input id={`project-${key}`} value={value[key] ?? ''} onChange={e => set(key, e.target.value || null)} /></div>)}
      <div className="space-y-2"><label htmlFor="project-contract_value" className="text-sm font-medium">Contract value (KES)</label>
        <Input id="project-contract_value" type="number" min={0} step="0.01" value={value.contract_value ?? ''} onChange={e => set('contract_value', e.target.value === '' ? null : Number(e.target.value))} /></div>
      <div className="space-y-2"><label htmlFor="project-expected_completion_date" className="text-sm font-medium">Expected completion date</label>
        <Input id="project-expected_completion_date" type="date" value={value.expected_completion_date ?? ''} onChange={e => set('expected_completion_date', e.target.value || null)} /></div>
    </div>
    <div className="space-y-2"><label htmlFor="project-challenges" className="text-sm font-medium">Challenges</label>
      <Textarea id="project-challenges" rows={3} value={value.challenges ?? ''} onChange={e => set('challenges', e.target.value || null)} /></div>
    <div className="flex items-center gap-2"><Checkbox id="project-expenditure_confirmed" checked={value.expenditure_confirmed} onCheckedChange={v => set('expenditure_confirmed', v === true)} />
      <label htmlFor="project-expenditure_confirmed" className="text-sm">Expenditure confirmed (including zero spending)</label></div>
  </fieldset>;
}
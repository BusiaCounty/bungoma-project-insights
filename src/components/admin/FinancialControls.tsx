import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "@/data/projects";
import { projectFinancials } from "@/data/projectFinancials";
import { currency } from "../dashboard/ProjectDetailView";

export default function FinancialControls() {
  const { data: projects = [], isLoading, error } = useQuery({ queryKey: ['projects'], queryFn: fetchProjects });
  const rows = projects.map(project => ({ project, ...projectFinancials(project) }));
  return <div className="space-y-6">
    <h2 className="text-2xl font-bold">Project Financials</h2>
    <dl className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-y border-border py-5">
      <div><dt className="text-sm text-muted-foreground">Total budget</dt><dd className="font-semibold">{currency(projects.reduce((sum, p) => sum + Number(p.budget), 0))}</dd></div>
      <div><dt className="text-sm text-muted-foreground">Confirmed expenditure</dt><dd className="font-semibold">{currency(rows.reduce((sum, r) => sum + (r.actual ?? 0), 0))}</dd></div>
      <div><dt className="text-sm text-muted-foreground">Expenditure not confirmed</dt><dd className="font-semibold">{rows.filter(r => r.actual == null).length} projects</dd></div>
    </dl>
    {error && <p role="alert" className="text-destructive">{error.message}</p>}
    {isLoading ? <p>Loading project financials…</p> : <div className="overflow-x-auto"><table className="w-full text-sm">
      <thead><tr className="border-b border-border">{['Project', 'Budget', 'Contract value', 'Expenditure', 'Projected cost', 'Projected cost variance', 'Physical progress'].map(label => <th className="text-left p-3 whitespace-nowrap" key={label}>{label}</th>)}</tr></thead>
      <tbody>{rows.map(row => <tr key={row.project.id} className="border-b border-border"><td className="p-3 min-w-48">{row.project.name}</td>
        <td className="p-3 whitespace-nowrap">{currency(row.project.budget)}</td><td className="p-3 whitespace-nowrap">{currency(row.project.contract_value)}</td>
        <td className="p-3 whitespace-nowrap">{row.actual == null ? 'Not confirmed' : currency(row.actual)}</td><td className="p-3 whitespace-nowrap">{currency(row.projected)}</td>
        <td className="p-3 whitespace-nowrap">{currency(row.variance)}</td><td className="p-3">{row.project.progress}%</td></tr>)}</tbody>
    </table></div>}
  </div>;
}

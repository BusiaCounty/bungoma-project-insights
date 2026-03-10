import type { Project } from "@/data/projects";

interface ProjectsTableProps {
  projects: Project[];
}

const statusClass: Record<string, string> = {
  Completed: "bg-success/10 text-success",
  Ongoing: "bg-primary/10 text-primary",
  Stalled: "bg-stalled/10 text-stalled",
};

const ProjectsTable = ({ projects }: ProjectsTableProps) => {
  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-bold text-foreground">Project Details</h3>
        <p className="text-[10px] text-muted-foreground">{projects.length} projects found</p>
      </div>
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/50 sticky top-0">
            <tr>
              {["#", "Project Name", "Sub County", "Ward", "Sector", "Status", "Budget (KES)", "FY", "Progress"].map((h) => (
                <th key={h} className="px-3 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.slice(0, 100).map((p, i) => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                <td className="px-3 py-2 font-medium max-w-[220px] truncate">{p.name}</td>
                <td className="px-3 py-2">{p.subCounty}</td>
                <td className="px-3 py-2">{p.ward}</td>
                <td className="px-3 py-2">{p.sector}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusClass[p.status]}`}>{p.status}</span>
                </td>
                <td className="px-3 py-2 font-medium">{p.budget.toLocaleString()}</td>
                <td className="px-3 py-2">{p.fy}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${p.progress}%`, backgroundColor: p.status === "Completed" ? "hsl(142 71% 45%)" : p.status === "Stalled" ? "hsl(0 80% 25%)" : undefined }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{p.progress}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectsTable;

import type { Project } from "@/data/projects";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";

interface StatusFeedbackProps {
  projects: Project[];
}

const statusIcon: Record<string, React.ElementType> = {
  Completed: CheckCircle2,
  Ongoing: Clock,
  Stalled: AlertTriangle,
};

const statusColors: Record<string, string> = {
  Completed: "text-success",
  Ongoing: "text-primary",
  Stalled: "text-stalled",
};

const StatusFeedback = ({ projects }: StatusFeedbackProps) => {
  const grouped = {
    Completed: projects.filter((p) => p.status === "Completed"),
    Ongoing: projects.filter((p) => p.status === "Ongoing"),
    Stalled: projects.filter((p) => p.status === "Stalled"),
  };

  return (
    <div className="space-y-4">
      {(["Completed", "Ongoing", "Stalled"] as const).map((status) => {
        const Icon = statusIcon[status];
        const items = grouped[status];
        return (
          <div key={status} className="bg-card rounded-xl border border-border shadow-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon className={`w-5 h-5 ${statusColors[status]}`} />
              <h3 className="text-sm font-bold text-foreground">{status} Projects ({items.length})</h3>
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {items.slice(0, 20).map((p) => (
                <div key={p.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30 text-xs">
                  <span className="font-medium truncate max-w-[50%]">{p.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{p.ward}</span>
                    <div className="flex items-center gap-1">
                      <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${p.progress}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{p.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatusFeedback;

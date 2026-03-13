import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from "lucide-react";
import type { Project } from "@/data/projects";
import ProjectFeedbackPanel from "./ProjectFeedbackPanel";
import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "./PaginationControls";

interface StatusFeedbackProps {
  projects: Project[];
}

const statusMeta: Record<
  string,
  {
    icon: React.ElementType;
    color: string;
    bg: string;
    border: string;
    label: string;
  }
> = {
  Completed: {
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/5",
    border: "border-success/15",
    label: "Completed",
  },
  Ongoing: {
    icon: Clock,
    color: "text-primary",
    bg: "bg-primary/5",
    border: "border-primary/15",
    label: "Ongoing",
  },
  Stalled: {
    icon: AlertTriangle,
    color: "text-stalled",
    bg: "bg-stalled/5",
    border: "border-stalled/15",
    label: "Stalled",
  },
};

const progressColor: Record<string, string> = {
  Completed: "hsl(142 71% 45%)",
  Stalled: "hsl(0 80% 45%)",
  Ongoing: "hsl(var(--primary))",
};

const ITEMS_PER_PAGE = 10;

interface StatusGroupProps {
  status: "Completed" | "Ongoing" | "Stalled";
  items: Project[];
  expandedProject: string | null;
  toggleProject: (id: string) => void;
}

const StatusGroup = ({ status, items, expandedProject, toggleProject }: StatusGroupProps) => {
  const meta = statusMeta[status];
  const Icon = meta.icon;
  const { currentPage, totalPages, paginatedItems, setCurrentPage, totalItems, startIndex } =
    usePagination(items, ITEMS_PER_PAGE);

  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
      <div className={`flex items-center gap-2 px-4 py-3 border-b border-border ${meta.bg}`}>
        <Icon className={`w-4 h-4 ${meta.color}`} />
        <h3 className="text-sm font-bold text-foreground flex-1">
          {meta.label} Projects
        </h3>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.color} ${meta.bg} ${meta.border}`}
        >
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-[11px] text-muted-foreground px-4 py-4 italic">
          No {status.toLowerCase()} projects match the current filters.
        </p>
      ) : (
        <>
          <div className="divide-y divide-border/50">
            {paginatedItems.map((p) => {
              const isExpanded = expandedProject === p.id;
              return (
                <div key={p.id} className="transition-colors hover:bg-muted/20">
                  <button
                    type="button"
                    onClick={() => toggleProject(p.id)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 group"
                    aria-expanded={isExpanded}
                    aria-controls={`feedback-${p.id}`}
                  >
                    <div className="relative w-8 h-8 shrink-0" title={`${p.progress}% complete`}>
                      <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                        <circle cx="16" cy="16" r="13" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                        <circle
                          cx="16" cy="16" r="13" fill="none"
                          stroke={progressColor[p.status]}
                          strokeWidth="3"
                          strokeDasharray={`${(p.progress / 100) * 81.7} 81.7`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span
                        className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-foreground"
                        style={{ color: progressColor[p.status] }}
                      >
                        {p.progress}%
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {p.ward} · {p.sub_county} · {p.fy}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-muted-foreground hidden sm:block truncate max-w-[120px]">
                        {p.sector.split(",")[0]}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div id={`feedback-${p.id}`} className="px-4 pb-4" style={{ animation: "feedback-expand 0.2s ease" }}>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                        {[
                          { label: "Budget", value: `KES ${Number(p.budget).toLocaleString()}` },
                          { label: "Financial Year", value: p.fy },
                          { label: "Sector", value: p.sector.length > 40 ? p.sector.slice(0, 40) + "…" : p.sector },
                          { label: "Description", value: p.description || "No description provided." },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-muted/40 rounded-lg px-3 py-2 col-span-1 last:col-span-2 sm:last:col-span-1">
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">{label}</p>
                            <p className="text-[11px] font-medium text-foreground break-words">{value}</p>
                          </div>
                        ))}
                      </div>
                      <ProjectFeedbackPanel project={p} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            startIndex={startIndex}
            pageSize={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

const StatusFeedback = ({ projects }: StatusFeedbackProps) => {
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const grouped = {
    Completed: projects.filter((p) => p.status === "Completed"),
    Ongoing: projects.filter((p) => p.status === "Ongoing"),
    Stalled: projects.filter((p) => p.status === "Stalled"),
  };

  const toggleProject = (id: string) =>
    setExpandedProject((prev) => (prev === id ? null : id));

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
        <MessageSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-foreground">Citizen Feedback</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Click on any project below to view its progress details and leave a
            rating or comment. Your voice helps improve service delivery.
          </p>
        </div>
      </div>

      {(["Ongoing", "Stalled", "Completed"] as const).map((status) => (
        <StatusGroup
          key={status}
          status={status}
          items={grouped[status]}
          expandedProject={expandedProject}
          toggleProject={toggleProject}
        />
      ))}

      <style>{`
        @keyframes feedback-expand {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default StatusFeedback;

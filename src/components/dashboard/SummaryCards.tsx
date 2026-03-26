import { useMemo } from "react";
import { BarChart3, DollarSign, CheckCircle2, Clock } from "lucide-react";
import type { Project } from "@/data/projects";

interface SummaryCardsProps {
  projects: Project[];
}

const SummaryCards = ({ projects }: SummaryCardsProps) => {
  const total = projects.length;
  const totalBudget = projects.reduce((s, p) => s + Number(p.budget), 0);
  const completed = projects.filter((p) => p.status === "Completed").length;
  const ongoing = projects.filter((p) => p.status === "Ongoing").length;

  const fmt = (n: number) => n.toLocaleString();
  const fmtBudget = (n: number) =>
    n >= 1_000_000_000 ? `KES ${(n / 1_000_000_000).toFixed(1)}B` :
    n >= 1_000_000 ? `KES ${(n / 1_000_000).toFixed(1)}M` :
    `KES ${fmt(n)}`;

  const cards = [
    { label: "Total Projects", value: fmt(total), icon: BarChart3, gradient: "bg-[image:var(--gradient-icon-blue)]", color: "text-primary" },
    { label: "Total Budget", value: fmtBudget(totalBudget), icon: DollarSign, gradient: "bg-[image:var(--gradient-icon-sky)]", color: "text-secondary" },
    { label: "Completed", value: fmt(completed), icon: CheckCircle2, gradient: "bg-[image:var(--gradient-icon-green)]", color: "text-success" },
    { label: "Ongoing", value: fmt(ongoing), icon: Clock, gradient: "bg-[image:var(--gradient-icon-blue)]", color: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="gradient-card rounded-xl p-4 border border-border shadow-card hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200 flex items-center gap-3"
        >
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${c.gradient}`}>
            <c.icon className={`w-7 h-7 ${c.color}`} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-muted-foreground">{c.label}</span>
            <span className="text-xl font-extrabold text-foreground">{c.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;

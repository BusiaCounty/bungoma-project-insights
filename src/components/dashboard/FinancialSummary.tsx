import { useMemo } from "react";
import type { Project } from "@/data/projects";

interface FinancialSummaryProps {
  projects: Project[];
}

const formatCurrency = (value: number) =>
  value.toLocaleString("en-KE", {
    maximumFractionDigits: 0,
  });

const FinancialSummary = ({ projects }: FinancialSummaryProps) => {
  const stats = useMemo(() => {
    if (!projects.length) {
      return {
        totalBudget: 0,
        avgBudget: 0,
        completedBudget: 0,
        ongoingBudget: 0,
      };
    }

    const totalBudget = projects.reduce(
      (sum, p) => sum + Number(p.budget ?? 0),
      0,
    );
    const completed = projects.filter((p) => p.status === "Completed");
    const ongoing = projects.filter((p) => p.status === "Ongoing");

    const completedBudget = completed.reduce(
      (sum, p) => sum + Number(p.budget ?? 0),
      0,
    );
    const ongoingBudget = ongoing.reduce(
      (sum, p) => sum + Number(p.budget ?? 0),
      0,
    );

    return {
      totalBudget,
      avgBudget: totalBudget / projects.length,
      completedBudget,
      ongoingBudget,
    };
  }, [projects]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border shadow-card p-4">
          <p className="text-[11px] text-muted-foreground font-semibold">
            Total Budget (KES)
          </p>
          <p className="mt-1 text-lg font-extrabold text-foreground">
            {formatCurrency(stats.totalBudget)}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Across {projects.length} projects in current filters.
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border shadow-card p-4">
          <p className="text-[11px] text-muted-foreground font-semibold">
            Average Budget per Project
          </p>
          <p className="mt-1 text-lg font-extrabold text-foreground">
            {formatCurrency(stats.avgBudget)}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Simple mean of project budgets.
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border shadow-card p-4">
          <p className="text-[11px] text-muted-foreground font-semibold">
            Completed vs Ongoing (KES)
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            Completed: {formatCurrency(stats.completedBudget)}
          </p>
          <p className="text-sm font-semibold text-foreground">
            Ongoing: {formatCurrency(stats.ongoingBudget)}
          </p>
          <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{
                width:
                  stats.totalBudget > 0
                    ? `${(stats.completedBudget / stats.totalBudget) * 100}%`
                    : "0%",
              }}
            />
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Bar shows share of budget already in completed projects.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummary;


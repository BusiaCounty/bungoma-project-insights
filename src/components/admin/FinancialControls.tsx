import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Banknote, AlertTriangle, PieChart, Info } from "lucide-react";
import { fetchProjects, type Project } from "@/data/projects";

type ProjectFinancialRow = {
  project: Project;
  budget: number;
  actual: number;
  variance: number;
  variancePct: number | null;
  projectedCost: number | null;
};

export default function FinancialControls() {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const rows: ProjectFinancialRow[] = useMemo(() => {
    return projects.map((p) => {
      const budget = Number(p.budget ?? 0);
      const progress =
        typeof p.progress === "number" ? p.progress : Number((p as any).progress ?? 0);

      // Prefer an explicit actual_spend column if present in the database,
      // otherwise fall back to a simple estimate based on progress.
      const rawActual = (p as any).actual_spend;
      const actual =
        typeof rawActual === "number"
          ? rawActual
          : Number(rawActual ?? NaN) || (budget * Math.max(progress, 0)) / 100;

      // Simple projection: if we know actual and progress > 0,
      // assume spend scales linearly with progress.
      const projectedCost =
        progress > 0 ? (actual / Math.max(progress, 1)) * 100 : null;

      const variance =
        projectedCost !== null ? projectedCost - budget : actual - budget;

      const variancePct =
        budget > 0 && variance !== 0
          ? (variance / budget) * 100
          : null;

      return {
        project: p,
        budget,
        actual,
        variance,
        variancePct,
        projectedCost,
      };
    });
  }, [projects]);

  const totals = useMemo(() => {
    if (!rows.length) {
      return {
        totalBudget: 0,
        totalActual: 0,
        totalVariance: 0,
        avgVariancePct: 0,
      };
    }

    const totalBudget = rows.reduce((sum, r) => sum + r.budget, 0);
    const totalActual = rows.reduce((sum, r) => sum + r.actual, 0);
    const totalVariance = rows.reduce((sum, r) => sum + r.variance, 0);

    const variancePctValues = rows
      .map((r) => r.variancePct)
      .filter((v): v is number => typeof v === "number");

    const avgVariancePct =
      variancePctValues.length > 0
        ? variancePctValues.reduce((a, b) => a + b, 0) / variancePctValues.length
        : 0;

    return { totalBudget, totalActual, totalVariance, avgVariancePct };
  }, [rows]);

  const formatCurrency = (value: number) =>
    value.toLocaleString("en-KE", {
      maximumFractionDigits: 0,
    });

  const formatPercent = (value: number | null) =>
    value === null ? "—" : `${value.toFixed(1)}%`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Project Financials</h2>
          <p className="text-muted-foreground text-sm">
            Detailed budget vs. actual spend per project, including variance and projected completion cost.
          </p>
        </div>
        <Button className="gap-2 shrink-0">
          <Banknote className="w-4 h-4" /> Export Financials
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border shadow-sm">
              <CardHeader>
                  <CardTitle>Portfolio Overview</CardTitle>
                  <CardDescription>Aggregated financial position across all projects.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="flex flex-col gap-2 p-3 bg-card border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">Total Budget</span>
                      <span className="text-sm font-semibold">
                        KES {formatCurrency(totals.totalBudget)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>All active projects</span>
                      <Badge variant="outline" className="text-[10px]">
                        {projects.length} projects
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 p-3 bg-card border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">Total Actual Spend</span>
                      <span className="text-sm font-semibold">
                        KES {formatCurrency(totals.totalActual)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Based on captured actuals or estimates</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 p-3 bg-card border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">Portfolio Variance</span>
                      <span
                        className={`text-sm font-semibold ${
                          totals.totalVariance > 0
                            ? "text-red-500"
                            : totals.totalVariance < 0
                              ? "text-emerald-600"
                              : "text-muted-foreground"
                        }`}
                      >
                        KES {formatCurrency(totals.totalVariance)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Average variance</span>
                      <span>{formatPercent(totals.avgVariancePct)}</span>
                    </div>
                  </div>
              </CardContent>
          </Card>
          
          <div className="space-y-6">
             <Card className="border-border shadow-sm">
               <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Financial Alert Thresholds</CardTitle>
                        <CardDescription>Automated warnings for cost overruns.</CardDescription>
                    </div>
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                </CardHeader>
                <CardContent className="space-y-3 p-4 bg-muted/20 border-t border-border mt-2">
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-medium flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Warning Threshold</span>
                        <span>85% of Allocation</span>
                    </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="font-medium flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Critical Threshold</span>
                        <span>95% of Allocation</span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-4 pt-4 border-t border-border">
                        <Info className="w-3 h-3"/> Alerts trigger emails to assigned Sub-County admins.
                    </p>
                    <Button variant="outline" className="w-full mt-2">Edit Thresholds</Button>
                </CardContent>
             </Card>

             <Card className="border-border shadow-sm bg-gradient-to-br from-card to-muted border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 tracking-tight">
                        <PieChart className="w-5 h-5 text-primary" /> Integrated IFMIS Link
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                   <p className="text-muted-foreground mb-4 leading-relaxed">System is currently syncing financial transactions with the county's central IFMIS portal. Last sync was successful 2 hours ago.</p>
                   <Button className="w-full bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm font-semibold">Force Sync Now</Button>
                </CardContent>
             </Card>
          </div>

          {/* Detailed per-project breakdown */}
          <Card className="md:col-span-2 border-border shadow-sm">
            <CardHeader>
              <CardTitle>Per-Project Financial Breakdown</CardTitle>
              <CardDescription>
                Budget vs actual spend, variance and projected completion cost for each project.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {isLoading ? (
                <div className="flex justify-center py-8 text-sm text-muted-foreground">
                  Loading project financials…
                </div>
              ) : rows.length === 0 ? (
                <div className="flex justify-center py-8 text-sm text-muted-foreground">
                  No projects available to analyse.
                </div>
              ) : (
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Project</th>
                      <th className="text-right px-3 py-2 font-semibold text-muted-foreground">Budget (KES)</th>
                      <th className="text-right px-3 py-2 font-semibold text-muted-foreground">Actual Spend (KES)</th>
                      <th className="text-right px-3 py-2 font-semibold text-muted-foreground">Variance (KES)</th>
                      <th className="text-right px-3 py-2 font-semibold text-muted-foreground">Variance %</th>
                      <th className="text-right px-3 py-2 font-semibold text-muted-foreground">Progress %</th>
                      <th className="text-right px-3 py-2 font-semibold text-muted-foreground">Projected Completion Cost (KES)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.project.id} className="border-b border-border/60">
                        <td className="px-3 py-2">
                          <div className="flex flex-col">
                            <span className="font-medium text-[11px] truncate max-w-[220px]">
                              {row.project.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {row.project.sub_county} • {row.project.ward}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {formatCurrency(row.budget)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {formatCurrency(row.actual)}
                        </td>
                        <td
                          className={`px-3 py-2 text-right font-mono ${
                            row.variance > 0
                              ? "text-red-500"
                              : row.variance < 0
                                ? "text-emerald-600"
                                : "text-muted-foreground"
                          }`}
                        >
                          {formatCurrency(row.variance)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {row.variancePct === null ? "—" : `${row.variancePct.toFixed(1)}%`}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {typeof row.project.progress === "number"
                            ? `${row.project.progress}%`
                            : `${Number((row.project as any).progress ?? 0)}%`}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {row.projectedCost === null
                            ? "—"
                            : formatCurrency(row.projectedCost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
      </div>
    </div>
  );
}

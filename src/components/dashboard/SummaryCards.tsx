import { useMemo } from "react";
import { BarChart3, DollarSign, CheckCircle2, Clock, PieChart as PieChartIcon } from "lucide-react";
import type { Project } from "@/data/projects";
import PieChart from "./PieChart";

interface SummaryCardsProps {
  projects: Project[];
}

const SummaryCards = ({ projects }: SummaryCardsProps) => {
  const total = projects.length;
  const totalBudget = projects.reduce((s, p) => s + Number(p.budget), 0);
  const completed = projects.filter((p) => p.status === "Completed").length;
  const ongoing = projects.filter((p) => p.status === "Ongoing").length;

  // Calculate project status by sub-county
  const subCountyData = useMemo(() => {
    const subCountyMap = new Map<string, { completed: number; ongoing: number; total: number }>();
    
    projects.forEach(project => {
      const subCounty = project.sub_county || 'Unknown';
      const current = subCountyMap.get(subCounty) || { completed: 0, ongoing: 0, total: 0 };
      
      current.total++;
      if (project.status === "Completed") {
        current.completed++;
      } else if (project.status === "Ongoing") {
        current.ongoing++;
      }
      
      subCountyMap.set(subCounty, current);
    });

    // Convert to chart data format
    const colors = [
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#14b8a6', // teal
      '#f97316', // orange
    ];

    return Array.from(subCountyMap.entries())
      .map(([subCounty, data], index) => ({
        label: subCounty,
        value: data.total,
        completed: data.completed,
        ongoing: data.ongoing,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value) // Sort by total projects descending
      .slice(0, 8); // Show top 8 sub-counties
  }, [projects]);

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
    <div className="flex flex-col gap-6">
      {/* Summary Cards */}
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

      {/* Sub-County Project Status Pie Chart */}
      <div className="bg-card rounded-xl border border-border shadow-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <PieChartIcon className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Projects by Sub-County</h3>
        </div>
        
        {subCountyData.length > 0 ? (
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <PieChart 
              data={subCountyData.map(item => ({
                label: item.label,
                value: item.value,
                color: item.color
              }))}
              size={250}
              showLabels={true}
              showLegend={true}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
              {subCountyData.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <div 
                    className="w-4 h-4 rounded-sm" 
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">{item.label}</span>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>Total: {item.value}</span>
                      <span>✓ {item.completed}</span>
                      <span>⟳ {item.ongoing}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No project data available for sub-county analysis
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryCards;

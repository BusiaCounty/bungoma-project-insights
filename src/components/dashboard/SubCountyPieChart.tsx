import { useMemo } from "react";
import { PieChart as PieChartIcon } from "lucide-react";
import type { Project } from "@/data/projects";
import PieChart from "./PieChart";

interface SubCountyPieChartProps {
  projects: Project[];
}

const SubCountyPieChart = ({ projects }: SubCountyPieChartProps) => {
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

  return (
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
  );
};

export default SubCountyPieChart;

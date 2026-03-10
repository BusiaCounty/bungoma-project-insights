import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from "recharts";
import type { Project } from "@/data/projects";

interface ChartsProps {
  projects: Project[];
}

const COLORS_SECTOR = ["#2563EB", "#0EA5E9", "#16A34A", "#F59E0B", "#8B5CF6", "#EC4899", "#14B8A6", "#EF4444"];
const STATUS_COLORS: Record<string, string> = { Completed: "#16A34A", Ongoing: "#2563EB", Stalled: "#6F0F0F" };

const Charts = ({ projects }: ChartsProps) => {
  const bySector = useMemo(() => {
    const map: Record<string, number> = {};
    projects.forEach((p) => { map[p.sector] = (map[p.sector] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [projects]);

  const byStatus = useMemo(() => {
    const map: Record<string, number> = {};
    projects.forEach((p) => { map[p.status] = (map[p.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [projects]);

  const byFY = useMemo(() => {
    const map: Record<string, number> = {};
    projects.forEach((p) => { map[p.fy] = (map[p.fy] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => a.name.localeCompare(b.name));
  }, [projects]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
      {/* Sector bar chart */}
      <div className="bg-card rounded-xl border border-border p-4 shadow-card min-h-[280px]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">Projects by Sector</h3>
            <p className="text-[10px] text-muted-foreground">Sector Distribution</p>
          </div>
          <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Interactive</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={bySector} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {bySector.map((_, i) => (
                <Cell key={i} fill={COLORS_SECTOR[i % COLORS_SECTOR.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Status pie chart */}
      <div className="bg-card rounded-xl border border-border p-4 shadow-card min-h-[280px]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">Projects by Status</h3>
            <p className="text-[10px] text-muted-foreground">Status Breakdown</p>
          </div>
          <span className="text-[10px] font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">Realtime</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={3} label={{ fontSize: 10 }}>
              {byStatus.map((entry) => (
                <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#94a3b8"} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* FY line chart */}
      <div className="bg-card rounded-xl border border-border p-4 shadow-card min-h-[260px] lg:col-span-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">Project Trends</h3>
            <p className="text-[10px] text-muted-foreground">Projects by Financial Year</p>
          </div>
          <span className="text-[10px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">Animated</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={byFY} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(199 60% 90%)" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2.5} dot={{ fill: "#2563EB", r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;

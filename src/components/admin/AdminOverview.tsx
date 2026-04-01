import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, MapPin, AlertTriangle, TrendingUp, CheckCircle, Clock, DollarSign, Users } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  total: number;
  ongoing: number;
  completed: number;
  stalled: number;
  totalBudget: number;
  totalSpend: number;
  feedbackCount: number;
  reportsCount: number;
}

interface BudgetByStatus {
  name: string;
  budget: number;
  spent: number;
}

interface RecentProject {
  id: string;
  name: string;
  status: string;
  updated_at: string;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [budgetData, setBudgetData] = useState<BudgetByStatus[]>([]);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [projectsRes, feedbackRes, reportsRes] = await Promise.all([
        supabase.from("projects").select("id, name, status, budget, actual_spend, updated_at"),
        supabase.from("project_feedback").select("id", { count: "exact", head: true }),
        supabase.from("whistleblower_reports").select("id", { count: "exact", head: true }),
      ]);

      const projects = projectsRes.data || [];
      const total = projects.length;
      const ongoing = projects.filter(p => p.status === "Ongoing").length;
      const completed = projects.filter(p => p.status === "Completed").length;
      const stalled = projects.filter(p => p.status === "Stalled").length;
      const totalBudget = projects.reduce((s, p) => s + Number(p.budget || 0), 0);
      const totalSpend = projects.reduce((s, p) => s + Number(p.actual_spend || 0), 0);

      setStats({
        total, ongoing, completed, stalled, totalBudget, totalSpend,
        feedbackCount: feedbackRes.count || 0,
        reportsCount: reportsRes.count || 0,
      });

      // Budget vs Spend by status
      const statusMap: Record<string, { budget: number; spent: number }> = {};
      projects.forEach(p => {
        if (!statusMap[p.status]) statusMap[p.status] = { budget: 0, spent: 0 };
        statusMap[p.status].budget += Number(p.budget || 0);
        statusMap[p.status].spent += Number(p.actual_spend || 0);
      });
      setBudgetData(Object.entries(statusMap).map(([name, v]) => ({
        name,
        budget: Math.round(v.budget / 1_000_000),
        spent: Math.round(v.spent / 1_000_000),
      })));

      // Recent projects
      const sorted = [...projects].sort((a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      ).slice(0, 5);
      setRecentProjects(sorted);

      setLoading(false);
    };
    fetchData();
  }, []);

  const fmtNum = (n: number) =>
    n >= 1_000_000_000 ? `${(n / 1_000_000_000).toFixed(1)}B` :
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` :
    n.toLocaleString();

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const statusIcon = (status: string) => {
    if (status === "Completed") return { icon: CheckCircle, color: "text-emerald-500" };
    if (status === "Stalled") return { icon: AlertTriangle, color: "text-destructive" };
    return { icon: Clock, color: "text-amber-500" };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-72 mt-2" /></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis = [
    { title: "Total Projects", value: stats!.total.toString(), icon: Activity, color: "text-primary", bg: "bg-primary/10" },
    { title: "Active/Ongoing", value: stats!.ongoing.toString(), icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
    { title: "Completed", value: stats!.completed.toString(), icon: CheckCircle, color: "text-secondary", bg: "bg-secondary/10" },
    { title: "Stalled", value: stats!.stalled.toString(), icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Overview</h2>
        <p className="text-muted-foreground text-sm">Live insights from your database.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((stat, idx) => (
          <Card key={idx} className="border-border shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Budget</p>
              <div className="text-2xl font-bold tracking-tight">KES {fmtNum(stats!.totalBudget)}</div>
            </div>
            <div className="p-3 rounded-xl bg-primary/10">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Citizen Feedback</p>
              <div className="text-2xl font-bold tracking-tight">{stats!.feedbackCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/10">
              <Users className="w-6 h-6 text-secondary" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Whistleblower Reports</p>
              <div className="text-2xl font-bold tracking-tight">{stats!.reportsCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-destructive/10">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts + Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-border shadow-sm">
          <CardHeader>
            <CardTitle>Budget vs Expenditure (KES M)</CardTitle>
            <CardDescription>By project status — live from database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }} />
                  <Bar dataKey="budget" name="Budget" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="spent" name="Actual Spend" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-border shadow-sm">
          <CardHeader>
            <CardTitle>Recently Updated Projects</CardTitle>
            <CardDescription>Latest changes across the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((p) => {
                const si = statusIcon(p.status);
                return (
                  <div key={p.id} className="flex items-start gap-3 text-sm">
                    <div className={`mt-0.5 ${si.color}`}>
                      <si.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground font-medium truncate">{p.name}</p>
                      <span className="text-xs text-muted-foreground">{p.status} · {timeAgo(p.updated_at)}</span>
                    </div>
                  </div>
                );
              })}
              {recentProjects.length === 0 && (
                <p className="text-sm text-muted-foreground">No projects found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map placeholder */}
      <Card className="border-border shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Geographical Distribution
          </CardTitle>
          <CardDescription>Interactive map configuration preview</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] p-0 bg-muted/10 relative flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://maps.wikimedia.org/osm-intl/6/38/31.png')] bg-cover bg-center opacity-30 mix-blend-luminosity"></div>
          <div className="relative z-10 bg-background/80 backdrop-blur-sm p-4 rounded-xl border border-border shadow-sm text-center">
            <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
            <h4 className="font-bold text-foreground">Interactive Maps Integration</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">Real-time mapping data for projects by ward, sub-county, and county levels.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, AreaChart, Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, TrendingUp, Clock, Star, MessageSquare, CheckCircle2, AlertCircle } from "lucide-react";
import { fetchFeedback, fetchFeedbackReplies } from "@/data/projects";
import { supabase } from "@/integrations/supabase/client";

const STATUS_COLORS: Record<string, string> = {
  New: "#3b82f6",
  "Under Review": "#f59e0b",
  "In Progress": "#8b5cf6",
  Resolved: "#10b981",
};

const RATING_COLORS = ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981"];

export default function FeedbackAnalytics() {
  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ["admin-feedback"],
    queryFn: () => fetchFeedback(),
  });

  // Fetch all replies for response time calculation
  const { data: allReplies = [] } = useQuery({
    queryKey: ["all-feedback-replies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feedback_replies" as any)
        .select("*")
        .eq("is_admin", true)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  // Status distribution
  const statusData = useMemo(() => {
    const map: Record<string, number> = { New: 0, "Under Review": 0, "In Progress": 0, Resolved: 0 };
    feedback.forEach((f: any) => {
      const s = f.status || "New";
      map[s] = (map[s] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [feedback]);

  // Rating distribution
  const ratingData = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    feedback.forEach((f: any) => {
      if (f.rating && f.rating >= 1 && f.rating <= 5) counts[f.rating - 1]++;
    });
    return counts.map((count, i) => ({ rating: `${i + 1} ★`, count }));
  }, [feedback]);

  // Feedback over time (monthly)
  const timelineData = useMemo(() => {
    const map: Record<string, { total: number; avgRating: number; ratingSum: number; ratingCount: number }> = {};
    feedback.forEach((f: any) => {
      const d = new Date(f.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!map[key]) map[key] = { total: 0, avgRating: 0, ratingSum: 0, ratingCount: 0 };
      map[key].total++;
      if (f.rating) {
        map[key].ratingSum += f.rating;
        map[key].ratingCount++;
      }
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, d]) => ({
        month,
        total: d.total,
        avgRating: d.ratingCount ? +(d.ratingSum / d.ratingCount).toFixed(1) : 0,
      }));
  }, [feedback]);

  // Response times (hours between feedback creation and first admin reply)
  const responseTimeData = useMemo(() => {
    if (!allReplies.length || !feedback.length) return [];
    // Group first admin reply per feedback
    const firstReplyMap: Record<string, string> = {};
    allReplies.forEach((r: any) => {
      if (!firstReplyMap[r.feedback_id]) firstReplyMap[r.feedback_id] = r.created_at;
    });

    const buckets: Record<string, number> = {
      "< 1h": 0, "1-6h": 0, "6-24h": 0, "1-3d": 0, "3d+": 0,
    };
    let totalHours = 0;
    let count = 0;

    feedback.forEach((f: any) => {
      const replyAt = firstReplyMap[f.id];
      if (!replyAt) return;
      const hours = (new Date(replyAt).getTime() - new Date(f.created_at).getTime()) / 3600000;
      totalHours += hours;
      count++;
      if (hours < 1) buckets["< 1h"]++;
      else if (hours < 6) buckets["1-6h"]++;
      else if (hours < 24) buckets["6-24h"]++;
      else if (hours < 72) buckets["1-3d"]++;
      else buckets["3d+"]++;
    });

    return {
      buckets: Object.entries(buckets).map(([name, value]) => ({ name, value })),
      avgHours: count ? (totalHours / count).toFixed(1) : "N/A",
      respondedCount: count,
      unanswered: feedback.length - count,
    };
  }, [feedback, allReplies]);

  // KPIs
  const totalFeedback = feedback.length;
  const withRating = feedback.filter((f: any) => f.rating).length;
  const avgRating = withRating
    ? (feedback.reduce((s: number, f: any) => s + (f.rating || 0), 0) / withRating).toFixed(1)
    : "N/A";
  const resolvedPct = totalFeedback
    ? Math.round((feedback.filter((f: any) => f.status === "Resolved").length / totalFeedback) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Feedback Analytics</h2>
        <p className="text-muted-foreground text-sm">Insights into citizen feedback patterns, satisfaction, and response performance.</p>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          { label: "Total Feedback", value: totalFeedback, icon: MessageSquare, color: "text-primary/40" },
          { label: "Avg Rating", value: avgRating, icon: Star, color: "text-amber-400/60" },
          { label: "Resolution Rate", value: `${resolvedPct}%`, icon: CheckCircle2, color: "text-emerald-500/50" },
          {
            label: "Avg Response",
            value: responseTimeData && typeof responseTimeData === "object" && "avgHours" in responseTimeData
              ? `${responseTimeData.avgHours}h`
              : "N/A",
            icon: Clock,
            color: "text-purple-500/50",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-border shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold text-foreground">{value}</p>
              </div>
              <Icon className={`w-8 h-8 ${color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1: Status + Rating */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Distribution Pie */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Status Distribution</CardTitle>
            <CardDescription className="text-xs">Feedback workflow breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  style={{ fontSize: 10 }}
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rating Distribution Bar */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Rating Distribution</CardTitle>
            <CardDescription className="text-xs">Breakdown of citizen satisfaction scores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ratingData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="rating" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {ratingData.map((_, i) => (
                    <Cell key={i} fill={RATING_COLORS[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: Timeline + Response Times */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Feedback over time */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <div>
                <CardTitle className="text-sm">Feedback & Rating Trends</CardTitle>
                <CardDescription className="text-xs">Monthly volume and average satisfaction</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {timelineData.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-8 text-center">Not enough data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={timelineData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="feedbackGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} allowDecimals={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} domain={[0, 5]} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Area yAxisId="left" type="monotone" dataKey="total" fill="url(#feedbackGrad)" stroke="#3b82f6" strokeWidth={2} name="Feedback Count" />
                  <Line yAxisId="right" type="monotone" dataKey="avgRating" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", r: 3 }} name="Avg Rating" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Response Time Distribution */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-500" />
              <div>
                <CardTitle className="text-sm">Response Time Distribution</CardTitle>
                <CardDescription className="text-xs">Time to first admin reply</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {responseTimeData && typeof responseTimeData === "object" && "buckets" in responseTimeData ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={responseTimeData.buckets} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Feedback Items" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {responseTimeData.respondedCount} responded
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-500" /> {responseTimeData.unanswered} unanswered
                  </span>
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground italic py-8 text-center">No response data available yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

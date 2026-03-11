import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, MapPin, AlertTriangle, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const projectStatusData = [
  { name: "Planned", count: 45 },
  { name: "Ongoing", count: 120 },
  { name: "Completed", count: 85 },
  { name: "Delayed", count: 18 },
];

export default function AdminOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Overview</h2>
        <p className="text-muted-foreground text-sm">High-level insights into county projects and system health.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Projects", value: "268", icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "Active/Ongoing", value: "120", icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
          { title: "Completed", value: "85", icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { title: "Flagged/Delayed", value: "18", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
        ].map((stat, idx) => (
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

      {/* Main Content Area */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Charts Section */}
        <Card className="lg:col-span-4 border-border shadow-sm">
          <CardHeader>
            <CardTitle>Budget vs Expenditure</CardTitle>
            <CardDescription>Financial health across current fiscal year</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="h-[300px] w-full flex items-end justify-center pb-4 text-muted-foreground text-sm">
                 {/* Recharts BarChart integration */}
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={projectStatusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                     <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false}/>
                     <XAxis dataKey="name" axisLine={false} tickLine={false} />
                     <YAxis axisLine={false} tickLine={false} />
                     <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }} />
                     <Bar dataKey="count" fill="currentColor" className="fill-primary" radius={[4, 4, 0, 0]} />
                   </BarChart>
                 </ResponsiveContainer>
             </div>
          </CardContent>
        </Card>

        {/* Recent Activity / Logs */}
        <Card className="lg:col-span-3 border-border shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity Logs</CardTitle>
            <CardDescription>System actions in the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { time: "10 mins ago", action: "User 'admin_jdoe' generated a financial report.", icon: Activity },
                { time: "1 hour ago", action: "Project 'Bungoma Water Core' status updated to Delayed.", icon: AlertTriangle, color: "text-amber-500" },
                { time: "2 hours ago", action: "New user 'staff_mwangi' added to Health Sector.", icon: Clock },
                { time: "5 hours ago", action: "Budget threshold warning triggered for Road M23.", icon: AlertTriangle, color: "text-red-500" },
                { time: "1 day ago", action: "System backup completed successfully.", icon: CheckCircle, color: "text-emerald-500" },
              ].map((log, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className={`mt-0.5 ${log.color || "text-muted-foreground"}`}>
                    <log.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium flex-1">{log.action}</p>
                    <span className="text-xs text-muted-foreground">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map visualization placeholder */}
      <Card className="border-border shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Geographical Distribution
          </CardTitle>
          <CardDescription>Interactive map configuration preview</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] p-0 bg-muted/10 relative flex items-center justify-center pointer-events-none">
            {/* Dynamic Interactive Map Integration Placeholder */}
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

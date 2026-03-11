import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, BarChart2, Calendar, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function ReportsAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-muted-foreground text-sm">Generate, schedule, and export custom project and financial reports.</p>
        </div>
        <Button className="gap-2 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
          <Download className="w-4 h-4" /> Generate Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Custom Report Builder */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Report Builder</CardTitle>
            <CardDescription>Configure parameters for ad-hoc reports.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select defaultValue="project_status">
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project_status">Project Status Summary</SelectItem>
                  <SelectItem value="financial">Financial Expenditure</SelectItem>
                  <SelectItem value="departmental">Departmental Performance</SelectItem>
                  <SelectItem value="audit_log">System Audit Logs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <div className="flex items-center gap-2">
                  <Input type="date" className="text-xs" />
                  <span className="text-muted-foreground">-</span>
                  <Input type="date" className="text-xs" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 border-primary/20 bg-primary/5 text-primary">PDF</Button>
                <Button variant="outline" className="flex-1">Excel (CSV)</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Reports & Saved Templates */}
        <div className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Scheduled Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Weekly Governor's Digest", frequency: "Every Monday 8:00 AM", format: "PDF" },
                  { name: "Monthly Financial Reconciliation", frequency: "1st of Month", format: "Excel" }
                ].map(report => (
                  <div key={report.name} className="flex justify-between items-center p-3 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-semibold text-sm">{report.name}</p>
                        <p className="text-xs text-muted-foreground">{report.frequency}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{report.format}</Badge>
                  </div>
                ))}
                <Button variant="ghost" className="w-full text-xs border border-dashed border-border text-muted-foreground h-9">
                  + Add Scheduled Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Temporary inline Badge component until we can import if not available
function Badge({ children, className, variant }: any) {
    return <span className={`px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground ${className}`}>{children}</span>
}

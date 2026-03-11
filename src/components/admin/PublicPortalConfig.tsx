import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Settings2, ShieldCheck, MessageSquare, ExternalLink } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function PublicPortalConfig() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Public Transparency Portal</h2>
          <p className="text-muted-foreground text-sm">Control what data is visible to citizens and manage public engagement.</p>
        </div>
        <Button variant="outline" className="gap-2">
           <ExternalLink className="w-4 h-4" /> Preview Public Site
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Data Visibility Controls</CardTitle>
            <CardDescription>Toggle what specific data points citizens can see.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
               {[
                  { label: "Exact Financial Figures (Current Expenditure)", default: true, desc: "Show precise amounts vs percentages." },
                  { label: "Project Contractor Details", default: false, desc: "Display company names assigned to projects." },
                  { label: "Delayed Project Explanations", default: true, desc: "Show official remarks on why a project is lagging." },
                  { label: "Detailed Committee Members (PMC)", default: false, desc: "List exact names vs just number of members." },
               ].map(setting => (
                 <div key={setting.label} className="flex flex-row items-center justify-between rounded-lg border border-border p-4 bg-card/50">
                    <div className="space-y-0.5">
                       <label className="text-sm font-semibold text-foreground">{setting.label}</label>
                       <p className="text-xs text-muted-foreground">{setting.desc}</p>
                    </div>
                    {/* Placeholder for Switch component */}
                    <Switch defaultChecked={setting.default} />
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" /> Citizen Feedback Moderation
                </CardTitle>
                <CardDescription>Manage incoming comments and whistleblower reports.</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="space-y-3">
                     <div className="p-3 bg-muted/20 border border-border rounded-lg flex justify-between items-center text-sm">
                         <span>Require Admin Approval for Public Comments</span>
                         <Switch defaultChecked />
                     </div>
                     <div className="p-3 bg-muted/20 border border-border rounded-lg flex justify-between items-center text-sm">
                         <span>Allow Anonymous Whistleblowing</span>
                         <Switch defaultChecked />
                     </div>
                     <Button className="w-full mt-4" variant="secondary">Go to Moderation Queue</Button>
                  </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                 <CardTitle className="text-base flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" /> Mandatory Disclosure Acts
                 </CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                     Current configurations ensure compliance with the County Governments Act emphasizing public access to information on financial budgets and project milestones.
                  </p>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

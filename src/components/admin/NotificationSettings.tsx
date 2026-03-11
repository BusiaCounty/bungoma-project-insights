import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, MessageSquareText, Megaphone } from "lucide-react";

export default function NotificationSettings() {
  const adminAlerts = [
    { id: "budget_overrun", label: "Budget Overrun Alerts", desc: "Triggered when a project exceeds 85% of allocated funds." },
    { id: "new_whistleblower", label: "New Whistleblower Reports", desc: "Immediate notification for confidential citizen reports." },
    { id: "project_stalled", label: "Project Stalled Status", desc: "Alerts when a project hasn't updated status for 30+ days." },
    { id: "sys_backup", label: "System Backup Status", desc: "Daily summary of automated database backup integrity." }
  ];

  const publicAlerts = [
    { id: "pub_completed", label: "Project Completed Broadcast", desc: "Automatically publish 'Project Complete' milestones to public portal." },
    { id: "pub_new_project", label: "New Project Announcements", desc: "Notify citizens of newly approved development plans." }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Alerts & Notifications</h2>
          <p className="text-muted-foreground text-sm">Configure automated system emails, SMS alerts, and internal broadcasting channels.</p>
        </div>
        <Button className="gap-2 shrink-0 bg-primary">
          <Bell className="w-4 h-4" /> Add Custom Trigger
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border shadow-sm">
             <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary"/> Internal System Alerts 
                </CardTitle>
                <CardDescription>Event triggers formatted for internal administrators and staff.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                 <div className="bg-muted text-xs p-3 rounded-xl border border-border text-muted-foreground flex justify-between items-center font-medium">
                     <span>Global Delivery Channels</span>
                     <div className="flex gap-3">
                         <label className="flex items-center gap-1"><Switch defaultChecked className="scale-75 translate-x-1" /> Email</label>
                         <label className="flex items-center gap-1"><Switch defaultChecked className="scale-75 translate-x-1" /> SMS</label>
                     </div>
                 </div>

                 <div className="space-y-4 pt-4 border-t border-border">
                    {adminAlerts.map(alert => (
                       <div key={alert.id} className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5 max-w-[70%]">
                             <label className="text-sm font-semibold text-foreground">{alert.label}</label>
                             <p className="text-xs text-muted-foreground leading-tight">{alert.desc}</p>
                          </div>
                          <Switch defaultChecked />
                       </div>
                    ))}
                 </div>
             </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
             <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-emerald-500"/> Public & Citizen Broadcasts
                </CardTitle>
                <CardDescription>Automated feeds pushing updates to the public portal or social channels.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                  <div className="bg-muted/30 text-xs p-3 rounded-xl border border-destructive/20 text-muted-foreground flex items-center gap-2">
                     <MessageSquareText className="w-5 h-5 text-destructive" />
                     <span className="leading-tight">Warning: Broadcasts enabled here will immediately publish data formatting to the main public view without secondary authorization.</span>
                 </div>
                 
                  <div className="space-y-4 pt-4 border-t border-border">
                    {publicAlerts.map(alert => (
                       <div key={alert.id} className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5 max-w-[70%]">
                             <label className="text-sm font-semibold text-foreground">{alert.label}</label>
                             <p className="text-xs text-muted-foreground leading-tight">{alert.desc}</p>
                          </div>
                          {/* We don't want these on by default for safety */}
                          <Switch defaultChecked={false} />
                       </div>
                    ))}
                 </div>
             </CardContent>
          </Card>
      </div>
    </div>
  );
}

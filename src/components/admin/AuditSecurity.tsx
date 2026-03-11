import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldAlert, Terminal, Lock, ActivitySquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AuditSecurity() {
  const auditLogs = [
    { id: "AL-8923", user: "admin_jdoe", action: "Deleted Project: 'Bgm Ward Road'", ip: "102.167.34.2", time: "10 mins ago", severity: "high" },
    { id: "AL-8922", user: "system_auto", action: "Daily Backup Completed", ip: "localhost", time: "2 hours ago", severity: "info" },
    { id: "AL-8921", user: "staff_mwangi", action: "Uploaded Document: 'MOU_Signed.pdf'", ip: "197.232.14.8", time: "5 hours ago", severity: "low" },
    { id: "AL-8920", user: "exec_kweyu", action: "Approved Budget for Education Dept", ip: "41.80.96.142", time: "1 day ago", severity: "medium" },
    { id: "AL-8919", user: "UNKNOWN", action: "Failed Login Attempt (5x)", ip: "185.12.4.99", time: "1 day ago", severity: "critical" },
  ];

  const getSeverityBadge = (severity: string) => {
    switch(severity) {
      case 'critical': return <Badge variant="destructive" className="bg-red-500 hover:bg-red-600 font-bold uppercase text-[9px] px-1 py-0">Critical</Badge>;
      case 'high': return <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 font-bold uppercase text-[9px] px-1 py-0 text-white">High</Badge>;
      case 'medium': return <Badge variant="outline" className="border-amber-500/50 text-amber-600 font-bold uppercase text-[9px] px-1 py-0">Med</Badge>;
      case 'info':
      case 'low':
      default: return <Badge variant="secondary" className="font-bold uppercase text-[9px] px-1 py-0 text-muted-foreground">Info</Badge>;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Audit Logs & Security</h2>
          <p className="text-muted-foreground text-sm">Monitor system integrity, track user sessions, and review immutable activity trails.</p>
        </div>
        <Button variant="outline" className="gap-2 shrink-0">
          <Terminal className="w-4 h-4" /> Export Complete Log
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
             <Card className="border-border shadow-sm border-t-4 border-t-red-500">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                       <ShieldAlert className="w-5 h-5 text-red-500" /> Security Posture
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-2 text-sm text-foreground">
                    <div className="flex justify-between items-center pb-2 border-b border-border text-xs">
                        <span className="text-muted-foreground">Active Admin Sessions</span>
                        <span className="font-bold text-primary">3</span>
                    </div>
                     <div className="flex justify-between items-center pb-2 border-b border-border text-xs">
                        <span className="text-muted-foreground">Failed Logins (24h)</span>
                        <span className="font-bold text-red-500">12</span>
                    </div>
                     <div className="flex justify-between items-center pb-2 border-b border-border text-xs">
                        <span className="text-muted-foreground">Two-Factor Auth (2FA)</span>
                        <span className="font-bold text-emerald-500 text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded-full">Enforced</span>
                    </div>

                    <Button variant="outline" className="w-full text-xs h-8 mt-2">Force Terminate All Sessions</Button>
                </CardContent>
             </Card>
          </div>

          <Card className="border-border shadow-sm lg:col-span-3">
             <CardHeader className="pb-0 border-b border-border/50">
                 <div className="flex justify-between items-center mb-4">
                     <CardTitle className="flex items-center gap-2"><ActivitySquare className="w-5 h-5 text-primary"/> Immutable Activity Trail</CardTitle>
                     <div className="flex gap-2">
                         <div className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md font-mono border border-border flex items-center gap-1">
                             <Lock className="w-3 h-3"/> WORM Storage Active
                         </div>
                     </div>
                 </div>
             </CardHeader>
             <CardContent className="p-0">
                 <Table>
                     <TableHeader className="bg-muted/30">
                         <TableRow>
                             <TableHead className="w-[80px] text-xs">Log ID</TableHead>
                             <TableHead className="text-xs">Timestamp</TableHead>
                             <TableHead className="text-xs">User / System</TableHead>
                             <TableHead className="text-xs">Action details</TableHead>
                             <TableHead className="text-xs hidden md:table-cell">IP Context</TableHead>
                             <TableHead className="text-right text-xs">Sev</TableHead>
                         </TableRow>
                     </TableHeader>
                     <TableBody>
                         {auditLogs.map((log) => (
                             <TableRow key={log.id} className="font-mono text-[11px] hover:bg-muted/50">
                                 <TableCell className="text-muted-foreground">{log.id}</TableCell>
                                 <TableCell className="text-muted-foreground">{log.time}</TableCell>
                                 <TableCell className="font-semibold">{log.user}</TableCell>
                                 <TableCell className="truncate max-w-[200px] text-foreground">{log.action}</TableCell>
                                 <TableCell className="text-muted-foreground hidden md:table-cell">{log.ip}</TableCell>
                                 <TableCell className="text-right">
                                     {getSeverityBadge(log.severity)}
                                 </TableCell>
                             </TableRow>
                         ))}
                     </TableBody>
                 </Table>
                 <div className="p-3 border-t border-border flex justify-center">
                     <Button variant="ghost" size="sm" className="text-xs text-primary">Load Older Logs...</Button>
                 </div>
             </CardContent>
          </Card>
      </div>
    </div>
  );
}

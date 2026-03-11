import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Save, Database, Palette, Link as LinkIcon } from "lucide-react";

export default function SystemSettings() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Configuration</h2>
          <p className="text-muted-foreground text-sm">Global application settings, branding, and integrations.</p>
        </div>
        <Button className="gap-2 shrink-0">
          <Save className="w-4 h-4" /> Save Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Branding & UI */}
         <Card className="border-border shadow-sm">
            <CardHeader>
               <CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5 text-primary"/> Branding & Appearance</CardTitle>
               <CardDescription>Customize the look and feel of the public facing application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                 <label className="text-sm font-medium">Department / System Title</label>
                 <Input defaultValue="County Government of Busia - Projects Stock Dashboard" />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Primary Brand Color</label>
                    <div className="flex gap-2">
                      <Input type="color" defaultValue="#0ea5e9" className="w-12 p-1 h-10" />
                      <Input defaultValue="#0ea5e9" className="font-mono text-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">County Logo</label>
                    <Button variant="outline" className="w-full">Upload Logo...</Button>
                  </div>
               </div>
            </CardContent>
         </Card>

         {/* Integrations */}
         <Card className="border-border shadow-sm">
            <CardHeader>
               <CardTitle className="flex items-center gap-2"><LinkIcon className="w-5 h-5 text-primary"/> External Integrations</CardTitle>
               <CardDescription>API Keys and webhooks for connected services.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                 <div className="flex justify-between">
                    <label className="text-sm font-medium">SMS Gateway (Safaricom Daraja / Africa's Talking)</label>
                    <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 rounded-full flex items-center">Connected</span>
                 </div>
                 <Input type="password" value="************************" readOnly />
               </div>
               
               <div className="space-y-2">
                 <div className="flex justify-between">
                    <label className="text-sm font-medium">IFMIS Sync API Endpoint</label>
                    <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 rounded-full flex items-center">Connected</span>
                 </div>
                 <Input type="text" defaultValue="https://api.treasury.go.ke/v2/county-sync/bungoma" />
               </div>
            </CardContent>
         </Card>

         {/* Maintenance */}
         <Card className="border-border shadow-sm md:col-span-2">
            <CardHeader>
               <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5 text-primary"/> Database & Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex flex-col sm:flex-row gap-4">
                   <div className="flex-1 p-4 rounded-xl border border-border bg-card">
                       <h4 className="font-semibold text-sm mb-1">Automated Backups</h4>
                       <p className="text-xs text-muted-foreground mb-4">Current schedule: Daily at 02:00 AM (EAT). Stored securely with AES-256 encryption.</p>
                       <div className="flex gap-2">
                          <Button variant="secondary" size="sm">Download Latest SQL Dump</Button>
                          <Button variant="outline" size="sm">Configure</Button>
                       </div>
                   </div>
                   <div className="flex-1 p-4 rounded-xl border border-destructive/20 bg-destructive/5">
                       <h4 className="font-semibold text-sm text-destructive mb-1">Danger Zone</h4>
                       <p className="text-xs text-muted-foreground mb-4">Maintenance mode prevents all non-admin logins and disables public portal access.</p>
                       <Button variant="destructive" size="sm">Enable Maintenance Mode</Button>
                   </div>
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}

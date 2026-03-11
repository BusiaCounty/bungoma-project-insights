import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save } from "lucide-react";

export default function RBACConfig() {
  const modules = [
    "Project Configuration",
    "Financial Controls",
    "User Management",
    "Documents & Media",
    "Reporting & Analytics",
    "Public Portal Config"
  ];

  const roles = ["Super Admin", "Admin", "Staff", "Executive", "Public"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Role-Based Access Control</h2>
          <p className="text-muted-foreground text-sm">Configure permissions and access levels for system roles.</p>
        </div>
        <Button className="gap-2 shrink-0">
          <Save className="w-4 h-4" /> Save Changes
        </Button>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>Module Permissions Grid</CardTitle>
          <CardDescription>Check the boxes to grant a role access to specific system modules.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[250px]">Module / Feature</TableHead>
                {roles.map(role => (
                  <TableHead key={role} className="text-center">{role}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map((module) => (
                <TableRow key={module}>
                  <TableCell className="font-medium text-sm">{module}</TableCell>
                  {roles.map(role => (
                    <TableCell key={`${module}-${role}`} className="text-center">
                      <Checkbox 
                        defaultChecked={role === "Super Admin" || (role === "Admin" && module !== "User Management")}
                        disabled={role === "Super Admin"} // Super admin always has access
                        className={role === "Super Admin" ? "opacity-50" : ""}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border shadow-sm">
             <CardHeader>
                 <CardTitle>Geographic Data Access</CardTitle>
                 <CardDescription>Restrict data visibility by administrative divisions.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                 {/* Placeholder for geographic constraints */}
                 <div className="p-4 rounded-lg bg-muted/20 border border-border text-sm flex justify-between items-center">
                     <span>Enable strict Ward-level filtering for Staff</span>
                     <Checkbox defaultChecked />
                 </div>
                 <div className="p-4 rounded-lg bg-muted/20 border border-border text-sm flex justify-between items-center">
                     <span>Executives can view all Sub-counties</span>
                     <Checkbox defaultChecked disabled />
                 </div>
                 <Button variant="outline" className="w-full">Manage Geo Rules</Button>
             </CardContent>
          </Card>
          
          <Card className="border-border shadow-sm">
             <CardHeader>
                 <CardTitle>Approval Workflows</CardTitle>
                 <CardDescription>Define who can approve project milestones.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                 <div className="p-4 rounded-lg bg-muted/20 border border-border text-sm flex flex-col gap-2">
                     <span className="font-semibold text-foreground">Project Initiation</span>
                     <span className="text-xs text-muted-foreground">Requires: 1 Admin OR 2 Executive approvals</span>
                 </div>
                  <div className="p-4 rounded-lg bg-muted/20 border border-border text-sm flex flex-col gap-2">
                     <span className="font-semibold text-foreground">Budget Disbursement</span>
                     <span className="text-xs text-muted-foreground">Requires: Super Admin</span>
                 </div>
                 <Button variant="outline" className="w-full">Edit Workflows</Button>
             </CardContent>
          </Card>
      </div>
    </div>
  );
}

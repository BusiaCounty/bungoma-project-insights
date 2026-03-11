import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderTree, Plus, Settings } from "lucide-react";

export default function ProjectConfig() {
  const sectors = [
    { name: "Health", count: 42, color: "bg-red-500/10 text-red-600" },
    { name: "Roads & Transport", count: 85, color: "bg-slate-500/10 text-slate-600" },
    { name: "Education", count: 56, color: "bg-blue-500/10 text-blue-600" },
    { name: "Water & Environment", count: 34, color: "bg-cyan-500/10 text-cyan-600" },
    { name: "Agriculture", count: 21, color: "bg-emerald-500/10 text-emerald-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Project Configuration</h2>
          <p className="text-muted-foreground text-sm">Manage project categories, sectors, templates, and stages.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Sectors */}
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Project Sectors</CardTitle>
              <CardDescription>Active sectors and departments</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Plus className="w-3.5 h-3.5" /> Add
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mt-4">
              {sectors.map((sector) => (
                <div key={sector.name} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-3">
                    <FolderTree className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{sector.name}</span>
                  </div>
                  <Badge variant="secondary" className={sector.color}>
                    {sector.count} Projects
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Templates & Milestones */}
        <div className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle>Standard Milestones</CardTitle>
              <CardDescription>Global project tracking stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {["Planning", "Procurement", "Implementation", "M&E", "Commissioning"].map((stage, i) => (
                  <Badge key={stage} variant="outline" className="px-3 py-1 text-xs">
                    {i + 1}. {stage}
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-primary border border-dashed border-primary">
                  <Plus className="w-3 h-3 mr-1" /> Add Stage
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle>Project Templates</CardTitle>
              <CardDescription>Pre-configured structures for quick creation</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="space-y-3">
                 {["Standard Classroom Block", "Ward Borehole Project", "Road Tarmacking (Per KM)"].map(template => (
                   <div key={template} className="flex flex-col gap-1 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer group">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{template}</span>
                        <Settings className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-xs text-muted-foreground">Includes: Budget placeholders, 4 milestones, KPIs.</span>
                   </div>
                 ))}
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

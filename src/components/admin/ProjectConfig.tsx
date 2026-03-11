import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderTree, Plus, Settings, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function ProjectConfig() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    budget: "",
    fy: "2023/2024",
    sector: "Health",
    sub_county: "",
    ward: "",
    description: "",
  });

  const sectorsList = [
    { name: "Health", count: 42, color: "bg-red-500/10 text-red-600" },
    { name: "Roads & Transport", count: 85, color: "bg-slate-500/10 text-slate-600" },
    { name: "Education", count: 56, color: "bg-blue-500/10 text-blue-600" },
    { name: "Water & Environment", count: 34, color: "bg-cyan-500/10 text-cyan-600" },
    { name: "Agriculture", count: 21, color: "bg-emerald-500/10 text-emerald-600" },
  ];

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.budget || !formData.sub_county || !formData.ward) {
      toast.error("Please fill all required fields");
      return;
    }
    
    setSubmitting(true);
    try {
      const { error } = await supabase.from("projects").insert({
        name: formData.name,
        budget: Number(formData.budget),
        fy: formData.fy,
        sector: formData.sector,
        sub_county: formData.sub_county,
        ward: formData.ward,
        description: formData.description,
        status: "Ongoing",
        progress: 0,
      });

      if (error) throw error;
      
      toast.success("Project added successfully!");
      setOpen(false);
      setFormData({
        name: "",
        budget: "",
        fy: "2023/2024",
        sector: "Health",
        sub_county: "",
        ward: "",
        description: "",
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to add project");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Project Configuration</h2>
          <p className="text-muted-foreground text-sm">Manage project categories, sectors, templates, and stages.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Add New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleAddProject}>
              <DialogHeader>
                <DialogTitle>Add New Project</DialogTitle>
                <DialogDescription>
                  Enter the details of the new project to add it to the system.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Project Name <span className="text-destructive">*</span></Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Bumula Borehole Drilling" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="budget">Budget (KES) <span className="text-destructive">*</span></Label>
                    <Input 
                      id="budget" 
                      type="number"
                      placeholder="e.g. 5000000" 
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="fy">Financial Year</Label>
                    <Select value={formData.fy} onValueChange={(val) => setFormData({...formData, fy: val})}>
                      <SelectTrigger id="fy">
                        <SelectValue placeholder="Select FY" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2022/2023">2022/2023</SelectItem>
                        <SelectItem value="2023/2024">2023/2024</SelectItem>
                        <SelectItem value="2024/2025">2024/2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sector">Sector</Label>
                  <Select value={formData.sector} onValueChange={(val) => setFormData({...formData, sector: val})}>
                    <SelectTrigger id="sector">
                      <SelectValue placeholder="Select Sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectorsList.map((s) => (
                        <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="sub_county">Sub County <span className="text-destructive">*</span></Label>
                    <Input 
                      id="sub_county" 
                      placeholder="e.g. Bumula" 
                      value={formData.sub_county}
                      onChange={(e) => setFormData({...formData, sub_county: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ward">Ward <span className="text-destructive">*</span></Label>
                    <Input 
                      id="ward" 
                      placeholder="e.g. Kimaeti" 
                      value={formData.ward}
                      onChange={(e) => setFormData({...formData, ward: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Brief description of the project objectives..." 
                    className="resize-none"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Add Project
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
              {sectorsList.map((sector) => (
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

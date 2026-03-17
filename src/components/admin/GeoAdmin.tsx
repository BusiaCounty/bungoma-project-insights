import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MapPin, Edit, Search, Navigation, Building2, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SUB_COUNTIES, getWards } from "@/data/projects";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

type Project = Tables<"projects">;

export default function GeoAdmin() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSubCounty, setFilterSubCounty] = useState<string>("all");
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [editSubCounty, setEditSubCounty] = useState("");
  const [editWard, setEditWard] = useState("");
  const [editLatitude, setEditLatitude] = useState<string>("");
  const [editLongitude, setEditLongitude] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("sub_county", { ascending: true });
    if (error) {
      toast.error("Failed to load projects");
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.ward.toLowerCase().includes(search.toLowerCase());
    const matchesSubCounty =
      filterSubCounty === "all" || p.sub_county === filterSubCounty;
    return matchesSearch && matchesSubCounty;
  });

  // Group projects by sub-county -> ward
  const grouped: Record<string, Record<string, Project[]>> = {};
  filteredProjects.forEach((p) => {
    if (!grouped[p.sub_county]) grouped[p.sub_county] = {};
    if (!grouped[p.sub_county][p.ward]) grouped[p.sub_county][p.ward] = [];
    grouped[p.sub_county][p.ward].push(p);
  });

  // Stats
  const subCountyCounts = SUB_COUNTIES.filter(s => s !== "Countywide").map((sc) => ({
    name: sc,
    count: projects.filter((p) => p.sub_county === sc).length,
  }));
  const maxCount = Math.max(...subCountyCounts.map((s) => s.count), 1);

  const openEdit = (project: Project) => {
    setEditProject(project);
    setEditSubCounty(project.sub_county);
    setEditWard(project.ward);
    setEditLatitude(
      project.latitude === null || project.latitude === undefined
        ? ""
        : String(project.latitude),
    );
    setEditLongitude(
      project.longitude === null || project.longitude === undefined
        ? ""
        : String(project.longitude),
    );
  };

  const parseCoordinate = (
    raw: string,
  ): { value: number | null; error?: string } => {
    const trimmed = raw.trim();
    if (!trimmed) return { value: null };
    const n = Number(trimmed);
    if (!Number.isFinite(n)) return { value: null, error: "Must be a valid number" };
    return { value: n };
  };

  const handleSave = async () => {
    if (!editProject || !editSubCounty || !editWard) return;
    const lat = parseCoordinate(editLatitude);
    const lon = parseCoordinate(editLongitude);

    if (lat.error || lon.error) {
      toast.error("Please enter valid latitude/longitude values");
      return;
    }
    if (lat.value !== null && (lat.value < -90 || lat.value > 90)) {
      toast.error("Latitude must be between -90 and 90");
      return;
    }
    if (lon.value !== null && (lon.value < -180 || lon.value > 180)) {
      toast.error("Longitude must be between -180 and 180");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("projects")
      .update({
        sub_county: editSubCounty,
        ward: editWard,
        latitude: lat.value,
        longitude: lon.value,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editProject.id);
    setSaving(false);
    if (error) {
      toast.error("Failed to update location");
    } else {
      toast.success(`Location updated for "${editProject.name}"`);
      setEditProject(null);
      fetchProjects();
    }
  };

  const availableWards = getWards(editSubCounty);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Project Location Management</h2>
        <p className="text-muted-foreground text-sm">View and update project locations across sub-counties and wards.</p>
      </div>

      {/* Stats bar */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> Distribution by Sub-County
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {subCountyCounts.map((sc) => (
              <div key={sc.name} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-foreground truncate">{sc.name}</span>
                  <span className="text-muted-foreground font-bold">{sc.count}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(sc.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by project name or ward..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterSubCounty} onValueChange={setFilterSubCounty}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="All Sub-Counties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sub-Counties</SelectItem>
            {SUB_COUNTIES.map((sc) => (
              <SelectItem key={sc} value={sc}>{sc}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Project list grouped by location */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading projects...</div>
      ) : Object.keys(grouped).length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-12 text-center text-muted-foreground">
            No projects found matching your filters.
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="space-y-3">
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([subCounty, wards]) => {
              const totalInSc = Object.values(wards).flat().length;
              return (
                <AccordionItem key={subCounty} value={subCounty} className="border border-border rounded-xl overflow-hidden bg-card">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                    <div className="flex items-center gap-3 w-full">
                      <Building2 className="w-5 h-5 text-primary shrink-0" />
                      <span className="font-bold text-sm">{subCounty} Sub-County</span>
                      <Badge variant="secondary" className="ml-auto mr-2 text-xs">{totalInSc} projects</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-0">
                    <div className="space-y-4">
                      {Object.entries(wards)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([ward, wardProjects]) => (
                          <div key={ward}>
                            <div className="flex items-center gap-2 mb-2">
                              <Navigation className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{ward} Ward</span>
                              <span className="text-xs text-muted-foreground">({wardProjects.length})</span>
                            </div>
                            <div className="space-y-1.5 pl-5">
                              {wardProjects.map((project) => (
                                <div
                                  key={project.id}
                                  className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-border bg-background hover:bg-muted/30 transition-colors group"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium truncate">{project.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {project.sector} · FY {project.fy}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <Badge
                                      variant={project.status === "Completed" ? "default" : project.status === "Ongoing" ? "secondary" : "destructive"}
                                      className="text-[10px]"
                                    >
                                      {project.status}
                                    </Badge>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => openEdit(project)}
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
        </Accordion>
      )}

      {/* Edit Location Dialog */}
      <Dialog open={!!editProject} onOpenChange={(open) => !open && setEditProject(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Project Location</DialogTitle>
            <DialogDescription>
              Change the sub-county and ward for <span className="font-semibold text-foreground">{editProject?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Sub-County</Label>
              <Select value={editSubCounty} onValueChange={(val) => { setEditSubCounty(val); setEditWard(""); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sub-county" />
                </SelectTrigger>
                <SelectContent>
                  {SUB_COUNTIES.map((sc) => (
                    <SelectItem key={sc} value={sc}>{sc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ward</Label>
              <Select value={editWard} onValueChange={setEditWard}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ward" />
                </SelectTrigger>
                <SelectContent>
                  {availableWards.map((w) => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="proj-lat">Latitude</Label>
                <Input
                  id="proj-lat"
                  inputMode="decimal"
                  placeholder="-90 to 90"
                  value={editLatitude}
                  onChange={(e) => setEditLatitude(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proj-lon">Longitude</Label>
                <Input
                  id="proj-lon"
                  inputMode="decimal"
                  placeholder="-180 to 180"
                  value={editLongitude}
                  onChange={(e) => setEditLongitude(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProject(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !editSubCounty || !editWard}>
              {saving ? "Saving..." : "Save Location"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

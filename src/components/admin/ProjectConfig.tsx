import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FolderTree, Plus, Settings, Trash2, Pencil } from "lucide-react";

export default function ProjectConfig() {
  type Sector = { id: string; name: string };
  type Stage = { id: string; name: string; order: number };
  type Template = { id: string; name: string; description: string };

  type ProjectConfigState = {
    sectors: Sector[];
    stages: Stage[];
    templates: Template[];
  };

  const STORAGE_KEY = "bpi.projectConfig.v1";

  const defaultState: ProjectConfigState = {
    sectors: [
      { id: "health", name: "Health" },
      { id: "roads", name: "Roads & Transport" },
      { id: "education", name: "Education" },
      { id: "water", name: "Water & Environment" },
      { id: "agriculture", name: "Agriculture" },
    ],
    stages: [
      { id: "planning", name: "Planning", order: 1 },
      { id: "procurement", name: "Procurement", order: 2 },
      { id: "implementation", name: "Implementation", order: 3 },
      { id: "me", name: "M&E", order: 4 },
      { id: "commissioning", name: "Commissioning", order: 5 },
    ],
    templates: [
      {
        id: "classroom",
        name: "Standard Classroom Block",
        description: "Includes: Budget placeholders, 4 milestones, KPIs.",
      },
      {
        id: "borehole",
        name: "Ward Borehole Project",
        description: "Includes: Budget placeholders, 4 milestones, KPIs.",
      },
      {
        id: "road",
        name: "Road Tarmacking (Per KM)",
        description: "Includes: Budget placeholders, 4 milestones, KPIs.",
      },
    ],
  };

  const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const loadState = (): ProjectConfigState => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState;
      const parsed = JSON.parse(raw) as Partial<ProjectConfigState> | null;
      if (!parsed || typeof parsed !== "object") return defaultState;

      const sectors =
        Array.isArray(parsed.sectors)
          ? parsed.sectors
              .filter((s: any) => s && typeof s.id === "string" && typeof s.name === "string")
              .map((s: any) => ({ id: s.id, name: s.name }))
          : defaultState.sectors;

      const stages =
        Array.isArray(parsed.stages)
          ? parsed.stages
              .filter(
                (s: any) =>
                  s &&
                  typeof s.id === "string" &&
                  typeof s.name === "string" &&
                  typeof s.order === "number",
              )
              .map((s: any) => ({ id: s.id, name: s.name, order: s.order }))
          : defaultState.stages;

      const templates =
        Array.isArray(parsed.templates)
          ? parsed.templates
              .filter(
                (t: any) =>
                  t &&
                  typeof t.id === "string" &&
                  typeof t.name === "string" &&
                  typeof t.description === "string",
              )
              .map((t: any) => ({ id: t.id, name: t.name, description: t.description }))
          : defaultState.templates;

      return { sectors, stages, templates };
    } catch {
      return defaultState;
    }
  };

  const [state, setState] = useState<ProjectConfigState>(() => loadState());
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDirty(true);
  }, [state]);

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setDirty(false);
  };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(defaultState);
    setDirty(false);
  };

  const sectorStyles = useMemo(() => {
    const pool = [
      "bg-red-500/10 text-red-600",
      "bg-slate-500/10 text-slate-600",
      "bg-blue-500/10 text-blue-600",
      "bg-cyan-500/10 text-cyan-600",
      "bg-emerald-500/10 text-emerald-600",
      "bg-amber-500/10 text-amber-700",
      "bg-purple-500/10 text-purple-600",
    ];
    return new Map(state.sectors.map((s, idx) => [s.id, pool[idx % pool.length]]));
  }, [state.sectors]);

  const stagesSorted = useMemo(
    () => [...state.stages].sort((a, b) => a.order - b.order),
    [state.stages],
  );

  const [sectorDialogOpen, setSectorDialogOpen] = useState(false);
  const [sectorEditingId, setSectorEditingId] = useState<string | null>(null);
  const [sectorName, setSectorName] = useState("");

  const [stageDialogOpen, setStageDialogOpen] = useState(false);
  const [stageEditingId, setStageEditingId] = useState<string | null>(null);
  const [stageName, setStageName] = useState("");

  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateEditingId, setTemplateEditingId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");

  const [confirmDelete, setConfirmDelete] = useState<null | { kind: "sector" | "stage" | "template"; id: string }>(
    null,
  );

  const openAddSector = () => {
    setSectorEditingId(null);
    setSectorName("");
    setSectorDialogOpen(true);
  };
  const openEditSector = (id: string) => {
    const s = state.sectors.find((x) => x.id === id);
    if (!s) return;
    setSectorEditingId(id);
    setSectorName(s.name);
    setSectorDialogOpen(true);
  };
  const submitSector = () => {
    const name = sectorName.trim();
    if (!name) return;
    setState((prev) => {
      if (sectorEditingId) {
        return {
          ...prev,
          sectors: prev.sectors.map((s) => (s.id === sectorEditingId ? { ...s, name } : s)),
        };
      }
      return { ...prev, sectors: [...prev.sectors, { id: makeId(), name }] };
    });
    setSectorDialogOpen(false);
  };

  const openAddStage = () => {
    setStageEditingId(null);
    setStageName("");
    setStageDialogOpen(true);
  };
  const openEditStage = (id: string) => {
    const s = state.stages.find((x) => x.id === id);
    if (!s) return;
    setStageEditingId(id);
    setStageName(s.name);
    setStageDialogOpen(true);
  };
  const submitStage = () => {
    const name = stageName.trim();
    if (!name) return;
    setState((prev) => {
      if (stageEditingId) {
        return {
          ...prev,
          stages: prev.stages.map((s) => (s.id === stageEditingId ? { ...s, name } : s)),
        };
      }
      const nextOrder = (prev.stages.reduce((m, s) => Math.max(m, s.order), 0) || 0) + 1;
      return { ...prev, stages: [...prev.stages, { id: makeId(), name, order: nextOrder }] };
    });
    setStageDialogOpen(false);
  };
  const moveStage = (id: string, dir: -1 | 1) => {
    setState((prev) => {
      const sorted = [...prev.stages].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((s) => s.id === id);
      if (idx < 0) return prev;
      const swapWith = idx + dir;
      if (swapWith < 0 || swapWith >= sorted.length) return prev;
      const a = sorted[idx];
      const b = sorted[swapWith];
      const updated = prev.stages.map((s) => {
        if (s.id === a.id) return { ...s, order: b.order };
        if (s.id === b.id) return { ...s, order: a.order };
        return s;
      });
      return { ...prev, stages: updated };
    });
  };

  const openAddTemplate = () => {
    setTemplateEditingId(null);
    setTemplateName("");
    setTemplateDescription("");
    setTemplateDialogOpen(true);
  };
  const openEditTemplate = (id: string) => {
    const t = state.templates.find((x) => x.id === id);
    if (!t) return;
    setTemplateEditingId(id);
    setTemplateName(t.name);
    setTemplateDescription(t.description);
    setTemplateDialogOpen(true);
  };
  const submitTemplate = () => {
    const name = templateName.trim();
    const description = templateDescription.trim();
    if (!name) return;
    setState((prev) => {
      if (templateEditingId) {
        return {
          ...prev,
          templates: prev.templates.map((t) =>
            t.id === templateEditingId ? { ...t, name, description } : t,
          ),
        };
      }
      return { ...prev, templates: [...prev.templates, { id: makeId(), name, description }] };
    });
    setTemplateDialogOpen(false);
  };

  const doDelete = () => {
    if (!confirmDelete) return;
    setState((prev) => {
      if (confirmDelete.kind === "sector") {
        return { ...prev, sectors: prev.sectors.filter((s) => s.id !== confirmDelete.id) };
      }
      if (confirmDelete.kind === "stage") {
        return { ...prev, stages: prev.stages.filter((s) => s.id !== confirmDelete.id) };
      }
      return { ...prev, templates: prev.templates.filter((t) => t.id !== confirmDelete.id) };
    });
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Project Configuration</h2>
          <p className="text-muted-foreground text-sm">Manage project categories, sectors, templates, and stages.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={reset} className="shrink-0">
            Reset
          </Button>
          <Button onClick={save} disabled={!dirty} className="shrink-0">
            Save Changes
          </Button>
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
            <Button variant="outline" size="sm" className="h-8 gap-1" onClick={openAddSector}>
              <Plus className="w-3.5 h-3.5" /> Add
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mt-4">
              {state.sectors.map((sector) => (
                <div
                  key={sector.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <FolderTree className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{sector.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={sectorStyles.get(sector.id) || ""}>
                      Sector
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditSector(sector.id)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setConfirmDelete({ kind: "sector", id: sector.id })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
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
                {stagesSorted.map((stage, i) => (
                  <div key={stage.id} className="inline-flex items-center gap-1">
                    <Badge variant="outline" className="px-3 py-1 text-xs">
                      {i + 1}. {stage.name}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => moveStage(stage.id, -1)}
                      disabled={i === 0}
                      aria-label="Move up"
                      title="Move up"
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => moveStage(stage.id, 1)}
                      disabled={i === stagesSorted.length - 1}
                      aria-label="Move down"
                      title="Move down"
                    >
                      ↓
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => openEditStage(stage.id)}
                      aria-label="Edit stage"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => setConfirmDelete({ kind: "stage", id: stage.id })}
                      aria-label="Delete stage"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-primary border border-dashed border-primary"
                  onClick={openAddStage}
                >
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
                 {state.templates.map((template) => (
                   <div key={template.id} className="flex flex-col gap-1 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{template.name}</span>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditTemplate(template.id)}>
                            <Settings className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => setConfirmDelete({ kind: "template", id: template.id })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {template.description || "—"}
                      </span>
                   </div>
                 ))}
                 <Button variant="outline" className="w-full" onClick={openAddTemplate}>
                   <Plus className="w-4 h-4 mr-2" /> Add Template
                 </Button>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sector dialog */}
      <Dialog open={sectorDialogOpen} onOpenChange={setSectorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{sectorEditingId ? "Edit sector" : "Add sector"}</DialogTitle>
            <DialogDescription>These sectors appear across the admin configuration.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="sector-name">Name</Label>
            <Input
              id="sector-name"
              value={sectorName}
              onChange={(e) => setSectorName(e.target.value)}
              placeholder="e.g. Health"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSectorDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitSector}>{sectorEditingId ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stage dialog */}
      <Dialog open={stageDialogOpen} onOpenChange={setStageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{stageEditingId ? "Edit stage" : "Add stage"}</DialogTitle>
            <DialogDescription>Stages are ordered; you can also move them up/down.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="stage-name">Name</Label>
            <Input
              id="stage-name"
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
              placeholder="e.g. Commissioning"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitStage}>{stageEditingId ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{templateEditingId ? "Edit template" : "Add template"}</DialogTitle>
            <DialogDescription>Templates are saved locally for now.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Name</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g. New template"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-desc">Description</Label>
              <Input
                id="template-desc"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="e.g. Includes: budget placeholders, milestones…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitTemplate}>{templateEditingId ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => (!open ? setConfirmDelete(null) : null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove it from your configuration. You can recover by using Reset if you haven’t saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

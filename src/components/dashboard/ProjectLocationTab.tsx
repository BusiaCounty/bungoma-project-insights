import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MapPin,
  Navigation,
  Building2,
  List,
  Map as MapIcon,
  ExternalLink,
  BarChart3,
} from "lucide-react";
import { SUB_COUNTIES, getWards } from "@/data/projects";
import type { Project } from "@/data/projects";
import ProjectLocationMap from "./ProjectLocationMap";
import PaginationControls from "./PaginationControls";
interface ProjectLocationTabProps {
  projects: Project[];
  highlightedId?: string | null;
  onHighlight?: (id: string | null) => void;
}

export default function ProjectLocationTab({
  projects,
  highlightedId: externalHighlightedId,
  onHighlight,
}: ProjectLocationTabProps) {
  const [search, setSearch] = useState("");
  const [filterSubCounty, setFilterSubCounty] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [internalHighlightedId, setInternalHighlightedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Use external highlightedId if provided, otherwise use internal state
  const highlightedId = externalHighlightedId !== undefined ? externalHighlightedId : internalHighlightedId;
  const setHighlightedId = (id: string | null | ((prev: string | null) => string | null)) => {
    if (typeof id === 'function') {
      const functionalUpdate = id as (prev: string | null) => string | null;
      if (onHighlight) {
        onHighlight(functionalUpdate(highlightedId));
      } else {
        setInternalHighlightedId(prev => functionalUpdate(prev));
      }
    } else {
      if (onHighlight) {
        onHighlight(id);
      } else {
        setInternalHighlightedId(id);
      }
    }
  };

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.ward.toLowerCase().includes(search.toLowerCase()) ||
        p.sub_county.toLowerCase().includes(search.toLowerCase());
      const matchesSubCounty =
        filterSubCounty === "all" || p.sub_county === filterSubCounty;
      const matchesStatus = filterStatus === "all" || p.status === filterStatus;
      return matchesSearch && matchesSubCounty && matchesStatus;
    });
  }, [projects, search, filterSubCounty, filterStatus]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [search, filterSubCounty, filterStatus]);

  // Paginated projects for list view
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize);
  }, [filtered, currentPage, pageSize]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  const mappedCount = filtered.filter(
    (p) => p.latitude != null && p.longitude != null,
  ).length;
  const unmappedCount = filtered.length - mappedCount;

  // Group by sub-county for distribution stats
  const subCountyStats = useMemo(() => {
    const stats: Record<string, { total: number; mapped: number }> = {};
    filtered.forEach((p) => {
      if (!stats[p.sub_county]) stats[p.sub_county] = { total: 0, mapped: 0 };
      stats[p.sub_county].total += 1;
      if (p.latitude != null && p.longitude != null) {
        stats[p.sub_county].mapped += 1;
      }
    });
    return Object.entries(stats).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const statusColor = (s: string) => {
    if (s === "Completed") return "bg-emerald-500/10 text-emerald-600";
    if (s === "Ongoing") return "bg-blue-500/10 text-blue-600";
    return "bg-amber-500/10 text-amber-600";
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">
                {filtered.length}
              </p>
              <p className="text-[11px] text-muted-foreground font-medium">
                Total Projects
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center">
              <Navigation className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">
                {mappedCount}
              </p>
              <p className="text-[11px] text-muted-foreground font-medium">
                With GPS
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">
                {unmappedCount}
              </p>
              <p className="text-[11px] text-muted-foreground font-medium">
                No GPS
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">
                {subCountyStats.length}
              </p>
              <p className="text-[11px] text-muted-foreground font-medium">
                Sub-Counties
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by project name, ward, or sub-county..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterSubCounty} onValueChange={setFilterSubCounty}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Sub-Counties" />
          </SelectTrigger>
          <SelectContent className="z-[2000]">
            <SelectItem value="all">All Sub-Counties</SelectItem>
            {SUB_COUNTIES.map((sc) => (
              <SelectItem key={sc} value={sc}>
                {sc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="z-[2000]">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Ongoing">Ongoing</SelectItem>
            <SelectItem value="Stalled">Stalled</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-1 shrink-0">
          <Button
            variant={viewMode === "map" ? "default" : "outline"}
            size="icon"
            className="h-10 w-10"
            onClick={() => setViewMode("map")}
          >
            <MapIcon className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            className="h-10 w-10"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      {viewMode === "map" ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          {/* Map */}
          <ProjectLocationMap
            projects={filtered}
            highlightedId={highlightedId}
            onProjectClick={(p) => setHighlightedId(prev => prev === p.id ? null : p.id)}
            className="h-[550px]"
          />

          {/* Sidebar project list */}
          <Card className="border-border shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Projects by Location
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[480px] overflow-y-auto divide-y divide-border">
                {subCountyStats.map(([subCounty, stats]) => (
                  <div key={subCounty} className="px-3 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-bold text-foreground">
                          {subCounty}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className="text-[10px] py-0">
                          {stats.total}
                        </Badge>
                        {stats.mapped > 0 && (
                          <Badge
                            variant="outline"
                            className="text-[10px] py-0 text-emerald-600 border-emerald-200 bg-emerald-50"
                          >
                            <Navigation className="w-2.5 h-2.5 mr-0.5" />{" "}
                            {stats.mapped}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1 pl-5">
                      {filtered
                        .filter((p) => p.sub_county === subCounty)
                        .slice(0, 8)
                        .map((project) => (
                          <button
                            key={project.id}
                            onClick={() => setHighlightedId(prev => prev === project.id ? null : project.id)}
                            className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md transition-all text-[11px] group ${
                              highlightedId === project.id
                                ? "bg-primary/10 border border-primary/20"
                                : "hover:bg-muted/50 border border-transparent"
                            }`}
                          >
                            <MapPin
                              className={`w-3 h-3 shrink-0 ${
                                project.latitude != null
                                  ? "text-emerald-500"
                                  : "text-muted-foreground/40"
                              }`}
                            />
                            <span className="truncate font-medium text-foreground">
                              {project.name}
                            </span>
                            <Badge
                              variant="secondary"
                              className={`ml-auto text-[9px] py-0 shrink-0 ${statusColor(project.status)}`}
                            >
                              {project.status}
                            </Badge>
                          </button>
                        ))}
                      {filtered.filter((p) => p.sub_county === subCounty)
                        .length > 8 && (
                        <p className="text-[10px] text-muted-foreground pl-5 py-1">
                          +
                          {filtered.filter((p) => p.sub_county === subCounty)
                            .length - 8}{" "}
                          more
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* List view */
        <Card className="border-border shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {paginatedProjects.length === 0 ? (
                <div className="py-16 text-center text-sm text-muted-foreground">
                  No projects match your filters.
                </div>
              ) : (
                paginatedProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors group"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        project.latitude != null
                          ? "bg-emerald-500/10"
                          : "bg-muted"
                      }`}
                    >
                      <MapPin
                        className={`w-5 h-5 ${
                          project.latitude != null
                            ? "text-emerald-600"
                            : "text-muted-foreground/40"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {project.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {project.ward}, {project.sub_county}
                        </span>
                        {project.latitude != null &&
                          project.longitude != null && (
                            <span className="text-[10px] text-emerald-600 font-mono bg-emerald-50 px-1.5 py-0.5 rounded">
                              {project.latitude.toFixed(4)}°,{" "}
                              {project.longitude.toFixed(4)}°
                            </span>
                          )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${statusColor(project.status)}`}
                      >
                        {project.status}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {project.sector.length > 20
                          ? project.sector.slice(0, 20) + "…"
                          : project.sector}
                      </Badge>
                      {project.latitude != null &&
                        project.longitude != null && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              window.open(
                                `https://www.google.com/maps?q=${project.latitude},${project.longitude}`,
                                "_blank",
                              );
                            }}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              startIndex={(currentPage - 1) * pageSize}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              pageSizeOptions={[10, 25, 50]}
              onPageSizeChange={setPageSize}
            />
          </CardContent>
        </Card>
      )}

      {/* Sub-county distribution bar */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            GPS Coverage by Sub-County
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {subCountyStats.map(([name, stats]) => {
              const pct =
                stats.total > 0
                  ? Math.round((stats.mapped / stats.total) * 100)
                  : 0;
              return (
                <div key={name} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-foreground truncate">
                      {name}
                    </span>
                    <span className="text-muted-foreground font-bold tabular-nums">
                      {stats.mapped}/{stats.total}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background:
                          pct === 100
                            ? "linear-gradient(90deg, #10b981, #34d399)"
                            : pct > 50
                              ? "linear-gradient(90deg, #3b82f6, #60a5fa)"
                              : "linear-gradient(90deg, #f59e0b, #fbbf24)",
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {pct}% mapped
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

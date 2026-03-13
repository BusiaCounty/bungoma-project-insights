import { useState } from "react";
import { Pencil, Trash2, PlusCircle, Download } from "lucide-react";
import type { Project } from "@/data/projects";
import ProjectFormModal from "./ProjectFormModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { createProject, updateProject, deleteProject } from "@/data/projects";
import { useQueryClient } from "@tanstack/react-query";
import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "./PaginationControls";

interface ProjectsTableProps {
  projects: Project[];
  isAdmin?: boolean;
}

const statusClass: Record<string, string> = {
  Completed: "bg-success/10 text-success",
  Ongoing: "bg-primary/10 text-primary",
  Stalled: "bg-stalled/10 text-stalled",
};

type ModalState =
  | { type: "add" }
  | { type: "edit"; project: Project }
  | { type: "delete"; project: Project }
  | null;

const PAGE_SIZE_OPTIONS = [10, 15, 25, 50];

const ProjectsTable = ({ projects, isAdmin = false }: ProjectsTableProps) => {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<ModalState>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { currentPage, totalPages, paginatedItems, setCurrentPage, totalItems, startIndex, pageSize, setPageSize } =
    usePagination(projects, 15);

  const exportData = (format: "csv" | "excel") => {
    if (!projects.length) return;
    const headers = [
      "#",
      "Project Name",
      "Sub County",
      "Ward",
      "Sector",
      "Status",
      "Budget (KES)",
      "FY",
      "Progress (%)",
      "Projected Cost (KES)",
      "Actual Spend (KES)",
    ];
    const rows = projects.map((p, i) => [
      i + 1,
      p.name,
      p.sub_county,
      p.ward,
      p.sector,
      p.status,
      p.budget,
      p.fy,
      p.progress,
      p.projected_cost ?? "",
      p.actual_spend ?? 0,
    ]);

    if (format === "csv") {
      const csvContent = [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bungoma_projects.csv";
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const csvContent = [headers.join("\t"), ...rows.map(r => r.join("\t"))].join("\n");
      const blob = new Blob([csvContent], { type: "application/vnd.ms-excel" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bungoma_projects.xls";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleSave = async (data: Parameters<typeof createProject>[0]) => {
    if (modal?.type === "edit") {
      await updateProject(modal.project.id, data);
    } else {
      await createProject(data);
    }
    await queryClient.invalidateQueries({ queryKey: ["projects"] });
  };

  const handleDelete = async () => {
    if (modal?.type === "delete") {
      await deleteProject(modal.project.id);
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
  };

  const columnCount = isAdmin ? 11 : 10;

  return (
    <>
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Project Details
            </h3>
            <p className="text-[10px] text-muted-foreground">
              {projects.length} projects found
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportData("csv")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-muted/50 text-foreground text-xs font-bold hover:bg-muted active:scale-[0.98] transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
            <button
              onClick={() => exportData("excel")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-muted/50 text-foreground text-xs font-bold hover:bg-muted active:scale-[0.98] transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Excel
            </button>
            {isAdmin && (
              <button
                onClick={() => setModal({ type: "add" })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs font-bold shadow hover:opacity-90 active:scale-[0.98] transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add Project
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                {[
                  "#",
                  "Project Name",
                  "Sub County",
                  "Ward",
                  "Sector",
                  "Status",
                  "Budget (KES)",
                  "FY",
                  "Progress",
                  "More Details",
                  ...(isAdmin ? ["Actions"] : []),
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((p, i) => (
                <>
                  <tr
                    key={p.id}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 py-2 text-muted-foreground">
                      {startIndex + i + 1}
                    </td>
                    <td className="px-3 py-2 font-medium max-w-[220px] truncate">
                      {p.name}
                    </td>
                    <td className="px-3 py-2">{p.sub_county}</td>
                    <td className="px-3 py-2">{p.ward}</td>
                    <td className="px-3 py-2 max-w-[160px] truncate">
                      {p.sector}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusClass[p.status] || ""}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-medium">
                      {Number(p.budget).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">{p.fy}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${p.progress}%`,
                              backgroundColor:
                                p.status === "Completed"
                                  ? "hsl(142 71% 45%)"
                                  : p.status === "Stalled"
                                    ? "hsl(0 80% 25%)"
                                    : undefined,
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {p.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId((current) =>
                            current === p.id ? null : p.id,
                          )
                        }
                        className="text-[11px] font-semibold text-primary hover:underline"
                      >
                        {expandedId === p.id ? "Hide details" : "More details"}
                      </button>
                    </td>
                    {isAdmin && (
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setModal({ type: "edit", project: p })}
                            className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                            title="Edit project"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setModal({ type: "delete", project: p })
                            }
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Delete project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                  {expandedId === p.id && (
                    <tr className="bg-muted/40">
                      <td
                        className="px-3 py-3 text-[11px] text-muted-foreground"
                        colSpan={columnCount}
                      >
                        <div className="flex flex-wrap gap-4">
                          <div>
                            <div className="font-semibold text-foreground text-[11px]">
                              Description
                            </div>
                            <div className="text-[11px]">
                              {p.description || "No description provided."}
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-foreground text-[11px]">
                              Financials
                            </div>
                            <div className="text-[11px]">
                              <span className="mr-3">
                                Budget:{" "}
                                <span className="font-semibold">
                                  {Number(p.budget).toLocaleString()}
                                </span>
                              </span>
                              <span className="mr-3">
                                Projected Cost:{" "}
                                <span className="font-semibold">
                                  {p.projected_cost != null
                                    ? Number(p.projected_cost).toLocaleString()
                                    : "N/A"}
                                </span>
                              </span>
                              <span>
                                Actual Spend:{" "}
                                <span className="font-semibold">
                                  {p.actual_spend != null
                                    ? Number(p.actual_spend).toLocaleString()
                                    : "0"}
                                </span>
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-foreground text-[11px]">
                              Location & Period
                            </div>
                            <div className="text-[11px]">
                              {p.sub_county} &middot; {p.ward} &middot; FY{" "}
                              {p.fy}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td
                    colSpan={columnCount}
                    className="text-center py-10 text-xs text-muted-foreground"
                  >
                    No projects match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          startIndex={startIndex}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Modals */}
      {(modal?.type === "add" || modal?.type === "edit") && (
        <ProjectFormModal
          project={modal.type === "edit" ? modal.project : null}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === "delete" && (
        <DeleteConfirmModal
          projectName={modal.project.name}
          onConfirm={handleDelete}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
};

export default ProjectsTable;

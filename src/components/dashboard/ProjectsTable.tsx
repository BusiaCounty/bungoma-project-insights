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

const PROJECTS_PER_PAGE = 15;

const ProjectsTable = ({ projects, isAdmin = false }: ProjectsTableProps) => {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<ModalState>(null);
  const { currentPage, totalPages, paginatedItems, setCurrentPage, totalItems, startIndex } =
    usePagination(projects, PROJECTS_PER_PAGE);

  const exportData = (format: "csv" | "excel") => {
    if (!projects.length) return;
    const headers = ["#", "Project Name", "Sub County", "Ward", "Sector", "Status", "Budget (KES)", "FY", "Progress (%)"];
    const rows = projects.map((p, i) => [
      i + 1, p.name, p.sub_county, p.ward, p.sector, p.status, p.budget, p.fy, p.progress,
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
                <tr
                  key={p.id}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-3 py-2 text-muted-foreground">{startIndex + i + 1}</td>
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
              ))}
              {projects.length === 0 && (
                <tr>
                  <td
                    colSpan={isAdmin ? 10 : 9}
                    className="text-center py-10 text-xs text-muted-foreground"
                  >
                    No projects match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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

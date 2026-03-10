import { useState, useEffect } from "react";
import { X, Save, FolderPlus, Pencil } from "lucide-react";
import {
  type Project,
  SUB_COUNTIES,
  SECTORS,
  STATUSES,
  FINANCIAL_YEARS,
  getWards,
} from "@/data/projects";

type ProjectFormData = {
  name: string;
  sub_county: string;
  ward: string;
  sector: string;
  status: "Completed" | "Ongoing" | "Stalled";
  budget: number;
  fy: string;
  progress: number;
  description: string;
};

interface ProjectFormModalProps {
  project?: Project | null;
  onSave: (data: ProjectFormData) => Promise<void>;
  onClose: () => void;
}

const defaultForm: ProjectFormData = {
  name: "",
  sub_county: SUB_COUNTIES[0],
  ward: "",
  sector: SECTORS[0],
  status: "Ongoing",
  budget: 0,
  fy: FINANCIAL_YEARS[FINANCIAL_YEARS.length - 1],
  progress: 0,
  description: "",
};

const ProjectFormModal = ({
  project,
  onSave,
  onClose,
}: ProjectFormModalProps) => {
  const isEdit = !!project;
  const [form, setForm] = useState<ProjectFormData>(defaultForm);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wards = getWards(form.sub_county);

  useEffect(() => {
    if (project) {
      setForm({
        name: project.name,
        sub_county: project.sub_county,
        ward: project.ward,
        sector: project.sector,
        status: project.status as "Completed" | "Ongoing" | "Stalled",
        budget: project.budget,
        fy: project.fy,
        progress: project.progress,
        description: project.description ?? "",
      });
    } else {
      setForm(defaultForm);
    }
  }, [project]);

  const set = <K extends keyof ProjectFormData>(
    key: K,
    value: ProjectFormData[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubCountyChange = (v: string) => {
    setForm((f) => ({ ...f, sub_county: v, ward: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save project.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all";
  const labelClass = "text-xs font-semibold text-foreground";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-border shadow-2xl my-8 overflow-hidden"
        style={{
          background: "hsl(var(--card))",
          animation: "modal-in 0.22s cubic-bezier(.4,0,.2,1)",
        }}
      >
        {/* Top gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-primary" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted/50"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-8 py-6">
          {/* Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
              {isEdit ? (
                <Pencil className="w-5 h-5 text-primary-foreground" />
              ) : (
                <FolderPlus className="w-5 h-5 text-primary-foreground" />
              )}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-foreground">
                {isEdit ? "Edit Project" : "Add New Project"}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                {isEdit
                  ? "Update project details below"
                  : "Fill in the details for the new project"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Project Name */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClass} htmlFor="proj-name">
                Project Name *
              </label>
              <input
                id="proj-name"
                type="text"
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Matayos Health Centre Construction"
                className={inputClass}
              />
            </div>

            {/* Sub County + Ward (2-col) */}
            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor="proj-subcounty">
                  Sub County *
                </label>
                <select
                  id="proj-subcounty"
                  required
                  value={form.sub_county}
                  onChange={(e) => handleSubCountyChange(e.target.value)}
                  className={inputClass}
                >
                  {SUB_COUNTIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor="proj-ward">
                  Ward *
                </label>
                <select
                  id="proj-ward"
                  required
                  value={form.ward}
                  onChange={(e) => set("ward", e.target.value)}
                  className={inputClass}
                >
                  <option value="">-- Select Ward --</option>
                  {wards.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sector */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClass} htmlFor="proj-sector">
                Sector *
              </label>
              <select
                id="proj-sector"
                required
                value={form.sector}
                onChange={(e) => set("sector", e.target.value)}
                className={inputClass}
              >
                {SECTORS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Status + FY (2-col) */}
            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor="proj-status">
                  Status *
                </label>
                <select
                  id="proj-status"
                  required
                  value={form.status}
                  onChange={(e) =>
                    set(
                      "status",
                      e.target.value as "Completed" | "Ongoing" | "Stalled",
                    )
                  }
                  className={inputClass}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor="proj-fy">
                  Financial Year *
                </label>
                <select
                  id="proj-fy"
                  required
                  value={form.fy}
                  onChange={(e) => set("fy", e.target.value)}
                  className={inputClass}
                >
                  {FINANCIAL_YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Budget + Progress (2-col) */}
            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor="proj-budget">
                  Budget (KES) *
                </label>
                <input
                  id="proj-budget"
                  type="number"
                  required
                  min={0}
                  value={form.budget}
                  onChange={(e) => set("budget", Number(e.target.value))}
                  placeholder="e.g. 5000000"
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor="proj-progress">
                  Progress (%) *
                </label>
                <div className="relative">
                  <input
                    id="proj-progress"
                    type="number"
                    required
                    min={0}
                    max={100}
                    value={form.progress}
                    onChange={(e) =>
                      set(
                        "progress",
                        Math.min(100, Math.max(0, Number(e.target.value))),
                      )
                    }
                    className={inputClass}
                  />
                  <div className="mt-1 w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${form.progress}%`,
                        background:
                          form.status === "Completed"
                            ? "hsl(142 71% 45%)"
                            : form.status === "Stalled"
                              ? "hsl(0 80% 45%)"
                              : "hsl(var(--primary))",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClass} htmlFor="proj-desc">
                Description
              </label>
              <textarea
                id="proj-desc"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                placeholder="Brief description of the project…"
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-2 justify-end mt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs font-bold shadow-md hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="w-3.5 h-3.5 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {isLoading
                  ? "Saving…"
                  : isEdit
                    ? "Save Changes"
                    : "Add Project"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ProjectFormModal;

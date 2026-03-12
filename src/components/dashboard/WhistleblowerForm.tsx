import { useState } from "react";
import { ShieldAlert, Send } from "lucide-react";
import { toast } from "sonner";
import { submitWhistleblowerReport } from "@/data/projects";

const WhistleblowerForm = () => {
  const [form, setForm] = useState({ project_name: "", sub_county: "", description: "", evidence: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim()) {
      toast.error("Please provide a description");
      return;
    }
    setSubmitting(true);
    try {
      await submitWhistleblowerReport({
        project_name: form.project_name || null,
        sub_county: form.sub_county || null,
        description: form.description,
        evidence: form.evidence || null,
      });
      toast.success("Report submitted confidentially. Thank you for your vigilance.");
      setForm({ project_name: "", sub_county: "", description: "", evidence: "" });
    } catch {
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full h-9 rounded-lg border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6 text-destructive" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Confidential Whistleblower Report</h3>
          <p className="text-xs text-muted-foreground">All reports are anonymous and encrypted</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-muted-foreground">Project Name (optional)</label>
            <input className={inputClass} value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} placeholder="e.g. Road Grading - Matayos" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-muted-foreground">Sub County (optional)</label>
            <input className={inputClass} value={form.sub_county} onChange={(e) => setForm({ ...form, sub_county: e.target.value })} placeholder="e.g. Butula" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-muted-foreground">Description *</label>
          <textarea
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[120px] resize-y"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the issue, concern or irregularity..."
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-muted-foreground">Evidence / Links (optional)</label>
          <input className={inputClass} value={form.evidence} onChange={(e) => setForm({ ...form, evidence: e.target.value })} placeholder="Paste links to photos, documents..." />
        </div>
        <button type="submit" disabled={submitting} className="h-10 px-6 rounded-lg bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
          <Send className="w-4 h-4" /> {submitting ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
};

export default WhistleblowerForm;

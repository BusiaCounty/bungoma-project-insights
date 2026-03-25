import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Search,
  Loader2,
  ShieldCheck,
  Copy,
  CheckCheck,
  Hash,
  ArrowRight,
} from "lucide-react";
import type { Project } from "@/data/projects";
import { lookupFeedbackByTracking, fetchFeedbackReplies } from "@/data/projects";
import ProjectFeedbackPanel from "./ProjectFeedbackPanel";
import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "./PaginationControls";
import StarRating from "./StarRating";

interface StatusFeedbackProps {
  projects: Project[];
}

const statusMeta: Record<
  string,
  {
    icon: React.ElementType;
    color: string;
    bg: string;
    border: string;
    label: string;
  }
> = {
  Completed: {
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/5",
    border: "border-success/15",
    label: "Completed",
  },
  Ongoing: {
    icon: Clock,
    color: "text-primary",
    bg: "bg-primary/5",
    border: "border-primary/15",
    label: "Ongoing",
  },
  Stalled: {
    icon: AlertTriangle,
    color: "text-stalled",
    bg: "bg-stalled/5",
    border: "border-stalled/15",
    label: "Stalled",
  },
};

const progressColor: Record<string, string> = {
  Completed: "hsl(142 71% 45%)",
  Stalled: "hsl(0 80% 45%)",
  Ongoing: "hsl(var(--primary))",
};

const ITEMS_PER_PAGE = 10;

const feedbackStatusMeta: Record<string, { color: string; bg: string; label: string }> = {
  New: { color: "text-blue-700 dark:text-blue-300", bg: "bg-blue-100 dark:bg-blue-900/30", label: "New" },
  "Under Review": { color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-100 dark:bg-amber-900/30", label: "Under Review" },
  "In Progress": { color: "text-purple-700 dark:text-purple-300", bg: "bg-purple-100 dark:bg-purple-900/30", label: "In Progress" },
  Resolved: { color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-100 dark:bg-emerald-900/30", label: "Resolved" },
};

/* ─── Feedback Tracker Component ────────────────────────────── */
const FeedbackTracker = () => {
  const [trackingInput, setTrackingInput] = useState("");
  const [searchTrigger, setSearchTrigger] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    data: result,
    isLoading,
    isError,
    isFetched,
  } = useQuery({
    queryKey: ["feedback-track", searchTrigger],
    queryFn: () => lookupFeedbackByTracking(searchTrigger!),
    enabled: !!searchTrigger,
    retry: false,
  });

  const { data: replies = [], isLoading: repliesLoading } = useQuery({
    queryKey: ["feedback-replies", result?.id],
    queryFn: () => fetchFeedbackReplies(result!.id),
    enabled: !!result?.id,
  });

  const adminReplies = replies.filter((r: any) => r.is_admin);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const val = trackingInput.trim().toUpperCase();
    if (val) setSearchTrigger(val);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const statusInfo = result ? feedbackStatusMeta[result.status || "New"] || feedbackStatusMeta.New : null;

  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
        <Hash className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground flex-1">Track Your Feedback</h3>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-[11px] text-muted-foreground">
          Enter your tracking number (e.g. <code className="text-[10px] bg-muted/60 px-1 py-0.5 rounded font-mono">FB-26-000001</code>) to check the status and see any admin replies.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value.toUpperCase())}
              placeholder="FB-26-000001"
              maxLength={20}
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-background text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all tracking-wider"
            />
          </div>
          <button
            type="submit"
            disabled={!trackingInput.trim() || isLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs font-bold shadow hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5" />
            )}
            Track
          </button>
        </form>

        {/* Results */}
        {isLoading && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        )}

        {isFetched && !isLoading && !result && searchTrigger && (
          <div className="bg-stalled/5 border border-stalled/20 rounded-lg px-4 py-3 text-center" style={{ animation: "feedback-expand 0.2s ease" }}>
            <AlertTriangle className="w-5 h-5 text-stalled mx-auto mb-1" />
            <p className="text-xs font-semibold text-stalled">No feedback found</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Please check your tracking number and try again.
            </p>
          </div>
        )}

        {isError && (
          <div className="bg-stalled/5 border border-stalled/20 rounded-lg px-4 py-3 text-center" style={{ animation: "feedback-expand 0.2s ease" }}>
            <p className="text-xs font-semibold text-stalled">Something went wrong. Please try again.</p>
          </div>
        )}

        {result && statusInfo && (
          <div className="space-y-3" style={{ animation: "feedback-expand 0.2s ease" }}>
            {/* Feedback details card */}
            <div className="bg-muted/20 border border-border rounded-xl p-4 space-y-3">
              {/* Header with tracking # and status */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono font-bold text-foreground bg-muted/60 px-2 py-0.5 rounded-md tracking-wider">
                    {result.tracking_number}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy(result.tracking_number!)}
                    className="text-[10px] text-primary hover:text-primary/80 transition-colors"
                    title="Copy"
                  >
                    {copied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>

              {/* Feedback content */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Author</p>
                    <p className="text-[11px] font-medium text-foreground">{result.author_name || "Anonymous"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Submitted</p>
                    <p className="text-[11px] font-medium text-foreground">
                      {new Date(result.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                {result.rating && (
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Rating</p>
                    <StarRating value={result.rating} readOnly size="sm" />
                  </div>
                )}
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Your Comment</p>
                  <p className="text-[11px] text-foreground leading-relaxed bg-background/60 border border-border/40 rounded-lg px-3 py-2">
                    {result.comment}
                  </p>
                </div>
              </div>

              {/* Status progress indicator */}
              <div className="pt-2 border-t border-border/40">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Progress</p>
                <div className="flex items-center gap-1">
                  {["New", "Under Review", "In Progress", "Resolved"].map((step, i, arr) => {
                    const stepIdx = arr.indexOf(result.status || "New");
                    const isActive = i <= stepIdx;
                    const isCurrent = i === stepIdx;
                    return (
                      <div key={step} className="flex items-center gap-1 flex-1">
                        <div
                          className={`flex items-center justify-center w-5 h-5 rounded-full text-[8px] font-bold shrink-0 transition-all ${
                            isCurrent
                              ? "bg-primary text-primary-foreground ring-2 ring-primary/30 scale-110"
                              : isActive
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {isActive ? "✓" : i + 1}
                        </div>
                        {i < arr.length - 1 && (
                          <div className={`flex-1 h-0.5 rounded-full ${isActive ? "bg-primary/30" : "bg-muted"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-1">
                  {["New", "Review", "Progress", "Resolved"].map((label) => (
                    <span key={label} className="text-[7px] text-muted-foreground font-medium text-center flex-1">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Admin Replies */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                Admin Replies
              </h4>

              {repliesLoading ? (
                <div className="flex justify-center py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              ) : adminReplies.length > 0 ? (
                <div className="space-y-2">
                  {adminReplies.map((r: any) => (
                    <div
                      key={r.id}
                      className="bg-primary/5 border border-primary/15 rounded-xl px-4 py-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> {r.author_name || "Admin"}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString("en-KE", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-foreground leading-relaxed">{r.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-muted/20 border border-border/50 rounded-lg px-4 py-3">
                  <p className="text-[10px] text-muted-foreground italic text-center">
                    No admin replies yet. Your feedback is being reviewed. Check back later.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Status Group Component ────────────────────────────────── */
interface StatusGroupProps {
  status: "Completed" | "Ongoing" | "Stalled";
  items: Project[];
  expandedProject: string | null;
  toggleProject: (id: string) => void;
}

const StatusGroup = ({ status, items, expandedProject, toggleProject }: StatusGroupProps) => {
  const meta = statusMeta[status];
  const Icon = meta.icon;
  const { currentPage, totalPages, paginatedItems, setCurrentPage, totalItems, startIndex } =
    usePagination(items, ITEMS_PER_PAGE);

  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
      <div className={`flex items-center gap-2 px-4 py-3 border-b border-border ${meta.bg}`}>
        <Icon className={`w-4 h-4 ${meta.color}`} />
        <h3 className="text-sm font-bold text-foreground flex-1">
          {meta.label} Projects
        </h3>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.color} ${meta.bg} ${meta.border}`}
        >
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-[11px] text-muted-foreground px-4 py-4 italic">
          No {status.toLowerCase()} projects match the current filters.
        </p>
      ) : (
        <>
          <div className="divide-y divide-border/50">
            {paginatedItems.map((p) => {
              const isExpanded = expandedProject === p.id;
              return (
                <div key={p.id} className="transition-colors hover:bg-muted/20">
                  <button
                    type="button"
                    onClick={() => toggleProject(p.id)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 group"
                    aria-expanded={isExpanded}
                    aria-controls={`feedback-${p.id}`}
                  >
                    <div className="relative w-8 h-8 shrink-0" title={`${p.progress}% complete`}>
                      <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                        <circle cx="16" cy="16" r="13" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                        <circle
                          cx="16" cy="16" r="13" fill="none"
                          stroke={progressColor[p.status]}
                          strokeWidth="3"
                          strokeDasharray={`${(p.progress / 100) * 81.7} 81.7`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span
                        className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-foreground"
                        style={{ color: progressColor[p.status] }}
                      >
                        {p.progress}%
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {p.ward} · {p.sub_county} · {p.fy}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-muted-foreground hidden sm:block truncate max-w-[120px]">
                        {p.sector.split(",")[0]}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div id={`feedback-${p.id}`} className="px-4 pb-4" style={{ animation: "feedback-expand 0.2s ease" }}>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                        {[
                          { label: "Budget", value: `KES ${Number(p.budget).toLocaleString()}` },
                          { label: "Financial Year", value: p.fy },
                          { label: "Sector", value: p.sector.length > 40 ? p.sector.slice(0, 40) + "…" : p.sector },
                          { label: "Description", value: p.description || "No description provided." },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-muted/40 rounded-lg px-3 py-2 col-span-1 last:col-span-2 sm:last:col-span-1">
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">{label}</p>
                            <p className="text-[11px] font-medium text-foreground break-words">{value}</p>
                          </div>
                        ))}
                      </div>
                      <ProjectFeedbackPanel project={p} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            startIndex={startIndex}
            pageSize={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

/* ─── Main StatusFeedback Component ─────────────────────────── */
const StatusFeedback = ({ projects }: StatusFeedbackProps) => {
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const grouped = {
    Completed: projects.filter((p) => p.status === "Completed"),
    Ongoing: projects.filter((p) => p.status === "Ongoing"),
    Stalled: projects.filter((p) => p.status === "Stalled"),
  };

  const toggleProject = (id: string) =>
    setExpandedProject((prev) => (prev === id ? null : id));

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
        <MessageSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-foreground">Citizen Feedback</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Click on any project below to view its progress details and leave a
            rating or comment. After submitting, you'll receive a tracking number
            to monitor your feedback status and see admin replies.
          </p>
        </div>
      </div>

      {/* Feedback Tracker */}
      <FeedbackTracker />

      {(["Ongoing", "Stalled", "Completed"] as const).map((status) => (
        <StatusGroup
          key={status}
          status={status}
          items={grouped[status]}
          expandedProject={expandedProject}
          toggleProject={toggleProject}
        />
      ))}

      <style>{`
        @keyframes feedback-expand {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default StatusFeedback;

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquarePlus,
  Loader2,
  Send,
  UserCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCheck,
  ShieldCheck,
} from "lucide-react";
import { fetchFeedback, submitFeedback, fetchFeedbackReplies } from "@/data/projects";
import type { Project } from "@/data/projects";
import StarRating from "./StarRating";

interface ProjectFeedbackPanelProps {
  project: Project;
}

const ProjectFeedbackPanel = ({ project }: ProjectFeedbackPanelProps) => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [submittedTracking, setSubmittedTracking] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: feedbackList = [], isLoading: feedbackLoading } = useQuery({
    queryKey: ["feedback", project.id],
    queryFn: () => fetchFeedback(project.id),
  });

  const { mutate: submit, isPending } = useMutation({
    mutationFn: () =>
      submitFeedback({
        project_id: project.id,
        author_name: name.trim() || "Anonymous",
        comment: comment.trim(),
        rating: rating || null,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["feedback", project.id] });
      setName("");
      setComment("");
      setRating(0);
      setShowForm(false);
      setSubmittedTracking(data?.tracking_number || null);
    },
  });

  const avgRating =
    feedbackList.length > 0
      ? feedbackList.reduce((s, f) => s + (f.rating ?? 0), 0) /
        feedbackList.filter((f) => f.rating).length
      : 0;

  const ratedCount = feedbackList.filter((f) => f.rating).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    submit();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="mt-3 border-t border-border/60 pt-3 space-y-3">
      {/* Feedback summary row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <StarRating value={Math.round(avgRating)} readOnly size="sm" />
          <span className="text-[10px] text-muted-foreground">
            {ratedCount > 0
              ? `${avgRating.toFixed(1)} / 5 · ${ratedCount} rating${ratedCount > 1 ? "s" : ""}`
              : "No ratings yet"}
          </span>
          {feedbackList.length > 0 && (
            <span className="text-[10px] bg-muted/60 px-1.5 py-0.5 rounded-full text-muted-foreground font-medium">
              {feedbackList.length} comment{feedbackList.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => { setShowForm((v) => !v); setSubmittedTracking(null); }}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          <MessageSquarePlus className="w-3.5 h-3.5" />
          {showForm ? "Cancel" : "Leave Feedback"}
          {showForm ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Tracking number success toast */}
      {submittedTracking && (
        <div
          className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-4 py-3 space-y-2"
          style={{ animation: "fade-slide-in 0.2s ease" }}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              Feedback Submitted Successfully!
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Your tracking number is:
          </p>
          <div className="flex items-center gap-2">
            <code className="bg-background border border-border px-3 py-1.5 rounded-lg text-sm font-mono font-bold text-foreground tracking-wider select-all">
              {submittedTracking}
            </code>
            <button
              type="button"
              onClick={() => handleCopy(submittedTracking)}
              className="flex items-center gap-1 text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded-md bg-primary/5 hover:bg-primary/10"
              title="Copy tracking number"
            >
              {copied ? (
                <><CheckCheck className="w-3 h-3" /> Copied!</>
              ) : (
                <><Copy className="w-3 h-3" /> Copy</>
              )}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Save this number to track your feedback status and see admin replies.
            Use the <strong>"Track Feedback"</strong> section at the top of this tab.
          </p>
        </div>
      )}

      {/* Feedback submission form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-muted/30 border border-border rounded-xl p-4 space-y-3"
          style={{ animation: "fade-slide-in 0.18s ease" }}
        >
          <p className="text-[11px] font-bold text-foreground">
            Share your experience with this project
          </p>

          {/* Star rating */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              Your Rating
            </label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor={`name-${project.id}`}
              className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide"
            >
              Your Name (optional)
            </label>
            <input
              id={`name-${project.id}`}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Wanjala"
              maxLength={80}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>

          {/* Comment */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor={`comment-${project.id}`}
              className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide"
            >
              Comment *
            </label>
            <textarea
              id={`comment-${project.id}`}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Share what you have observed about this project…"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
            />
            <p className="text-[9px] text-muted-foreground text-right">
              {comment.length}/500
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending || !comment.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs font-bold shadow hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            {isPending ? "Submitting…" : "Submit Feedback"}
          </button>
        </form>
      )}

      {/* Existing feedback list */}
      {feedbackLoading ? (
        <div className="flex justify-center py-3">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      ) : feedbackList.length > 0 ? (
        <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
          {feedbackList.map((f) => (
            <FeedbackItem key={f.id} feedback={f} />
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground italic px-1">
          No feedback yet. Be the first to comment!
        </p>
      )}

      <style>{`
        @keyframes fade-slide-in {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

/* Individual feedback item showing admin replies inline */
function FeedbackItem({ feedback: f }: { feedback: any }) {
  const [showReplies, setShowReplies] = useState(false);

  const { data: replies = [], isLoading } = useQuery({
    queryKey: ["feedback-replies", f.id],
    queryFn: () => fetchFeedbackReplies(f.id),
    enabled: showReplies,
  });

  const adminReplies = replies.filter((r: any) => r.is_admin);

  return (
    <div className="rounded-lg bg-muted/20 border border-border/50 overflow-hidden">
      <div className="flex gap-2 p-2.5">
        <UserCircle2 className="w-6 h-6 text-muted-foreground shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-foreground truncate">
              {f.author_name || "Anonymous"}
            </span>
            <div className="flex items-center gap-1.5">
              {f.rating && (
                <StarRating value={f.rating} readOnly size="sm" />
              )}
              <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                {new Date(f.created_at).toLocaleDateString("en-KE", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 break-words leading-relaxed">
            {f.comment}
          </p>
          {/* Show replies toggle */}
          <button
            type="button"
            onClick={() => setShowReplies((v) => !v)}
            className="text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors mt-1 flex items-center gap-1"
          >
            {showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showReplies ? "Hide replies" : "View replies"}
          </button>
        </div>
      </div>

      {showReplies && (
        <div className="bg-muted/10 border-t border-border/40 px-3 py-2 space-y-1.5" style={{ animation: "fade-slide-in 0.15s ease" }}>
          {isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin text-muted-foreground mx-auto" />
          ) : adminReplies.length > 0 ? (
            adminReplies.map((r: any) => (
              <div key={r.id} className="bg-primary/5 border border-primary/15 rounded-lg px-3 py-2 ml-3">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Admin Reply
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <p className="text-[11px] text-foreground leading-relaxed">{r.message}</p>
              </div>
            ))
          ) : (
            <p className="text-[10px] text-muted-foreground italic py-1">No admin replies yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ProjectFeedbackPanel;

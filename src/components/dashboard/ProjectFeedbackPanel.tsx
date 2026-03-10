import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquarePlus,
  Loader2,
  Send,
  UserCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { fetchFeedback, submitFeedback } from "@/data/projects";
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
  const [successMsg, setSuccessMsg] = useState(false);

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback", project.id] });
      setName("");
      setComment("");
      setRating(0);
      setShowForm(false);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 4000);
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
          onClick={() => setShowForm((v) => !v)}
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

      {/* Success toast */}
      {successMsg && (
        <div className="text-xs text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 font-medium">
          ✓ Thank you! Your feedback has been submitted.
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
            <div
              key={f.id}
              className="flex gap-2 p-2.5 rounded-lg bg-muted/20 border border-border/50"
            >
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
              </div>
            </div>
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

export default ProjectFeedbackPanel;

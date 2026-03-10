import { useState } from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";

interface DeleteConfirmModalProps {
  projectName: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

const DeleteConfirmModal = ({
  projectName,
  onConfirm,
  onClose,
}: DeleteConfirmModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to delete project.",
      );
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-border shadow-2xl overflow-hidden"
        style={{
          background: "hsl(var(--card))",
          animation: "modal-in 0.22s cubic-bezier(.4,0,.2,1)",
        }}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-red-700" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted/50"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-7 py-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>

          <h2 className="text-base font-extrabold text-foreground mb-1">
            Delete Project?
          </h2>
          <p className="text-xs text-muted-foreground mb-1">
            You are about to permanently delete:
          </p>
          <p className="text-xs font-semibold text-foreground bg-muted/60 rounded-lg px-3 py-1.5 mb-5 max-w-full truncate">
            "{projectName}"
          </p>
          <p className="text-[11px] text-red-500/80 mb-5">
            This action cannot be undone.
          </p>

          {error && (
            <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-3 w-full">
              {error}
            </div>
          )}

          <div className="flex gap-2 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              {isLoading ? "Deleting…" : "Yes, Delete"}
            </button>
          </div>
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

export default DeleteConfirmModal;

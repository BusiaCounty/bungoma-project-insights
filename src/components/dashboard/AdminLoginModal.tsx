import { useState } from "react";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, X, LogIn } from "lucide-react";

interface AdminLoginModalProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onClose: () => void;
}

const AdminLoginModal = ({ onLogin, onClose }: AdminLoginModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await onLogin(email, password);
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Login failed. Please check your credentials.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden"
        style={{
          background: "hsl(var(--card))",
          animation: "modal-in 0.22s cubic-bezier(.4,0,.2,1)",
        }}
      >
        {/* Header gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-primary" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted/50"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-8 py-7">
          {/* Icon & Title */}
          <div className="flex flex-col items-center mb-7">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg mb-3">
              <ShieldCheck className="w-7 h-7 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-extrabold text-foreground tracking-tight">
              Admin Login
            </h2>
            <p className="text-xs text-muted-foreground mt-1 text-center">
              Sign in to manage and update project data
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-semibold text-foreground"
                htmlFor="admin-email"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@busia.go.ke"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-semibold text-foreground"
                htmlFor="admin-password"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-bold shadow-md hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {isLoading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-[10px] text-muted-foreground text-center mt-5">
            Access restricted to authorized County Government of Busia personnel
            only.
          </p>
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

export default AdminLoginModal;

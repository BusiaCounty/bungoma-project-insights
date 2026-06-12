import { useState } from "react";
import {
  BarChart3,
  ListChecks,
  MapPin,
  MessageSquare,
  ShieldAlert,
  LogIn,
  LogOut,
  ShieldCheck,
  Eye,
  Users,
  Banknote,
  Menu,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export type TabId =
  | "dashboard"
  | "projects"
  | "location"
  | "status"
  | "financials"
  | "committee"
  | "whistleblower"
  | "feedback-views";

interface DashboardTopNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  isAdmin?: boolean;
  adminEmail?: string | null;
  onAdminLogin?: () => void;
  onAdminLogout?: () => void;
}

const tabs: { id: TabId; title: string; icon: React.ElementType }[] = [
  { id: "dashboard", title: "Dashboard", icon: BarChart3 },
  { id: "projects", title: "Projects", icon: ListChecks },
  { id: "location", title: "Location", icon: MapPin },
  { id: "status", title: "Status", icon: MessageSquare },
  { id: "financials", title: "Financials", icon: Banknote },
  { id: "committee", title: "PMC", icon: Users },
  { id: "whistleblower", title: "Report", icon: ShieldAlert },
  { id: "feedback-views", title: "Feedback", icon: Eye },
];

const DashboardTopNav = ({
  activeTab,
  onTabChange,
  isAdmin = false,
  adminEmail,
  onAdminLogin,
  onAdminLogout,
}: DashboardTopNavProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="gradient-sidebar rounded-2xl border border-border shadow-card px-3 py-2 flex items-center gap-2 sticky top-2 z-30 backdrop-blur-md">
      <div className="flex items-center gap-2.5 pr-3 mr-1 border-r border-border shrink-0">
        <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md">
          <img src="/pm.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div className="hidden sm:block leading-tight">
          <div className="font-bold text-xs text-foreground">Busia County</div>
          <div className="text-[10px] text-muted-foreground">Projects Dashboard</div>
        </div>
      </div>

      {/* Desktop / tablet horizontal nav */}
      <nav className="hidden md:flex items-center gap-1 overflow-x-auto flex-1 min-w-0 scrollbar-thin">
        {tabs.map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              title={t.title}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-150 text-xs font-bold whitespace-nowrap shrink-0 ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              <span>{t.title}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile drawer trigger */}
      <div className="flex md:hidden flex-1 min-w-0">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <button
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-bold text-muted-foreground hover:bg-muted transition-all"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
              <span className="hidden sm:inline">Menu</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="px-4 py-4 border-b border-border">
              <SheetTitle className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white p-0.5 flex items-center justify-center shadow">
                  <img src="/pm.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                Busia County Dashboard
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col p-2 gap-1">
              {tabs.map((t) => {
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      onTabChange(t.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <t.icon className="w-4 h-4" />
                    {t.title}
                  </button>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center gap-2 pl-3 ml-1 border-l border-border shrink-0">
        {isAdmin ? (
          <>
            <div
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/5 border border-primary/15"
              title={adminEmail ?? undefined}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <div className="leading-tight">
                <p className="text-[10px] font-bold text-primary">Admin</p>
                {adminEmail && (
                  <p className="text-[9px] text-muted-foreground max-w-[140px] truncate">
                    {adminEmail}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onAdminLogout}
              title="Sign Out"
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-red-500 hover:bg-red-500/5 border border-transparent hover:border-red-500/15 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </>
        ) : (
          <button
            onClick={onAdminLogin}
            title="Admin Login"
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/15 transition-all"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin Login</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardTopNav;
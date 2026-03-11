import {
  BarChart3,
  ListChecks,
  MapPin,
  MessageSquare,
  ShieldAlert,
  LogIn,
  LogOut,
  ShieldCheck,
  Users,
} from "lucide-react";

export type TabId =
  | "dashboard"
  | "projects"
  | "location"
  | "status"
  | "committee"
  | "whistleblower";

interface DashboardSidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  isAdmin?: boolean;
  adminEmail?: string | null;
  onAdminLogin?: () => void;
  onAdminLogout?: () => void;
}

const tabs: {
  id: TabId;
  title: string;
  sub: string;
  icon: React.ElementType;
}[] = [
  {
    id: "dashboard",
    title: "Dashboard & Analytics",
    sub: "Analytics & reports",
    icon: BarChart3,
  },
  {
    id: "projects",
    title: "Project Details",
    sub: "Open project ideas",
    icon: ListChecks,
  },
  {
    id: "location",
    title: "Project Location",
    sub: "Location data",
    icon: MapPin,
  },
  {
    id: "status",
    title: "Status & Feedback",
    sub: "Progress & comments",
    icon: MessageSquare,
  },
  {
    id: "committee",
    title: "PMC Management",
    sub: "Committees & tasks",
    icon: Users,
  },
  {
    id: "whistleblower",
    title: "Whistleblower Report",
    sub: "Confidential reports",
    icon: ShieldAlert,
  },
];

const DashboardSidebar = ({
  activeTab,
  onTabChange,
  isAdmin = false,
  adminEmail,
  onAdminLogin,
  onAdminLogout,
}: DashboardSidebarProps) => {
  return (
    <aside className="gradient-sidebar rounded-2xl p-4 h-[calc(100vh-44px)] overflow-auto shadow-sidebar border border-border flex flex-col sticky top-[22px]">
      <div className="flex gap-3 items-center mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-extrabold text-sm shadow-md">
          BG
        </div>
        <div>
          <div className="font-bold text-sm text-foreground">Busia County</div>
          <div className="text-[11px] text-muted-foreground">
            Projects Dashboard
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-1.5 mt-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`text-left px-3 py-2.5 rounded-xl transition-all duration-150 group ${
              activeTab === t.id
                ? "bg-primary/10 border border-primary/20"
                : "hover:bg-muted/50 border border-transparent hover:translate-x-1"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <t.icon
                className={`w-4 h-4 ${activeTab === t.id ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}
              />
              <div>
                <div
                  className={`text-xs font-bold ${activeTab === t.id ? "text-primary" : "text-foreground"}`}
                >
                  {t.title}
                </div>
                <div className="text-[10px] text-muted-foreground">{t.sub}</div>
              </div>
            </div>
          </button>
        ))}
      </nav>

      {/* Admin section */}
      <div className="mt-auto pt-3 border-t border-border flex flex-col gap-2">
        {isAdmin ? (
          <>
            {/* Admin badge */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/15">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-primary">Admin Mode</p>
                {adminEmail && (
                  <p className="text-[9px] text-muted-foreground truncate">
                    {adminEmail}
                  </p>
                )}
              </div>
            </div>

            {/* Sign out */}
            <button
              onClick={onAdminLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-red-500 hover:bg-red-500/5 border border-transparent hover:border-red-500/15 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={onAdminLogin}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/15 transition-all"
          >
            <LogIn className="w-3.5 h-3.5" />
            Admin Login
          </button>
        )}

        <p className="text-[10px] text-muted-foreground text-center mt-1">
          © 2026 County Government of Busia
        </p>
      </div>
    </aside>
  );
};

export default DashboardSidebar;

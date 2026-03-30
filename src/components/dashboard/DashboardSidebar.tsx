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
  Banknote,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export type TabId =
  | "dashboard"
  | "projects"
  | "location"
  | "status"
  | "financials"
  | "committee"
  | "whistleblower";

interface DashboardSidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  isAdmin?: boolean;
  adminEmail?: string | null;
  onAdminLogin?: () => void;
  onAdminLogout?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
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
    id: "financials",
    title: "Financial Summary",
    sub: "Budget breakdowns",
    icon: Banknote,
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
  isCollapsed = false,
  onToggleCollapse,
}: DashboardSidebarProps) => {
  return (
    <aside 
      className={`gradient-sidebar rounded-2xl p-4 h-[calc(100vh-44px)] overflow-x-hidden overflow-y-auto shadow-sidebar border border-border flex flex-col sticky top-[22px] transition-all duration-300 ease-in-out ${isCollapsed ? 'w-[76px]' : 'w-[260px]'}`}
    >
      <div className={`flex items-center mb-6 relative ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex gap-3 items-center min-w-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-extrabold text-sm shadow-md shrink-0">
            BG
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <div className="font-bold text-sm text-foreground truncate">Busia County</div>
              <div className="text-[11px] text-muted-foreground truncate">
                Projects Dashboard
              </div>
            </div>
          )}
        </div>
        
        <button 
          onClick={onToggleCollapse}
          className={`absolute -right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center shadow-md hover:bg-muted transition-colors z-10 ${isCollapsed ? 'translate-x-2' : ''}`}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex flex-col gap-1.5 mt-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            title={isCollapsed ? t.title : undefined}
            className={`text-left px-3 py-2.5 rounded-xl transition-all duration-150 group flex items-center ${
              activeTab === t.id
                ? "bg-primary/10 border border-primary/20"
                : "hover:bg-muted/50 border border-transparent hover:translate-x-1"
            } ${isCollapsed ? 'justify-center' : ''}`}
          >
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5 w-full'}`}>
              <t.icon
                className={`w-4 h-4 shrink-0 ${activeTab === t.id ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}
              />
              {!isCollapsed && (
                <div className="truncate">
                  <div
                    className={`text-xs font-bold ${activeTab === t.id ? "text-primary" : "text-foreground"} truncate`}
                  >
                    {t.title}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">{t.sub}</div>
                </div>
              )}
            </div>
          </button>
        ))}
      </nav>

      {/* Admin section */}
      <div className="mt-auto pt-3 border-t border-border flex flex-col gap-2">
        {isAdmin ? (
          <>
            {/* Admin badge */}
            <div 
              className={`flex items-center rounded-xl bg-primary/5 border border-primary/15 transition-all ${isCollapsed ? 'justify-center p-2.5' : 'gap-2 px-3 py-2'}`}
              title={isCollapsed ? "Admin Mode" : undefined}
            >
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-primary">Admin Mode</p>
                  {adminEmail && (
                    <p className="text-[9px] text-muted-foreground truncate">
                      {adminEmail}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Sign out */}
            <button
              onClick={onAdminLogout}
              title={isCollapsed ? "Sign Out" : undefined}
              className={`flex items-center rounded-xl text-xs font-semibold text-muted-foreground hover:text-red-500 hover:bg-red-500/5 border border-transparent hover:border-red-500/15 transition-all ${isCollapsed ? 'justify-center p-2.5' : 'gap-2 px-3 py-2'}`}
            >
              <LogOut className={`w-3.5 h-3.5 ${isCollapsed ? '' : ''}`} />
              {!isCollapsed && "Sign Out"}
            </button>
          </>
        ) : (
          <button
            onClick={onAdminLogin}
            title={isCollapsed ? "Admin Login" : undefined}
            className={`flex items-center rounded-xl text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/15 transition-all ${isCollapsed ? 'justify-center p-2.5' : 'gap-2 px-3 py-2'}`}
          >
            <LogIn className={`w-3.5 h-3.5 ${isCollapsed ? '' : ''}`} />
            {!isCollapsed && "Admin Login"}
          </button>
        )}

        {!isCollapsed && (
          <p className="text-[10px] text-muted-foreground text-center mt-1">
            © 2026 County Government of Busia
          </p>
        )}
      </div>
    </aside>
  );
};

export default DashboardSidebar;

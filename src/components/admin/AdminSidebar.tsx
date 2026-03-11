import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  FolderTree,
  MapPin,
  Banknote,
  Files,
  BarChart,
  Eye,
  ActivitySquare,
  BellRing
} from "lucide-react";
import { Link } from "react-router-dom";

export type AdminTabId =
  | "overview"
  | "users"
  | "rbac"
  | "project-config"
  | "geo-admin"
  | "financials"
  | "documents"
  | "reports"
  | "transparency"
  | "settings"
  | "audit"
  | "notifications";

interface AdminSidebarProps {
  activeTab: AdminTabId;
  onTabChange: (tab: AdminTabId) => void;
}

const adminNavLinks: { id: AdminTabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard },
  { id: "users", label: "User Management", icon: Users },
  { id: "rbac", label: "Access Control (RBAC)", icon: Shield },
  { id: "project-config", label: "Project Config", icon: FolderTree },
  { id: "geo-admin", label: "Geographic Admin", icon: MapPin },
  { id: "financials", label: "Financial Controls", icon: Banknote },
  { id: "documents", label: "Media & Documents", icon: Files },
  { id: "reports", label: "Reports & Analytics", icon: BarChart },
  { id: "transparency", label: "Public Portal Views", icon: Eye },
  { id: "settings", label: "System Settings", icon: Settings },
  { id: "audit", label: "Audit & Security", icon: ActivitySquare },
  { id: "notifications", label: "Alerts & Notifications", icon: BellRing },
];

export default function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  return (
    <aside className="h-screen sticky top-0 bg-card border-r border-border shadow-sm flex flex-col pt-6 pb-4 overflow-y-auto w-full max-lg:hidden flex-shrink-0 relative z-10">
      <div className="px-6 pb-6 mb-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black shadow-md shadow-primary/30">
            PM
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground tracking-tight leading-tight">Admin Portal</h1>
            <p className="text-xs text-muted-foreground font-medium">System Control Center</p>
          </div>
        </div>
      </div>

      <div className="px-3 flex flex-col gap-1 pb-10">
        <h2 className="px-3 text-[10px] uppercase font-black tracking-wider text-muted-foreground/70 mb-2">Core Modules</h2>
        {adminNavLinks.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm font-semibold
                ${isActive 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[0.98]" 
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:scale-[1.01]"
                }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? "text-primary-foreground" : "group-hover:text-primary transition-colors"}`} />
              {item.label}
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground ml-auto opacity-80 shadow-sm" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-auto px-6">
        <div className="p-4 rounded-xl bg-muted/50 border border-border/50 text-center flex flex-col items-center">
          <p className="text-xs font-medium text-muted-foreground mb-3">Logged in as Super Admin</p>
          <Link to="/" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            Back to Public View
          </Link>
        </div>
      </div>
    </aside>
  );
}

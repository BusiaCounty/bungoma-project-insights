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
  BellRing,
  ClipboardList,
  MessageSquareText,
  TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";
import type { AppRole } from "@/hooks/useAdminAuth";

export type AdminTabId =
  | "overview"
  | "project-manager"
  | "whistleblower"
  | "users"
  | "rbac"
  | "project-config"
  | "geo-admin"
  | "financials"
  | "documents"
  | "reports"
  | "feedback"
  | "feedback-analytics"
  | "transparency"
  | "settings"
  | "audit"
  | "notifications";

interface AdminSidebarProps {
  activeTab: AdminTabId;
  onTabChange: (tab: AdminTabId) => void;
  userRole: AppRole | null;
}

interface NavLink {
  id: AdminTabId;
  label: string;
  icon: React.ElementType;
  /** Roles that can see this tab. Empty = all authenticated roles */
  allowedRoles: AppRole[];
}

const adminNavLinks: NavLink[] = [
  { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard, allowedRoles: ["admin", "executive", "staff", "viewer"] },
  { id: "project-manager", label: "Project Management", icon: ClipboardList, allowedRoles: ["admin", "staff"] },
  { id: "whistleblower", label: "Whistleblower Reports", icon: Shield, allowedRoles: ["admin", "executive"] },
  { id: "users", label: "User Management", icon: Users, allowedRoles: ["admin"] },
  { id: "rbac", label: "Access Control (RBAC)", icon: Shield, allowedRoles: ["admin"] },
  { id: "project-config", label: "Project Config", icon: FolderTree, allowedRoles: ["admin", "staff"] },
  { id: "geo-admin", label: "Geographic Admin", icon: MapPin, allowedRoles: ["admin", "staff"] },
  { id: "financials", label: "Financial Controls", icon: Banknote, allowedRoles: ["admin", "executive"] },
  { id: "documents", label: "Media & Documents", icon: Files, allowedRoles: ["admin", "staff"] },
  { id: "reports", label: "Reports & Analytics", icon: BarChart, allowedRoles: ["admin", "executive", "viewer"] },
  { id: "feedback", label: "Citizen Feedback", icon: MessageSquareText, allowedRoles: ["admin", "staff"] },
  { id: "feedback-analytics", label: "Feedback Analytics", icon: TrendingUp, allowedRoles: ["admin", "executive"] },
  { id: "transparency", label: "Public Portal Views", icon: Eye, allowedRoles: ["admin", "executive", "viewer"] },
  { id: "settings", label: "System Settings", icon: Settings, allowedRoles: ["admin"] },
  { id: "audit", label: "Audit & Security", icon: ActivitySquare, allowedRoles: ["admin"] },
  { id: "notifications", label: "Alerts & Notifications", icon: BellRing, allowedRoles: ["admin"] },
];

const roleLabelMap: Record<AppRole, string> = {
  admin: "Super Admin",
  executive: "Executive",
  staff: "Staff",
  viewer: "Viewer",
};

export function getVisibleTabs(role: AppRole | null): AdminTabId[] {
  if (!role) return ["overview"];
  return adminNavLinks
    .filter((link) => link.allowedRoles.includes(role))
    .map((link) => link.id);
}

export default function AdminSidebar({ activeTab, onTabChange, userRole }: AdminSidebarProps) {
  const visibleTabs = getVisibleTabs(userRole);
  const visibleLinks = adminNavLinks.filter((link) => visibleTabs.includes(link.id));

  return (
    <aside className="h-screen sticky top-0 bg-card border-r border-border shadow-sm flex flex-col pt-6 pb-4 overflow-y-auto w-80 min-w-[20rem] max-lg:hidden flex-shrink-0 relative z-10">
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
        {visibleLinks.map((item) => {
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
          <p className="text-xs font-medium text-muted-foreground mb-3">
            Logged in as {userRole ? roleLabelMap[userRole] : "User"}
          </p>
          <Link to="/" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            Back to Public View
          </Link>
        </div>
      </div>
    </aside>
  );
}

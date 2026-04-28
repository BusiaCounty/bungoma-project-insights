import { useState } from "react";
import AdminSidebar, { AdminTabId, getVisibleTabs } from "@/components/admin/AdminSidebar";
import { useAdminAuth } from "@/hooks/useAdminAuth";

import AdminOverview from "@/components/admin/AdminOverview";
import AdminProjectManager from "@/components/admin/AdminProjectManager";
import UserManagement from "@/components/admin/UserManagement";
import RBACConfig from "@/components/admin/RBACConfig";
import ProjectConfig from "@/components/admin/ProjectConfig";
import GeoAdmin from "@/components/admin/GeoAdmin";
import FinancialControls from "@/components/admin/FinancialControls";
import DocumentsMedia from "@/components/admin/DocumentsMedia";
import ReportsAnalytics from "@/components/admin/ReportsAnalytics";
import AdminFeedbackViewer from "@/components/admin/AdminFeedbackViewer";
import AdminWhistleblowerReports from "@/components/admin/AdminWhistleblowerReports";
import FeedbackAnalytics from "@/components/admin/FeedbackAnalytics";
import PublicPortalConfig from "@/components/admin/PublicPortalConfig";
import SystemSettings from "@/components/admin/SystemSettings";
import AuditSecurity from "@/components/admin/AuditSecurity";
import NotificationSettings from "@/components/admin/NotificationSettings";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Menu, LayoutDashboard, ClipboardList, Users, FolderTree, MapPin, Banknote, Files, BarChart, Eye, ActivitySquare, BellRing, MessageSquareText, TrendingUp, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const tabLabels: Record<AdminTabId, { label: string; icon: React.ElementType }> = {
  "overview": { label: "Dashboard Overview", icon: LayoutDashboard },
  "project-manager": { label: "Project Management", icon: ClipboardList },
  "whistleblower": { label: "Whistleblower Reports", icon: Shield },
  "users": { label: "User Management", icon: Users },
  "rbac": { label: "Access Control (RBAC)", icon: Shield },
  "project-config": { label: "Project Config", icon: FolderTree },
  "geo-admin": { label: "Geographic Admin", icon: MapPin },
  "financials": { label: "Financial Controls", icon: Banknote },
  "documents": { label: "Media & Documents", icon: Files },
  "reports": { label: "Reports & Analytics", icon: BarChart },
  "feedback": { label: "Citizen Feedback", icon: MessageSquareText },
  "feedback-analytics": { label: "Feedback Analytics", icon: TrendingUp },
  "transparency": { label: "Public Portal Views", icon: Eye },
  "settings": { label: "System Settings", icon: Settings },
  "audit": { label: "Audit & Security", icon: ActivitySquare },
  "notifications": { label: "Alerts & Notifications", icon: BellRing },
};

export default function Admin() {
  const { user, role, isLoading, signOut } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<AdminTabId>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  if (!user || !role) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center p-8 max-w-md">
          <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {!user
              ? "You must be logged in to access the admin portal."
              : "Your account does not have an assigned role. Contact a system administrator."}
          </p>
          <Link to="/" className="text-sm font-bold text-primary hover:underline">
            Back to Public View
          </Link>
        </div>
      </div>
    );
  }

  const visibleTabs = getVisibleTabs(role);

  // If user navigates to a tab they can't see, reset to overview
  if (!visibleTabs.includes(activeTab)) {
    setActiveTab("overview");
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} userRole={role} />
      
      <main className="flex-1 w-full flex flex-col min-w-0 max-h-screen overflow-y-auto">
        <div className="lg:hidden p-3 border-b border-border bg-card/95 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between gap-3">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] max-w-sm p-0 flex flex-col">
              <SheetHeader className="p-4 border-b border-border">
                <SheetTitle className="flex items-center gap-2 text-left">
                  <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                    PM
                  </div>
                  <span>Admin Portal</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
                {visibleTabs.map((tab) => {
                  const meta = tabLabels[tab];
                  const Icon = meta.icon;
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{meta.label}</span>
                    </button>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-border">
                <Link
                  to="/"
                  className="text-xs font-bold text-primary hover:underline"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Back to Public View
                </Link>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shrink-0">
              PM
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-sm truncate">Admin Portal</h1>
              <p className="text-[10px] text-muted-foreground truncate">
                {tabLabels[activeTab]?.label}
              </p>
            </div>
          </div>

          <Link to="/" className="text-xs text-primary font-bold shrink-0">Exit</Link>
        </div>

        <div className="p-4 md:p-8 flex-1 w-full max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-200">
          {activeTab === "overview" && <AdminOverview />}
          {activeTab === "project-manager" && <AdminProjectManager />}
          {activeTab === "whistleblower" && <AdminWhistleblowerReports />}
          {activeTab === "users" && <UserManagement />}
          {activeTab === "rbac" && <RBACConfig />}
          {activeTab === "project-config" && <ProjectConfig />}
          {activeTab === "geo-admin" && <GeoAdmin />}
          {activeTab === "financials" && <FinancialControls />}
          {activeTab === "documents" && <DocumentsMedia />}
          {activeTab === "reports" && <ReportsAnalytics />}
          {activeTab === "feedback" && <AdminFeedbackViewer />}
          {activeTab === "feedback-analytics" && <FeedbackAnalytics />}
          {activeTab === "transparency" && <PublicPortalConfig />}
          {activeTab === "settings" && <SystemSettings />}
          {activeTab === "audit" && <AuditSecurity />}
          {activeTab === "notifications" && <NotificationSettings />}
        </div>
      </main>
    </div>
  );
}

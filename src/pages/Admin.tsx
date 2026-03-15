import { useState } from "react";
import AdminSidebar, { AdminTabId } from "@/components/admin/AdminSidebar";

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
import FeedbackAnalytics from "@/components/admin/FeedbackAnalytics";
import PublicPortalConfig from "@/components/admin/PublicPortalConfig";
import SystemSettings from "@/components/admin/SystemSettings";
import AuditSecurity from "@/components/admin/AuditSecurity";
import NotificationSettings from "@/components/admin/NotificationSettings";
import { Link } from "react-router-dom";

const allTabs: AdminTabId[] = [
  "overview", "project-manager", "users", "rbac", "project-config", "geo-admin",
  "financials", "documents", "reports", "feedback", "feedback-analytics", "transparency", "settings", "audit", "notifications",
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTabId>("overview");

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 w-full flex flex-col min-w-0 max-h-screen overflow-y-auto">
        <div className="lg:hidden p-4 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
              PM
            </div>
            <h1 className="font-bold text-base">Admin Portal</h1>
          </div>
          <Link to="/" className="text-xs text-primary font-bold">Exit</Link>
        </div>

        <div className="lg:hidden p-3 border-b border-border bg-background overflow-x-auto flex gap-2 hide-scrollbar">
          {allTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground border border-border"
              }`}
            >
              {tab.replace(/-/g, " ").toUpperCase()}
            </button>
          ))}
        </div>

        <div className="p-4 md:p-8 flex-1 w-full max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-200">
          {activeTab === "overview" && <AdminOverview />}
          {activeTab === "project-manager" && <AdminProjectManager />}
          {activeTab === "users" && <UserManagement />}
          {activeTab === "rbac" && <RBACConfig />}
          {activeTab === "project-config" && <ProjectConfig />}
          {activeTab === "geo-admin" && <GeoAdmin />}
          {activeTab === "financials" && <FinancialControls />}
          {activeTab === "documents" && <DocumentsMedia />}
          {activeTab === "reports" && <ReportsAnalytics />}
          {activeTab === "feedback" && <AdminFeedbackViewer />}
          {activeTab === "transparency" && <PublicPortalConfig />}
          {activeTab === "settings" && <SystemSettings />}
          {activeTab === "audit" && <AuditSecurity />}
          {activeTab === "notifications" && <NotificationSettings />}
        </div>
      </main>
    </div>
  );
}

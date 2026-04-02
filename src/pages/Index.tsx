import { useState, useMemo, useEffect } from "react";
import { Calendar, Loader2, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import DashboardSidebar, {
  type TabId,
} from "@/components/dashboard/DashboardSidebar";
import FilterBar, { type Filters } from "@/components/dashboard/FilterBar";
import SummaryCards from "@/components/dashboard/SummaryCards";
import Charts from "@/components/dashboard/Charts";
import SubCountyPieChart from "@/components/dashboard/SubCountyPieChart";
import ProjectsTable from "@/components/dashboard/ProjectsTable";
import StatusFeedback from "@/components/dashboard/StatusFeedback";
import WhistleblowerForm from "@/components/dashboard/WhistleblowerForm";
import CommitteeModule from "@/components/dashboard/CommitteeModule";
import ProjectLocationTab from "@/components/dashboard/ProjectLocationTab";
import AdminLoginModal from "@/components/dashboard/AdminLoginModal";
import FeedbackViews from "@/components/dashboard/FeedbackViews";
import FinancialSummary from "@/components/dashboard/FinancialSummary";
import { fetchProjects } from "@/data/projects";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useNavigate } from "react-router-dom";

const defaultFilters: Filters = {
  subCounty: "all",
  ward: "all",
  sector: "all",
  status: "all",
  fy: "all",
};

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [dateTime, setDateTime] = useState(new Date());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const {
    isAdmin,
    user,
    isLoading: authLoading,
    signIn,
    signOut,
  } = useAdminAuth();

  const handleAdminLogin = async (email: string, password: string) => {
    await signIn(email, password);
    navigate("/admin");
  };

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  useEffect(() => {
    const interval = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (filters.subCounty !== "all" && p.sub_county !== filters.subCounty)
        return false;
      if (filters.ward !== "all" && p.ward !== filters.ward) return false;
      if (filters.sector !== "all" && p.sector !== filters.sector) return false;
      if (filters.status !== "all" && p.status !== filters.status) return false;
      if (filters.fy !== "all" && p.fy !== filters.fy) return false;
      return true;
    });
  }, [filters, projects]);

  const mobileTabLabels: Record<TabId, string> = {
    dashboard: "Dashboard",
    projects: "Projects",
    location: "Location",
    status: "Status",
    financials: "Financials",
    committee: "PMC",
    whistleblower: "Report",
    "feedback-views": "Feedback",
  };

  return (
    <div className={`min-h-screen grid ${isSidebarCollapsed ? 'grid-cols-[76px_1fr]' : 'grid-cols-[260px_1fr]'} gap-5 p-5 items-start max-lg:grid-cols-1 transition-all duration-300 ease-in-out`}>
      <div className="max-lg:hidden">
        <DashboardSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isAdmin={isAdmin}
          adminEmail={user?.email}
          onAdminLogin={() => setShowLoginModal(true)}
          onAdminLogout={signOut}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Mobile nav */}
      <div className="lg:hidden flex gap-1 overflow-x-auto pb-1">
        {(
          [
            "dashboard",
            "projects",
            "location",
            "status",
            "financials",
            "committee",
            "whistleblower",
            "feedback-views",
          ] as TabId[]
        ).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === t
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground border border-border"
            }`}
          >
            {mobileTabLabels[t]}
          </button>
        ))}

        {/* Mobile admin toggle */}
        <button
          onClick={isAdmin ? () => navigate("/admin") : () => setShowLoginModal(true)}
          className={`ml-auto flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
            isAdmin
              ? "bg-primary/10 text-primary border border-primary/20"
              : "bg-card text-muted-foreground border border-border"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          {authLoading ? "…" : isAdmin ? "Admin" : "Login"}
        </button>
      </div>

      <div className="flex flex-col gap-4 min-w-0">
        {/* Header */}
        <div className="gradient-hero rounded-xl p-5 border border-border shadow-card flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-3 items-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
              <Calendar className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-foreground tracking-tight">
                Busia County Executive Dashboard
              </h1>
              <p className="text-xs text-muted-foreground">
                Projects Stock Dashboard — Interactive analytics and summaries
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary">
                <ShieldCheck className="w-3 h-3" />
                Admin Mode
              </span>
            )}
            <div className="text-right text-xs text-muted-foreground font-semibold tabular-nums">
              {dateTime.toLocaleDateString("en-KE", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              <br />
              {dateTime.toLocaleTimeString("en-KE")}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && (
              <div className="flex flex-col gap-4">
                <FilterBar
                  filters={filters}
                  onChange={setFilters}
                  onReset={() => setFilters(defaultFilters)}
                />
                <SummaryCards projects={filtered} />
                <Charts projects={filtered} />
                <SubCountyPieChart projects={filtered} />
              </div>
            )}

            {activeTab === "projects" && (
              <div className="flex flex-col gap-4">
                <FilterBar
                  filters={filters}
                  onChange={setFilters}
                  onReset={() => setFilters(defaultFilters)}
                />
                <ProjectsTable projects={filtered} isAdmin={isAdmin} />
              </div>
            )}

            {activeTab === "location" && (
              <ProjectLocationTab projects={filtered.length ? filtered : projects} />
            )}

            {activeTab === "status" && (
              <div className="flex flex-col gap-4">
                <FilterBar
                  filters={filters}
                  onChange={setFilters}
                  onReset={() => setFilters(defaultFilters)}
                />
                <StatusFeedback projects={filtered} />
              </div>
            )}

            {activeTab === "financials" && (
              <div className="flex flex-col gap-4">
                <FilterBar
                  filters={filters}
                  onChange={setFilters}
                  onReset={() => setFilters(defaultFilters)}
                />
                <FinancialSummary projects={filtered} isAdmin={isAdmin} />
              </div>
            )}

            {activeTab === "committee" && (
              <CommitteeModule projects={filtered.length ? filtered : projects} isAdmin={isAdmin} />
            )}

            {activeTab === "whistleblower" && <WhistleblowerForm />}

            {activeTab === "feedback-views" && <FeedbackViews />}
          </>
        )}
      </div>

      {/* Admin Login Modal */}
      {showLoginModal && (
        <AdminLoginModal
          onLogin={handleAdminLogin}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
};

export default Index;

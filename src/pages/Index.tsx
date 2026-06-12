import { useState, useMemo, useEffect } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import DashboardTopNav, {
  type TabId,
} from "@/components/dashboard/DashboardTopNav";
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

  return (
    <div className="min-h-screen flex flex-col gap-4 p-5">
      <DashboardTopNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isAdmin={isAdmin}
        adminEmail={user?.email}
        onAdminLogin={() => setShowLoginModal(true)}
        onAdminLogout={signOut}
      />

      <div className="flex flex-col gap-4 min-w-0">
        {/* Header */}
        <div className="gradient-hero rounded-xl p-5 border border-border shadow-card flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-3 items-center">
            <div className="w-14 h-14 rounded-xl bg-white p-1 flex items-center justify-center shadow-md animate-in zoom-in duration-500">
              <img src="/logo.png" alt="Busia County Logo" className="w-full h-full object-contain drop-shadow-sm" />
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

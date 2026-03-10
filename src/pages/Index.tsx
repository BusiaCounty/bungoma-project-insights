import { useState, useMemo, useEffect } from "react";
import { Calendar, Loader2, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import DashboardSidebar, {
  type TabId,
} from "@/components/dashboard/DashboardSidebar";
import FilterBar, { type Filters } from "@/components/dashboard/FilterBar";
import SummaryCards from "@/components/dashboard/SummaryCards";
import Charts from "@/components/dashboard/Charts";
import ProjectsTable from "@/components/dashboard/ProjectsTable";
import StatusFeedback from "@/components/dashboard/StatusFeedback";
import WhistleblowerForm from "@/components/dashboard/WhistleblowerForm";
import AdminLoginModal from "@/components/dashboard/AdminLoginModal";
import ProjectMap from "@/components/dashboard/ProjectMap";
import { fetchProjects } from "@/data/projects";
import { useAdminAuth } from "@/hooks/useAdminAuth";

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

  const {
    isAdmin,
    user,
    isLoading: authLoading,
    signIn,
    signOut,
  } = useAdminAuth();

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
    whistleblower: "Report",
  };

  return (
    <div className="min-h-screen grid grid-cols-[260px_1fr] gap-5 p-5 items-start max-lg:grid-cols-1">
      <div className="max-lg:hidden">
        <DashboardSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isAdmin={isAdmin}
          adminEmail={user?.email}
          onAdminLogin={() => setShowLoginModal(true)}
          onAdminLogout={signOut}
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
            "whistleblower",
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
          onClick={isAdmin ? signOut : () => setShowLoginModal(true)}
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
                County Government of Busia
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
              <div className="flex flex-col gap-4">
                <FilterBar
                  filters={filters}
                  onChange={setFilters}
                  onReset={() => setFilters(defaultFilters)}
                />
                <ProjectMap projects={filtered} />
              </div>
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

            {activeTab === "whistleblower" && <WhistleblowerForm />}
          </>
        )}
      </div>

      {/* Admin Login Modal */}
      {showLoginModal && (
        <AdminLoginModal
          onLogin={async (e, p) => {
            await signIn(e, p);
          }}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
};

export default Index;

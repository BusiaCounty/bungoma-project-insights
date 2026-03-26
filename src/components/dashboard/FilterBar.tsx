import { RotateCcw } from "lucide-react";
import { SUB_COUNTIES, SECTORS, STATUSES, FINANCIAL_YEARS, getWards } from "@/data/projects";

export interface Filters {
  subCounty: string;
  ward: string;
  sector: string;
  status: string;
  fy: string;
}

interface FilterBarProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  onReset: () => void;
}

const selectClass =
  "h-9 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-w-[120px] max-w-[200px] sm:min-w-[150px] sm:max-w-none truncate";

const sectorSelectClass =
  "h-9 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-w-[120px] max-w-[180px] sm:min-w-[150px] sm:max-w-none lg:max-w-[250px] xl:max-w-none truncate";

const FilterBar = ({ filters, onChange, onReset }: FilterBarProps) => {
  const wards = getWards(filters.subCounty === "all" ? undefined : filters.subCounty);

  const set = (key: keyof Filters, value: string) => {
    const next = { ...filters, [key]: value };
    if (key === "subCounty") next.ward = "all";
    onChange(next);
  };

  return (
    <div className="gradient-card rounded-xl border border-border p-3 shadow-card">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-foreground">Filters</h3>
          <p className="text-[10px] text-muted-foreground">All filters update in realtime</p>
        </div>
      </div>
      <div className="flex gap-2 items-end flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-muted-foreground">Sub County</label>
          <select className={selectClass} value={filters.subCounty} onChange={(e) => set("subCounty", e.target.value)}>
            <option value="all">All Sub Counties</option>
            {SUB_COUNTIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-muted-foreground">Ward</label>
          <select className={selectClass} value={filters.ward} onChange={(e) => set("ward", e.target.value)}>
            <option value="all">All Wards</option>
            {wards.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-muted-foreground">Sector</label>
          <select className={sectorSelectClass} value={filters.sector} onChange={(e) => set("sector", e.target.value)}>
            <option value="all">All Sectors</option>
            {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-muted-foreground">Status</label>
          <select className={selectClass} value={filters.status} onChange={(e) => set("status", e.target.value)}>
            <option value="all">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-muted-foreground">FY</label>
          <select className={selectClass} value={filters.fy} onChange={(e) => set("fy", e.target.value)}>
            <option value="all">All FYs</option>
            {FINANCIAL_YEARS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <button
          onClick={onReset}
          className="h-9 px-3 rounded-lg border border-border bg-card text-xs font-bold text-primary hover:-translate-y-0.5 transition-transform flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
    </div>
  );
};

export default FilterBar;

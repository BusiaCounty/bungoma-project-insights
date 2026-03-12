import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, FileText, AlertTriangle, CheckCircle2, Download, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { createProject, SUB_COUNTIES, SECTORS, STATUSES, FINANCIAL_YEARS, getWards } from "@/data/projects";
import { useQueryClient } from "@tanstack/react-query";

type CsvRow = {
  name: string;
  description: string;
  sub_county: string;
  ward: string;
  sector: string;
  status: string;
  fy: string;
  budget: string;
  progress: string;
};

type ValidatedRow = CsvRow & {
  errors: string[];
  rowIndex: number;
};

const REQUIRED_HEADERS = ["name", "sub_county", "ward", "sector", "fy"];
const ALL_HEADERS = ["name", "description", "sub_county", "ward", "sector", "status", "fy", "budget", "progress"];

function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] || "";
    });
    return row;
  });

  return { headers, rows };
}

function validateRow(row: Record<string, string>, index: number): ValidatedRow {
  const errors: string[] = [];
  const name = row.name || "";
  const sub_county = row.sub_county || "";
  const ward = row.ward || "";
  const sector = row.sector || "";
  const status = row.status || "Ongoing";
  const fy = row.fy || "";
  const budget = row.budget || "0";
  const progress = row.progress || "0";
  const description = row.description || "";

  if (!name) errors.push("Name is required");
  if (name.length > 200) errors.push("Name too long (max 200)");
  if (!sub_county) errors.push("Sub-county is required");
  else if (!SUB_COUNTIES.includes(sub_county)) errors.push(`Invalid sub-county: "${sub_county}"`);
  if (!ward) errors.push("Ward is required");
  else if (sub_county && SUB_COUNTIES.includes(sub_county) && !getWards(sub_county).includes(ward))
    errors.push(`Invalid ward "${ward}" for ${sub_county}`);
  if (!sector) errors.push("Sector is required");
  else if (!SECTORS.includes(sector)) errors.push(`Invalid sector`);
  if (!STATUSES.includes(status as any)) errors.push(`Invalid status: "${status}". Use: ${STATUSES.join(", ")}`);
  if (!fy) errors.push("Financial year is required");
  else if (!FINANCIAL_YEARS.includes(fy)) errors.push(`Invalid FY: "${fy}"`);
  if (isNaN(Number(budget)) || Number(budget) < 0) errors.push("Budget must be a positive number");
  const prog = Number(progress);
  if (isNaN(prog) || prog < 0 || prog > 100) errors.push("Progress must be 0-100");

  return { name, description, sub_county, ward, sector, status, fy, budget, progress, errors, rowIndex: index + 2 };
}

interface CsvProjectImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CsvProjectImport({ open, onOpenChange }: CsvProjectImportProps) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ValidatedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState("");

  const validRows = rows.filter((r) => r.errors.length === 0);
  const invalidRows = rows.filter((r) => r.errors.length > 0);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a .csv file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large (max 5MB)");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const { headers, rows: parsed } = parseCsv(text);

      const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
      if (missing.length) {
        toast.error(`Missing required columns: ${missing.join(", ")}`);
        setRows([]);
        return;
      }

      const validated = parsed.map((row, i) => validateRow(row, i));
      setRows(validated);

      if (validated.length === 0) {
        toast.error("No data rows found");
      }
    };
    reader.readAsText(file);
  }, []);

  const handleImport = async () => {
    if (validRows.length === 0) return;
    setImporting(true);
    let success = 0;
    let failed = 0;

    for (const row of validRows) {
      try {
        await createProject({
          name: row.name,
          description: row.description || null,
          sub_county: row.sub_county,
          ward: row.ward,
          sector: row.sector,
          status: row.status as "Completed" | "Ongoing" | "Stalled",
          fy: row.fy,
          budget: Number(row.budget) || 0,
          progress: Number(row.progress) || 0,
        });
        success++;
      } catch {
        failed++;
      }
    }

    setImporting(false);
    queryClient.invalidateQueries({ queryKey: ["projects"] });

    if (failed === 0) {
      toast.success(`Successfully imported ${success} project${success > 1 ? "s" : ""}`);
    } else {
      toast.warning(`Imported ${success}, failed ${failed}`);
    }

    handleReset();
    onOpenChange(false);
  };

  const handleReset = () => {
    setRows([]);
    setFileName("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const downloadTemplate = () => {
    const header = ALL_HEADERS.join(",");
    const example = `"Busia Water Supply Phase II","Construction of water supply system","Matayos","Bukhayo West","Health and Sanitation","Ongoing","2024/2025","5000000","35"`;
    const blob = new Blob([header + "\n" + example], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "projects_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" /> Bulk Import Projects from CSV
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple projects at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 min-h-0">
          {/* Upload area */}
          {rows.length === 0 && (
            <div className="space-y-3">
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium">Click to select a CSV file</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Required columns: name, sub_county, ward, sector, fy
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFile}
                />
              </div>
              <Button variant="outline" size="sm" className="gap-2" onClick={downloadTemplate}>
                <Download className="h-3.5 w-3.5" /> Download CSV Template
              </Button>
            </div>
          )}

          {/* Preview */}
          {rows.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm">
                  <Badge variant="secondary" className="gap-1">
                    <FileText className="h-3 w-3" /> {fileName}
                  </Badge>
                  <span className="text-muted-foreground">{rows.length} rows</span>
                  {validRows.length > 0 && (
                    <Badge className="bg-emerald-500/10 text-emerald-600 gap-1">
                      <CheckCircle2 className="h-3 w-3" /> {validRows.length} valid
                    </Badge>
                  )}
                  {invalidRows.length > 0 && (
                    <Badge className="bg-destructive/10 text-destructive gap-1">
                      <AlertTriangle className="h-3 w-3" /> {invalidRows.length} errors
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="h-[340px] rounded-md border border-border">
                <Table>
                  <TableHeader className="bg-muted/50 sticky top-0">
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Sub-County</TableHead>
                      <TableHead>Ward</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Validation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, i) => (
                      <TableRow key={i} className={row.errors.length > 0 ? "bg-destructive/5" : ""}>
                        <TableCell className="text-xs text-muted-foreground">{row.rowIndex}</TableCell>
                        <TableCell className="text-sm font-medium max-w-[160px] truncate">{row.name || "—"}</TableCell>
                        <TableCell className="text-sm">{row.sub_county || "—"}</TableCell>
                        <TableCell className="text-sm">{row.ward || "—"}</TableCell>
                        <TableCell className="text-sm">{row.status || "—"}</TableCell>
                        <TableCell>
                          {row.errors.length === 0 ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <span className="text-xs text-destructive">{row.errors[0]}{row.errors.length > 1 ? ` (+${row.errors.length - 1})` : ""}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleImport}
            disabled={validRows.length === 0 || importing}
            className="gap-2"
          >
            {importing && <Loader2 className="h-4 w-4 animate-spin" />}
            Import {validRows.length} Project{validRows.length !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

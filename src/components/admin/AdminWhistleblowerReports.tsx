import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, Search, Filter, MessageSquare, Printer, CheckCircle, Clock } from "lucide-react";

type WhistleblowerReport = {
  id: string;
  report_title: string;
  misconduct_type: string;
  urgency_level: string;
  report_type: string;
  full_name: string | null;
  incident_description: string;
  status: string;
  admin_reply: string | null;
  tracking_code: string;
  created_at: string;
};

export default function AdminWhistleblowerReports() {
  const [reports, setReports] = useState<WhistleblowerReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  const [selectedReport, setSelectedReport] = useState<WhistleblowerReport | null>(null);
  const [replyText, setReplyText] = useState("");
  const [updateStatus, setUpdateStatus] = useState("Investigating");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('whistleblower_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data as unknown as WhistleblowerReport[]);
    } catch (error: any) {
      console.error("Error fetching whistleblower reports:", error);
      toast.error("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSubmitReply = async () => {
    if (!selectedReport) return;
    
    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('whistleblower_reports')
        .update({ 
          admin_reply: replyText,
          status: updateStatus
        })
        .eq('id', selectedReport.id);

      if (error) throw error;
      
      toast.success("Reply and status updated successfully.");
      
      // Update local state
      setReports(reports.map(r => 
        r.id === selectedReport.id 
          ? { ...r, admin_reply: replyText, status: updateStatus } 
          : r
      ));
      
      setSelectedReport({
        ...selectedReport,
        admin_reply: replyText,
        status: updateStatus
      });
      
    } catch (error: any) {
      console.error("Error updating report:", error);
      toast.error("Failed to save reply.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.report_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.tracking_code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || r.status === statusFilter || (!r.status && statusFilter === "New");
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6 print:hidden">
        <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
          <Shield className="w-6 h-6 text-destructive" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Whistleblower Reports</h2>
          <p className="text-sm text-muted-foreground">Manage and reply to secure whistleblower submissions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List */}
        <div className="lg:col-span-1 bg-card rounded-xl border border-border flex flex-col h-[800px] print:hidden">
          <div className="p-4 border-b border-border space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by title or code..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="New">New</option>
                <option value="Investigating">Investigating</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loading ? (
              <p className="text-center text-sm text-muted-foreground py-8">Loading reports...</p>
            ) : filteredReports.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">No reports found.</p>
            ) : (
              filteredReports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => {
                    setSelectedReport(report);
                    setReplyText(report.admin_reply || "");
                    setUpdateStatus(report.status || "New");
                  }}
                  className={`w-fulltext-left p-3 rounded-lg border transition-colors text-left ${
                    selectedReport?.id === report.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:bg-muted/50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                      {report.tracking_code}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      (!report.status || report.status === "New") ? "bg-blue-100 text-blue-700" :
                      report.status === "Investigating" ? "bg-amber-100 text-amber-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      {report.status || "New"}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground line-clamp-1">{report.report_title}</h4>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                    <span className={`px-1.5 py-0.5 rounded border ${
                      report.urgency_level === "Critical" ? "border-red-200 text-red-600 bg-red-50" : 
                      report.urgency_level === "High" ? "border-orange-200 text-orange-600 bg-orange-50" : "border-border"
                    }`}>
                      {report.urgency_level}
                    </span>
                    <span>{new Date(report.created_at).toLocaleDateString()}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Details & Reply */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border min-h-[800px] flex flex-col print:border-none print:shadow-none">
          {selectedReport ? (
            <>
              {/* Print Header */}
              <div className="hidden print:block mb-8 border-b pb-4">
                <h1 className="text-2xl font-bold">Whistleblower Report: {selectedReport.tracking_code}</h1>
                <p className="text-sm text-gray-500">Printed on {new Date().toLocaleDateString()}</p>
              </div>

              <div className="p-6 border-b border-border flex justify-between items-start print:hidden">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">{selectedReport.report_title}</h3>
                  <p className="text-xs font-mono text-muted-foreground">Tracking ID: {selectedReport.tracking_code}</p>
                </div>
                <button
                  onClick={handlePrint}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="Print Report"
                >
                  <Printer className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Details Section */}
                <section>
                  <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider mb-4 border-b pb-2">Incident Details</h4>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-6">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Misconduct Type</p>
                      <p className="text-sm font-medium">{selectedReport.misconduct_type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Urgency Level</p>
                      <p className="text-sm font-medium">{selectedReport.urgency_level}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Report Type</p>
                      <p className="text-sm font-medium">{selectedReport.report_type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Date Submitted</p>
                      <p className="text-sm font-medium">{new Date(selectedReport.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Description</p>
                    <div className="bg-muted/30 p-4 rounded-lg whitespace-pre-wrap text-sm text-foreground">
                      {selectedReport.incident_description}
                    </div>
                  </div>
                </section>

                {/* Admin Reply Section - Print view */}
                <div className="hidden print:block">
                  <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider mb-4 border-b pb-2">Admin Resolution</h4>
                  <p><strong>Status:</strong> {selectedReport.status || 'New'}</p>
                  <p className="mt-2"><strong>Reply/Notes:</strong></p>
                  <div className="border p-4 mt-1">
                    {selectedReport.admin_reply || "No reply provided yet."}
                  </div>
                </div>

                {/* Admin Reply Section - Web View */}
                <section className="print:hidden">
                  <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Admin Reply & Status
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex gap-4 items-center">
                      <label className="text-sm font-medium">Update Status:</label>
                      <select 
                        className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                        value={updateStatus}
                        onChange={e => setUpdateStatus(e.target.value)}
                      >
                        <option value="New">New</option>
                        <option value="Investigating">Investigating</option>
                        <option value="Action Taken">Action Taken</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium block mb-2">Message to User:</label>
                      <p className="text-xs text-muted-foreground mb-2">
                        This message will be completely visible to the reporter if they check their tracking code on the public portal.
                      </p>
                      <textarea
                        className="w-full h-32 rounded-lg border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
                        placeholder="Type your official response..."
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                      />
                    </div>
                    
                    <button
                      onClick={handleSubmitReply}
                      disabled={submitting}
                      className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {submitting ? "Saving..." : "Save Reply & Status"}
                    </button>
                  </div>
                </section>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground print:hidden">
              <Shield className="w-16 h-16 mb-4 opacity-20" />
              <p>Select a report to view details and reply</p>
            </div>
          )}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .print\\:block, .print\\:block * { visibility: visible; }
          .print\\:hidden { display: none !important; }
          .lg\\:col-span-2 { position: absolute; left: 0; top: 0; width: 100%; height: auto; border: none; }
        }
      `}} />
    </div>
  );
}

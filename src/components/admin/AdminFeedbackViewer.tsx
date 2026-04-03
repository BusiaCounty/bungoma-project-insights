import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, Star, MessageSquare, Loader2, Download, Printer,
  MessageCircle, ChevronRight, Send, FileSpreadsheet, Forward, UserCheck, X, StickyNote,
} from "lucide-react";
import { fetchFeedback, updateFeedbackStatus, fetchFeedbackReplies, submitFeedbackReply, fetchSystemUsers, assignFeedback, unassignFeedback } from "@/data/projects";
import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "@/components/dashboard/PaginationControls";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const FEEDBACK_STATUSES = ["New", "Under Review", "In Progress", "Resolved"] as const;

const statusColors: Record<string, string> = {
  New: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  "Under Review": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  "In Progress": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  Resolved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
};

function FeedbackThread({ feedbackId }: { feedbackId: string }) {
  const queryClient = useQueryClient();
  const [replyText, setReplyText] = useState("");

  const { data: replies = [], isLoading } = useQuery({
    queryKey: ["feedback-replies", feedbackId],
    queryFn: () => fetchFeedbackReplies(feedbackId),
  });

  const { mutate: sendReply, isPending } = useMutation({
    mutationFn: () =>
      submitFeedbackReply({
        feedback_id: feedbackId,
        author_name: "Admin",
        message: replyText.trim(),
        is_admin: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback-replies", feedbackId] });
      setReplyText("");
      toast({ title: "Reply sent" });
    },
    onError: () => toast({ title: "Failed to send reply", variant: "destructive" }),
  });

  return (
    <div className="space-y-3">
      {isLoading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-primary" /></div>
      ) : replies.length === 0 ? (
        <p className="text-xs text-muted-foreground italic py-2">No replies yet. Start the conversation below.</p>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {replies.map((r: any) => (
            <div
              key={r.id}
              className={`rounded-lg px-3 py-2 text-xs ${
                r.is_admin
                  ? "bg-primary/10 border border-primary/20 ml-4"
                  : "bg-muted/40 border border-border mr-4"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-foreground">
                  {r.author_name}{r.is_admin && <Badge variant="outline" className="ml-1.5 text-[9px] px-1 py-0">Admin</Badge>}
                </span>
                <span className="text-[9px] text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed">{r.message}</p>
            </div>
          ))}
        </div>
      )}
      <form
        onSubmit={(e) => { e.preventDefault(); if (replyText.trim()) sendReply(); }}
        className="flex gap-2"
      >
        <Textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Type a reply..."
          className="text-xs min-h-[60px] flex-1"
          rows={2}
        />
        <Button type="submit" size="sm" disabled={isPending || !replyText.trim()} className="self-end">
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        </Button>
      </form>
    </div>
  );
}

export default function AdminFeedbackViewer() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);
  const [showForwardPanel, setShowForwardPanel] = useState(false);
  const [forwardUserId, setForwardUserId] = useState<string>("");
  const [forwardNote, setForwardNote] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ["admin-feedback"],
    queryFn: () => fetchFeedback(),
  });

  const { data: systemUsers = [] } = useQuery({
    queryKey: ["system-users"],
    queryFn: () => fetchSystemUsers(),
  });

  const { mutate: changeStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateFeedbackStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
      toast({ title: "Status updated" });
    },
    onError: () => toast({ title: "Failed to update status", variant: "destructive" }),
  });

  const { mutate: doAssign, isPending: isAssigning } = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      await assignFeedback(selectedFeedback.id, forwardUserId, forwardNote, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
      const assignedUser = systemUsers.find((u: any) => u.id === forwardUserId);
      toast({ title: `Forwarded to ${assignedUser?.full_name || "user"}` });
      setShowForwardPanel(false);
      setForwardUserId("");
      setForwardNote("");
      setSelectedFeedback((prev: any) => prev ? { ...prev, assigned_to: forwardUserId, internal_note: forwardNote } : null);
    },
    onError: () => toast({ title: "Failed to forward feedback", variant: "destructive" }),
  });

  const { mutate: doUnassign } = useMutation({
    mutationFn: () => unassignFeedback(selectedFeedback.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
      toast({ title: "Assignment removed" });
      setSelectedFeedback((prev: any) => prev ? { ...prev, assigned_to: null, internal_note: null } : null);
    },
    onError: () => toast({ title: "Failed to remove assignment", variant: "destructive" }),
  });

  const filtered = feedback.filter((f: any) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      f.author_name?.toLowerCase().includes(term) ||
      f.comment?.toLowerCase().includes(term) ||
      f.tracking_number?.toLowerCase().includes(term) ||
      f.project_name?.toLowerCase().includes(term);
    const matchesStatus = statusFilter === "all" || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const FEEDBACK_PER_PAGE = 10;
  const { currentPage, totalPages, paginatedItems, setCurrentPage, totalItems, startIndex } =
    usePagination(filtered, FEEDBACK_PER_PAGE);

  const avgRating = feedback.length
    ? (feedback.reduce((sum: number, f: any) => sum + (f.rating || 0), 0) / feedback.filter((f: any) => f.rating).length).toFixed(1)
    : "N/A";

  const statusCounts = FEEDBACK_STATUSES.reduce((acc, s) => {
    acc[s] = feedback.filter((f: any) => (f.status || "New") === s).length;
    return acc;
  }, {} as Record<string, number>);

  // Export CSV
  const exportCSV = () => {
    const headers = ["Tracking #", "Project", "Author", "Comment", "Rating", "Status", "Date"];
    const rows = filtered.map((f: any) => [
      f.tracking_number || "-",
      `"${(f.project_name || "N/A").replace(/"/g, '""')}"`,
      f.author_name || "Anonymous",
      `"${(f.comment || "").replace(/"/g, '""')}"`,
      f.rating || "",
      f.status || "New",
      new Date(f.created_at).toLocaleDateString("en-KE"),
    ]);
    const csv = [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedback-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV exported" });
  };

  // Print
  const handlePrint = async () => {
    // Fetch replies for all filtered feedback
    const feedbackWithReplies = await Promise.all(
      filtered.map(async (f: any) => {
        const replies = await fetchFeedbackReplies(f.id);
        return { ...f, replies };
      })
    );

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const rows = feedbackWithReplies.map((f: any) => {
      const repliesHtml = f.replies?.length > 0
        ? `<div style="margin-top:8px;padding-top:6px;border-top:1px dashed #ccc;font-size:11px;">
            <strong>Replies:</strong>
            ${f.replies.map((r: any) => `
              <div style="margin:4px 0;padding:4px 8px;background:${r.is_admin ? '#e8f4fd' : '#f5f5f5'};border-radius:4px;">
                <span style="font-weight:bold;color:${r.is_admin ? '#0066cc' : '#666'}">${r.author_name}${r.is_admin ? ' (Admin)' : ''}</span>
                <span style="color:#999;font-size:10px;margin-left:8px">${new Date(r.created_at).toLocaleDateString("en-KE")}</span>
                <p style="margin:2px 0 0 0;color:#333">${r.message}</p>
              </div>
            `).join('')}
           </div>`
        : '';
      return `
      <tr>
        <td style="padding:6px;border:1px solid #ddd">${f.tracking_number || "-"}</td>
        <td style="padding:6px;border:1px solid #ddd">${f.project_name || "N/A"}</td>
        <td style="padding:6px;border:1px solid #ddd">${f.author_name || "Anonymous"}</td>
        <td style="padding:6px;border:1px solid #ddd">
          <div>${f.comment}</div>
          ${repliesHtml}
        </td>
        <td style="padding:6px;border:1px solid #ddd">${f.rating ? "★".repeat(f.rating) : "-"}</td>
        <td style="padding:6px;border:1px solid #ddd">${f.status || "New"}</td>
        <td style="padding:6px;border:1px solid #ddd">${new Date(f.created_at).toLocaleDateString("en-KE")}</td>
      </tr>
    `;
    }).join("");
    printWindow.document.write(`
      <html><head><title>Feedback Report</title></head>
      <body style="font-family:sans-serif;padding:20px">
        <h1 style="font-size:18px">Citizen Feedback Report</h1>
        <p style="color:#666;font-size:12px">Generated: ${new Date().toLocaleString("en-KE")} · Total: ${filtered.length} entries</p>
        <table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:12px">
          <thead><tr style="background:#f5f5f5">
            <th style="padding:6px;border:1px solid #ddd;text-align:left">Tracking #</th>
            <th style="padding:6px;border:1px solid #ddd;text-align:left">Project</th>
            <th style="padding:6px;border:1px solid #ddd;text-align:left">Author</th>
            <th style="padding:6px;border:1px solid #ddd;text-align:left">Comment & Replies</th>
            <th style="padding:6px;border:1px solid #ddd;text-align:left">Rating</th>
            <th style="padding:6px;border:1px solid #ddd;text-align:left">Status</th>
            <th style="padding:6px;border:1px solid #ddd;text-align:left">Date</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Citizen Feedback</h2>
        <p className="text-muted-foreground text-sm">Manage feedback with conversations, status tracking, and reporting.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Feedback</p>
              <p className="text-2xl font-bold">{feedback.length}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-primary/30" />
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
              <p className="text-2xl font-bold">{avgRating}</p>
            </div>
            <Star className="w-8 h-8 text-amber-400/50" />
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">New</p>
              <p className="text-2xl font-bold">{statusCounts["New"]}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300">!</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Resolved</p>
              <p className="text-2xl font-bold">{statusCounts["Resolved"]}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">✓</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>All Feedback</CardTitle>
              <CardDescription>Click a row to view conversation thread and manage status.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56 sm:flex-initial">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {FEEDBACK_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <FileSpreadsheet className="w-4 h-4 mr-1" /> CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-1" /> Print
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="rounded-md border border-border" ref={printRef}>
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Tracking #</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-8"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center h-24 text-muted-foreground">
                          No feedback found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedItems.map((item: any) => (
                        <TableRow
                          key={item.id}
                          className="cursor-pointer hover:bg-muted/30"
                          onClick={() => setSelectedFeedback(item)}
                        >
                          <TableCell className="font-mono text-xs font-semibold text-primary">
                            {item.tracking_number || "-"}
                          </TableCell>
                          <TableCell className="text-sm max-w-[180px]">
                            <p className="line-clamp-1 font-medium">{item.project_name || <span className="text-muted-foreground italic">N/A</span>}</p>
                          </TableCell>
                          <TableCell className="font-medium text-sm">{item.author_name || "Anonymous"}</TableCell>
                          <TableCell className="text-sm max-w-[250px]">
                            <p className="line-clamp-2">{item.comment}</p>
                          </TableCell>
                          <TableCell>
                            {item.rating ? (
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < item.rating! ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                                  />
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-[10px] ${statusColors[item.status || "New"] || statusColors["New"]}`}>
                              {item.status || "New"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {item.assigned_to ? (
                              <Badge variant="outline" className="text-[10px] gap-1">
                                <UserCheck className="w-3 h-3" />
                                {systemUsers.find((u: any) => u.id === item.assigned_to)?.full_name || "User"}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(item.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                          </TableCell>
                          <TableCell>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                startIndex={startIndex}
                pageSize={FEEDBACK_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedFeedback} onOpenChange={(open) => { if (!open) { setSelectedFeedback(null); setShowForwardPanel(false); setForwardUserId(""); setForwardNote(""); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Feedback Detail
            </DialogTitle>
            <DialogDescription>View, reply, and update the status of this feedback entry.</DialogDescription>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-4">
              {/* Original feedback */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm font-semibold text-foreground">{selectedFeedback.author_name || "Anonymous"}</span>
                    {selectedFeedback.tracking_number && (
                      <p className="text-xs font-mono text-primary mt-0.5">
                        {selectedFeedback.tracking_number}
                      </p>
                    )}
                    {selectedFeedback.project_name && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Project: <span className="font-medium text-foreground">{selectedFeedback.project_name}</span>
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(selectedFeedback.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                {selectedFeedback.rating && (
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < selectedFeedback.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                )}
                <p className="text-sm text-foreground leading-relaxed">{selectedFeedback.comment}</p>
              </div>

              {/* Status selector */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">Status:</span>
                <Select
                  value={selectedFeedback.status || "New"}
                  onValueChange={(val) => {
                    changeStatus({ id: selectedFeedback.id, status: val });
                    setSelectedFeedback({ ...selectedFeedback, status: val });
                  }}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FEEDBACK_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assignment / Forward Section */}
              <div className="border border-border rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Forward className="w-4 h-4" /> Forward to User
                  </h4>
                  {selectedFeedback.assigned_to && !showForwardPanel && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => doUnassign()}>
                      <X className="w-3 h-3 mr-1" /> Remove
                    </Button>
                  )}
                </div>

                {selectedFeedback.assigned_to && !showForwardPanel ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 bg-muted/40 rounded-md px-3 py-2">
                      <UserCheck className="w-4 h-4 text-primary" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-foreground">
                          {systemUsers.find((u: any) => u.id === selectedFeedback.assigned_to)?.full_name || "Assigned User"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {systemUsers.find((u: any) => u.id === selectedFeedback.assigned_to)?.department || ""}
                          {" · "}
                          {systemUsers.find((u: any) => u.id === selectedFeedback.assigned_to)?.email || ""}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => {
                        setForwardUserId(selectedFeedback.assigned_to);
                        setForwardNote(selectedFeedback.internal_note || "");
                        setShowForwardPanel(true);
                      }}>
                        Reassign
                      </Button>
                    </div>
                    {selectedFeedback.internal_note && (
                      <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-md px-3 py-2">
                        <StickyNote className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-800 dark:text-amber-300">{selectedFeedback.internal_note}</p>
                      </div>
                    )}
                  </div>
                ) : showForwardPanel ? (
                  <div className="space-y-3">
                    <Select value={forwardUserId} onValueChange={setForwardUserId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a user to forward to..." />
                      </SelectTrigger>
                      <SelectContent>
                        {systemUsers.map((u: any) => (
                          <SelectItem key={u.id} value={u.id}>
                            <span className="font-medium">{u.full_name || u.email}</span>
                            {u.department && <span className="text-muted-foreground ml-1">· {u.department}</span>}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Textarea
                      value={forwardNote}
                      onChange={(e) => setForwardNote(e.target.value)}
                      placeholder="Internal note (optional) — only visible to staff, not to the citizen..."
                      className="text-xs min-h-[50px]"
                      rows={2}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => {
                        setShowForwardPanel(false);
                        setForwardUserId("");
                        setForwardNote("");
                      }}>
                        Cancel
                      </Button>
                      <Button size="sm" disabled={!forwardUserId || isAssigning} onClick={() => doAssign()}>
                        {isAssigning ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Forward className="w-3.5 h-3.5 mr-1" />}
                        Forward
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setShowForwardPanel(true)}>
                    <Forward className="w-3.5 h-3.5 mr-1.5" /> Forward this feedback to a user
                  </Button>
                )}
              </div>
              {/* Thread */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" /> Conversation
                </h4>
                <FeedbackThread feedbackId={selectedFeedback.id} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

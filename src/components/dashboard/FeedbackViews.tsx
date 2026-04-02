import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquareText, ShieldAlert, Star, Clock, ChevronDown, ChevronUp, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface FeedbackWithReplies {
  id: string;
  author_name: string;
  comment: string;
  rating: number | null;
  status: string;
  tracking_number: string | null;
  created_at: string;
  project_id: string | null;
  project_name?: string;
  replies: { id: string; message: string; author_name: string; is_admin: boolean; created_at: string }[];
}

export default function FeedbackViews() {
  const [search, setSearch] = useState("");
  const [expandedFeedback, setExpandedFeedback] = useState<Set<string>>(new Set());
  const [expandedReport, setExpandedReport] = useState<Set<string>>(new Set());

  const { data: feedbackData = [], isLoading: feedbackLoading } = useQuery({
    queryKey: ["public-feedback-views"],
    queryFn: async () => {
      const { data: feedback, error } = await supabase
        .from("project_feedback")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const { data: replies } = await supabase
        .from("feedback_replies")
        .select("*")
        .order("created_at", { ascending: true });

      const { data: projects } = await supabase
        .from("projects")
        .select("id, name");

      const projectMap = new Map((projects || []).map(p => [p.id, p.name]));
      const replyMap = new Map<string, typeof replies>();
      (replies || []).forEach(r => {
        const arr = replyMap.get(r.feedback_id) || [];
        arr.push(r);
        replyMap.set(r.feedback_id, arr);
      });

      return (feedback || []).map(f => ({
        ...f,
        project_name: f.project_id ? projectMap.get(f.project_id) || "Unknown" : "General",
        replies: replyMap.get(f.id) || [],
      })) as FeedbackWithReplies[];
    },
  });

  const { data: whistleblowerData = [], isLoading: wbLoading } = useQuery({
    queryKey: ["public-whistleblower-views"],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_whistleblower_report_by_tracking", { p_tracking_code: "" });
      // RPC won't work for listing all - use direct select (public can read via RLS)
      const res = await supabase
        .from("whistleblower_reports")
        .select("id, report_title, misconduct_type, urgency_level, status, admin_reply, created_at, tracking_code, sub_county")
        .order("created_at", { ascending: false });
      if (res.error) throw res.error;
      return res.data || [];
    },
  });

  const toggleFeedback = (id: string) => {
    setExpandedFeedback(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleReport = (id: string) => {
    setExpandedReport(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filteredFeedback = feedbackData.filter(f =>
    f.comment.toLowerCase().includes(search.toLowerCase()) ||
    f.author_name.toLowerCase().includes(search.toLowerCase()) ||
    (f.project_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredReports = whistleblowerData.filter(r =>
    r.report_title.toLowerCase().includes(search.toLowerCase()) ||
    r.misconduct_type.toLowerCase().includes(search.toLowerCase()) ||
    (r.sub_county || "").toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (s: string) => {
    switch (s?.toLowerCase()) {
      case "resolved": return "bg-green-500/10 text-green-700 border-green-500/20";
      case "in progress": return "bg-blue-500/10 text-blue-700 border-blue-500/20";
      case "under review": return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
      case "new": return "bg-muted text-muted-foreground border-border";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const urgencyColor = (u: string | null) => {
    switch (u) {
      case "Critical": return "bg-red-500/10 text-red-700 border-red-500/20";
      case "High": return "bg-orange-500/10 text-orange-700 border-orange-500/20";
      case "Medium": return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
      case "Low": return "bg-green-500/10 text-green-700 border-green-500/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search feedback or reports..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs defaultValue="feedback" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="feedback" className="gap-2">
            <MessageSquareText className="w-4 h-4" />
            Citizen Feedback ({filteredFeedback.length})
          </TabsTrigger>
          <TabsTrigger value="whistleblower" className="gap-2">
            <ShieldAlert className="w-4 h-4" />
            Whistleblower ({filteredReports.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="mt-4">
          {feedbackLoading ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Loading feedback...</div>
          ) : filteredFeedback.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No feedback found.</div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredFeedback.map(f => {
                const isExpanded = expandedFeedback.has(f.id);
                const adminReplies = f.replies.filter(r => r.is_admin);
                return (
                  <Card key={f.id} className="border-border shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-bold text-foreground">{f.author_name}</span>
                            <Badge variant="outline" className={`text-[10px] ${statusColor(f.status)}`}>
                              {f.status}
                            </Badge>
                            {f.tracking_number && (
                              <span className="text-[10px] text-muted-foreground font-mono">{f.tracking_number}</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {f.project_name} • {format(new Date(f.created_at), "dd MMM yyyy")}
                          </p>
                          {f.rating && (
                            <div className="flex items-center gap-0.5 mb-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < f.rating! ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`} />
                              ))}
                            </div>
                          )}
                          <p className="text-sm text-foreground">{f.comment}</p>
                        </div>
                        {adminReplies.length > 0 && (
                          <button onClick={() => toggleFeedback(f.id)} className="shrink-0 p-1 hover:bg-muted rounded">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        )}
                      </div>

                      {adminReplies.length > 0 && isExpanded && (
                        <div className="mt-3 pt-3 border-t border-border space-y-2">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Admin Replies</p>
                          {adminReplies.map(r => (
                            <div key={r.id} className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-primary">{r.author_name}</span>
                                <span className="text-[10px] text-muted-foreground">{format(new Date(r.created_at), "dd MMM yyyy")}</span>
                              </div>
                              <p className="text-sm text-foreground">{r.message}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {adminReplies.length > 0 && !isExpanded && (
                        <p className="mt-2 text-[10px] text-primary font-semibold cursor-pointer" onClick={() => toggleFeedback(f.id)}>
                          {adminReplies.length} admin {adminReplies.length === 1 ? "reply" : "replies"} — click to view
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="whistleblower" className="mt-4">
          {wbLoading ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Loading reports...</div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No reports found.</div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredReports.map(r => {
                const isExpanded = expandedReport.has(r.id);
                return (
                  <Card key={r.id} className="border-border shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-bold text-foreground">{r.report_title}</span>
                            <Badge variant="outline" className={`text-[10px] ${statusColor(r.status || "New")}`}>
                              {r.status || "New"}
                            </Badge>
                            {r.urgency_level && (
                              <Badge variant="outline" className={`text-[10px] ${urgencyColor(r.urgency_level)}`}>
                                {r.urgency_level}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {r.misconduct_type} • {r.sub_county || "N/A"} • {format(new Date(r.created_at), "dd MMM yyyy")}
                          </p>
                          {r.tracking_code && (
                            <span className="text-[10px] text-muted-foreground font-mono">Tracking: {r.tracking_code}</span>
                          )}
                        </div>
                        {r.admin_reply && (
                          <button onClick={() => toggleReport(r.id)} className="shrink-0 p-1 hover:bg-muted rounded">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        )}
                      </div>

                      {r.admin_reply && isExpanded && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Admin Response</p>
                          <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                            <p className="text-sm text-foreground">{r.admin_reply}</p>
                          </div>
                        </div>
                      )}
                      {r.admin_reply && !isExpanded && (
                        <p className="mt-2 text-[10px] text-primary font-semibold cursor-pointer" onClick={() => toggleReport(r.id)}>
                          Admin response available — click to view
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

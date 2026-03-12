import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Star, MessageSquare, Loader2 } from "lucide-react";
import { fetchFeedback } from "@/data/projects";

export default function AdminFeedbackViewer() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ["admin-feedback"],
    queryFn: () => fetchFeedback(),
  });

  const filtered = feedback.filter(
    (f) =>
      f.author_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.comment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const avgRating = feedback.length
    ? (feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.filter(f => f.rating).length).toFixed(1)
    : "N/A";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Citizen Feedback</h2>
        <p className="text-muted-foreground text-sm">View and manage feedback submitted by citizens on projects.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
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
              <p className="text-sm font-medium text-muted-foreground">With Ratings</p>
              <p className="text-2xl font-bold">{feedback.filter(f => f.rating).length}</p>
            </div>
            <Star className="w-8 h-8 text-emerald-400/50" />
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>All Feedback</CardTitle>
              <CardDescription>Citizen comments and ratings on county projects.</CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search feedback..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Author</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                        No feedback found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-sm">{item.author_name || "Anonymous"}</TableCell>
                        <TableCell className="text-sm max-w-[300px]">
                          <p className="line-clamp-2">{item.comment}</p>
                        </TableCell>
                        <TableCell>
                          {item.rating ? (
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${i < item.rating! ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                                />
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">No rating</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(item.created_at).toLocaleDateString("en-KE", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

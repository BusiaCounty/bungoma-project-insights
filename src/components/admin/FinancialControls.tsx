import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Banknote, AlertTriangle, PieChart, Info } from "lucide-react";

export default function FinancialControls() {
  const budgetCategories = [
    { label: "Equitable Share", allocated: "B 6.2", spent: "B 4.1", status: "On Track" },
    { label: "Conditional Grants", allocated: "M 850", spent: "M 120", status: "Lagging" },
    { label: "Own Source Revenue", allocated: "M 600", spent: "M 450", status: "On Track" },
    { label: "Development Partners", allocated: "B 1.2", spent: "M 900", status: "Review Needed" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Financial Controls</h2>
          <p className="text-muted-foreground text-sm">Monitor budgets, set alerts, and manage financial categories across all projects.</p>
        </div>
        <Button className="gap-2 shrink-0">
          <Banknote className="w-4 h-4" /> Add Funding Source
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border shadow-sm">
              <CardHeader>
                  <CardTitle>Budget Sources Overview</CardTitle>
                  <CardDescription>Fiscal Year 2025/2026</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  {budgetCategories.map((category) => (
                      <div key={category.label} className="flex flex-col gap-2 p-3 bg-card border border-border rounded-lg">
                          <div className="flex items-center justify-between">
                             <span className="font-medium text-sm">{category.label}</span>
                             <Badge variant={category.status === "On Track" ? "default" : "destructive"} className={category.status === "On Track" ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" : ""}>
                                 {category.status}
                             </Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Allocated: {category.allocated} KES</span>
                              <span>Spent: {category.spent} KES</span>
                          </div>
                          {/* Progress bar visual approximation */}
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                              <div className={`h-full ${category.status === 'On Track' ? 'bg-emerald-500' : category.status === 'Lagging' ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: '65%' }}></div>
                          </div>
                      </div>
                  ))}
              </CardContent>
          </Card>
          
          <div className="space-y-6">
             <Card className="border-border shadow-sm">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Financial Alert Thresholds</CardTitle>
                        <CardDescription>Automated warnings for cost overruns.</CardDescription>
                    </div>
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                </CardHeader>
                <CardContent className="space-y-3 p-4 bg-muted/20 border-t border-border mt-2">
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-medium flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Warning Threshold</span>
                        <span>85% of Allocation</span>
                    </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="font-medium flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Critical Threshold</span>
                        <span>95% of Allocation</span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-4 pt-4 border-t border-border">
                        <Info className="w-3 h-3"/> Alerts trigger emails to assigned Sub-County admins.
                    </p>
                    <Button variant="outline" className="w-full mt-2">Edit Thresholds</Button>
                </CardContent>
             </Card>

             <Card className="border-border shadow-sm bg-gradient-to-br from-card to-muted border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 tracking-tight">
                        <PieChart className="w-5 h-5 text-primary" /> Integrated IFMIS Link
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                   <p className="text-muted-foreground mb-4 leading-relaxed">System is currently syncing financial transactions with the county's central IFMIS portal. Last sync was successful 2 hours ago.</p>
                   <Button className="w-full bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm font-semibold">Force Sync Now</Button>
                </CardContent>
             </Card>
          </div>
      </div>
    </div>
  );
}

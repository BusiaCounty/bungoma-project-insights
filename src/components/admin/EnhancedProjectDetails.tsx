import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { 
  Calendar, 
  DollarSign, 
  Users, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Target,
  Activity,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2
} from "lucide-react";
import type { Project } from "@/data/projects";

interface EnhancedProjectDetailsProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  actualDate?: string;
  status: "completed" | "in-progress" | "upcoming" | "overdue";
  progress: number;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  category: "plans" | "reports" | "photos" | "contracts" | "other";
}

interface Stakeholder {
  id: string;
  name: string;
  role: string;
  organization: string;
  email: string;
  phone: string;
  type: "team" | "contractor" | "consultant" | "government" | "community";
}

const mockMilestones: Milestone[] = [
  {
    id: "1",
    title: "Project Kickoff",
    description: "Initial project planning and team formation",
    targetDate: "2024-01-15",
    actualDate: "2024-01-12",
    status: "completed",
    progress: 100
  },
  {
    id: "2", 
    title: "Site Survey",
    description: "Complete site analysis and feasibility study",
    targetDate: "2024-02-28",
    actualDate: "2024-03-05",
    status: "completed",
    progress: 100
  },
  {
    id: "3",
    title: "Design Phase",
    description: "Architectural and engineering design completion",
    targetDate: "2024-04-30",
    status: "in-progress",
    progress: 75
  },
  {
    id: "4",
    title: "Procurement",
    description: "Material and contractor procurement",
    targetDate: "2024-06-15",
    status: "upcoming",
    progress: 0
  },
  {
    id: "5",
    title: "Construction Start",
    description: "Begin construction activities",
    targetDate: "2024-07-01",
    status: "upcoming",
    progress: 0
  }
];

const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Project Proposal.pdf",
    type: "PDF",
    size: "2.4 MB",
    uploadDate: "2024-01-10",
    category: "plans"
  },
  {
    id: "2",
    name: "Site Survey Report.docx",
    type: "DOCX", 
    size: "1.8 MB",
    uploadDate: "2024-03-01",
    category: "reports"
  },
  {
    id: "3",
    name: "Architectural Plans.dwg",
    type: "DWG",
    size: "5.2 MB",
    uploadDate: "2024-04-15",
    category: "plans"
  }
];

const mockStakeholders: Stakeholder[] = [
  {
    id: "1",
    name: "John Kimani",
    role: "Project Manager",
    organization: "County Government",
    email: "john.kimani@bungoma.go.ke",
    phone: "+254 712 345 678",
    type: "team"
  },
  {
    id: "2",
    name: "Sarah Wanjiku",
    role: "Lead Engineer",
    organization: "Engineering Solutions Ltd",
    email: "sarah.w@engsolutions.co.ke",
    phone: "+254 723 456 789",
    type: "contractor"
  }
];

export default function EnhancedProjectDetails({ project, open, onOpenChange }: EnhancedProjectDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!project) return null;

  // Financial data for charts
  const financialData = [
    { name: "Q1", budget: 1000000, actual: 950000 },
    { name: "Q2", budget: 1500000, actual: 1600000 },
    { name: "Q3", budget: 2000000, actual: 1800000 },
    { name: "Q4", budget: 1500000, actual: 0 }
  ];

  const budgetUtilization = [
    { name: "Spent", value: project.actual_spend || 0, color: "#3b82f6" },
    { name: "Remaining", value: Math.max(0, project.budget - (project.actual_spend || 0)), color: "#e5e7eb" }
  ];

  const progressBySector = [
    { name: "Planning", value: 100, color: "#10b981" },
    { name: "Design", value: 75, color: "#3b82f6" },
    { name: "Procurement", value: 20, color: "#f59e0b" },
    { name: "Construction", value: 0, color: "#6b7280" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/10 text-green-600 border-green-200";
      case "in-progress": return "bg-blue-500/10 text-blue-600 border-blue-200";
      case "upcoming": return "bg-gray-500/10 text-gray-600 border-gray-200";
      case "overdue": return "bg-red-500/10 text-red-600 border-red-200";
      default: return "bg-gray-500/10 text-gray-600 border-gray-200";
    }
  };

  const getStakeholderColor = (type: string) => {
    switch (type) {
      case "team": return "bg-blue-500/10 text-blue-600";
      case "contractor": return "bg-green-500/10 text-green-600";
      case "consultant": return "bg-purple-500/10 text-purple-600";
      case "government": return "bg-orange-500/10 text-orange-600";
      case "community": return "bg-teal-500/10 text-teal-600";
      default: return "bg-gray-500/10 text-gray-600";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{project.name}</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="stakeholders">Team</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Budget</p>
                      <p className="text-lg font-bold">KES {Number(project.budget).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <p className="text-lg font-bold">{project.progress}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Financial Year</p>
                      <p className="text-lg font-bold">{project.fy}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Sub-County</p>
                      <p className="font-medium">{project.sub_county}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ward</p>
                      <p className="font-medium">{project.ward}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sector</p>
                      <p className="font-medium">{project.sector}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Actual Spend</p>
                      <p className="font-medium">KES {Number(project.actual_spend || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  {project.description && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Description</p>
                      <p className="text-sm">{project.description}</p>
                    </div>
                  )}
                  {project.latitude && project.longitude && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span>GPS: {project.latitude}, {project.longitude}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Progress Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-sm">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    {progressBySector.map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">{item.name}</span>
                          <span className="text-sm">{item.value}%</span>
                        </div>
                        <Progress value={item.value} className="h-1" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Budget vs Actual Spending</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={financialData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`KES ${Number(value).toLocaleString()}`, ""]} />
                      <Legend />
                      <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
                      <Bar dataKey="actual" fill="#10b981" name="Actual" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Budget Utilization</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={budgetUtilization}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {budgetUtilization.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`KES ${Number(value).toLocaleString()}`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 mt-4">
                    {budgetUtilization.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm">{item.name}: KES {Number(item.value).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Budget</p>
                    <p className="text-2xl font-bold text-blue-600">KES {Number(project.budget).toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Actual Spend</p>
                    <p className="text-2xl font-bold text-green-600">KES {Number(project.actual_spend || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Remaining Budget</p>
                    <p className="text-2xl font-bold text-orange-600">KES {Number(Math.max(0, project.budget - (project.actual_spend || 0))).toLocaleString()}</p>
                  </div>
                </div>
                {project.projected_cost && (
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Projected Total Cost</p>
                        <p className="text-lg font-semibold">KES {Number(project.projected_cost).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cost Variance</p>
                        <p className={`text-lg font-semibold ${project.projected_cost > project.budget ? 'text-red-600' : 'text-green-600'}`}>
                          KES {Number(project.projected_cost - project.budget).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Project Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockMilestones.map((milestone, index) => (
                    <div key={milestone.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          milestone.status === 'completed' ? 'bg-green-500 border-green-500' :
                          milestone.status === 'in-progress' ? 'bg-blue-500 border-blue-500' :
                          milestone.status === 'overdue' ? 'bg-red-500 border-red-500' :
                          'bg-gray-300 border-gray-300'
                        }`} />
                        {index < mockMilestones.length - 1 && (
                          <div className={`w-0.5 h-16 ${
                            milestone.status === 'completed' ? 'bg-green-200' :
                            milestone.status === 'in-progress' ? 'bg-blue-200' :
                            'bg-gray-200'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{milestone.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                Target: {new Date(milestone.targetDate).toLocaleDateString()}
                              </div>
                              {milestone.actualDate && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                  Completed: {new Date(milestone.actualDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm">Progress</span>
                                <span className="text-sm">{milestone.progress}%</span>
                              </div>
                              <Progress value={milestone.progress} className="h-2" />
                            </div>
                          </div>
                          <Badge className={getStatusColor(milestone.status)}>
                            {milestone.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Project Documents
                  </CardTitle>
                  <Button className="gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Document
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{doc.type}</span>
                            <span>•</span>
                            <span>{doc.size}</span>
                            <span>•</span>
                            <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{doc.category}</Badge>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stakeholders Tab */}
          <TabsContent value="stakeholders" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Project Team & Stakeholders
                  </CardTitle>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockStakeholders.map((stakeholder) => (
                    <div key={stakeholder.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{stakeholder.name}</h4>
                          <p className="text-sm text-muted-foreground">{stakeholder.role}</p>
                        </div>
                        <Badge className={getStakeholderColor(stakeholder.type)}>
                          {stakeholder.type}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Organization:</span>
                          <span>{stakeholder.organization}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Email:</span>
                          <span>{stakeholder.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Phone:</span>
                          <span>{stakeholder.phone}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm" className="text-red-600">Remove</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Budget Efficiency</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }} />
                        </div>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Timeline Adherence</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '72%' }} />
                        </div>
                        <span className="text-sm font-medium">72%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Quality Score</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: '90%' }} />
                        </div>
                        <span className="text-sm font-medium">90%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Stakeholder Satisfaction</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{ width: '78%' }} />
                        </div>
                        <span className="text-sm font-medium">78%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border-l-4 border-red-500 bg-red-50 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-red-800">Budget Overrun Risk</h5>
                          <p className="text-sm text-red-600 mt-1">Current spending trend may exceed budget</p>
                        </div>
                        <Badge className="bg-red-100 text-red-800">High</Badge>
                      </div>
                    </div>
                    <div className="p-3 border-l-4 border-yellow-500 bg-yellow-50 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-yellow-800">Timeline Delay</h5>
                          <p className="text-sm text-yellow-600 mt-1">Design phase extending beyond schedule</p>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
                      </div>
                    </div>
                    <div className="p-3 border-l-4 border-green-500 bg-green-50 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-green-800">Resource Availability</h5>
                          <p className="text-sm text-green-600 mt-1">All required resources are secured</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Low</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progress Trend Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="budget" stroke="#3b82f6" strokeWidth={2} name="Planned Progress" />
                    <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Actual Progress" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

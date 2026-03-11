import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Users, CalendarDays, ClipboardList, PlusCircle, Trash2,
  User, Phone, Mail, CheckCircle2, Clock, AlertCircle, ChevronDown,
} from "lucide-react";
import type { Project } from "@/data/projects";
import {
  fetchCommitteeMembers, fetchCommitteeMeetings, fetchCommitteeTasks,
  createCommitteeMember, deleteCommitteeMember,
  createCommitteeMeeting, deleteCommitteeMeeting,
  createCommitteeTask, updateCommitteeTaskStatus, deleteCommitteeTask,
  type CommitteeMember, type CommitteeMeeting, type CommitteeTask,
} from "@/data/committee";
import { toast } from "sonner";

type SubTab = "overview" | "members" | "meetings" | "tasks";

interface Props {
  projects: Project[];
  isAdmin?: boolean;
}

const taskStatusIcon: Record<string, React.ReactNode> = {
  Pending: <Clock className="w-3.5 h-3.5 text-amber-500" />,
  "In Progress": <AlertCircle className="w-3.5 h-3.5 text-primary" />,
  Done: <CheckCircle2 className="w-3.5 h-3.5 text-success" />,
};

const taskStatusClass: Record<string, string> = {
  Pending: "bg-amber-500/10 text-amber-600",
  "In Progress": "bg-primary/10 text-primary",
  Done: "bg-success/10 text-success",
};

const CommitteeModule = ({ projects, isAdmin = false }: Props) => {
  const qc = useQueryClient();
  const [subTab, setSubTab] = useState<SubTab>("overview");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");

  const { data: members = [] } = useQuery({
    queryKey: ["committee_members"],
    queryFn: () => fetchCommitteeMembers(),
  });
  const { data: meetings = [] } = useQuery({
    queryKey: ["committee_meetings"],
    queryFn: () => fetchCommitteeMeetings(),
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ["committee_tasks"],
    queryFn: () => fetchCommitteeTasks(),
  });

  const filteredMembers = useMemo(() =>
    selectedProjectId === "all" ? members : members.filter(m => m.project_id === selectedProjectId),
    [members, selectedProjectId]
  );
  const filteredMeetings = useMemo(() =>
    selectedProjectId === "all" ? meetings : meetings.filter(m => m.project_id === selectedProjectId),
    [meetings, selectedProjectId]
  );
  const filteredTasks = useMemo(() =>
    selectedProjectId === "all" ? tasks : tasks.filter(t => t.project_id === selectedProjectId),
    [tasks, selectedProjectId]
  );

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ["committee_members"] });
    qc.invalidateQueries({ queryKey: ["committee_meetings"] });
    qc.invalidateQueries({ queryKey: ["committee_tasks"] });
  };

  const projectName = (id: string) => projects.find(p => p.id === id)?.name || "Unknown";

  const subTabs: { id: SubTab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: Users },
    { id: "members", label: "Members", icon: User },
    { id: "meetings", label: "Meetings", icon: CalendarDays },
    { id: "tasks", label: "Tasks", icon: ClipboardList },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="bg-card rounded-xl border border-border shadow-card p-4">
        <h2 className="text-sm font-extrabold text-foreground mb-1">Project Management Committees</h2>
        <p className="text-[10px] text-muted-foreground">Manage committee members, meetings, and task assignments per project.</p>
      </div>

      {/* Project filter + sub-tabs */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <select
            value={selectedProjectId}
            onChange={e => setSelectedProjectId(e.target.value)}
            className="appearance-none bg-card border border-border rounded-lg px-3 py-2 pr-8 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>

        <div className="flex gap-1">
          {subTabs.map(t => (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                subTab === t.id
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "bg-card text-muted-foreground border border-border hover:text-foreground"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {subTab === "overview" && (
        <OverviewPanel members={filteredMembers} meetings={filteredMeetings} tasks={filteredTasks} projects={projects} />
      )}
      {subTab === "members" && (
        <MembersPanel members={filteredMembers} projects={projects} selectedProjectId={selectedProjectId} isAdmin={isAdmin} onMutate={invalidateAll} />
      )}
      {subTab === "meetings" && (
        <MeetingsPanel meetings={filteredMeetings} members={members} projects={projects} selectedProjectId={selectedProjectId} isAdmin={isAdmin} onMutate={invalidateAll} />
      )}
      {subTab === "tasks" && (
        <TasksPanel tasks={filteredTasks} members={members} projects={projects} selectedProjectId={selectedProjectId} isAdmin={isAdmin} onMutate={invalidateAll} />
      )}
    </div>
  );
};

/* ─── Overview ────────────────────────────────────── */
function OverviewPanel({ members, meetings, tasks, projects }: {
  members: CommitteeMember[]; meetings: CommitteeMeeting[]; tasks: CommitteeTask[]; projects: Project[];
}) {
  const stats = [
    { label: "Total Members", value: members.length, icon: Users, color: "text-primary" },
    { label: "Meetings Held", value: meetings.length, icon: CalendarDays, color: "text-secondary" },
    { label: "Tasks Assigned", value: tasks.length, icon: ClipboardList, color: "text-accent-foreground" },
    { label: "Tasks Completed", value: tasks.filter(t => t.status === "Done").length, icon: CheckCircle2, color: "text-success" },
  ];

  const projectsWithCommittees = new Set(members.map(m => m.project_id));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 shadow-card">
            <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-semibold">{s.label}</p>
              <p className="text-lg font-extrabold text-foreground">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card p-4">
        <h3 className="text-xs font-bold text-foreground mb-3">Projects with Committees ({projectsWithCommittees.size}/{projects.length})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {projects.map(p => {
            const has = projectsWithCommittees.has(p.id);
            const count = members.filter(m => m.project_id === p.id).length;
            return (
              <div key={p.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border ${has ? "border-success/20 bg-success/5" : "border-border bg-muted/20"}`}>
                <div className={`w-2 h-2 rounded-full ${has ? "bg-success" : "bg-muted-foreground/30"}`} />
                <span className="truncate font-medium text-foreground">{p.name}</span>
                {has && <span className="ml-auto text-[10px] text-muted-foreground">{count} members</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Members ─────────────────────────────────────── */
function MembersPanel({ members, projects, selectedProjectId, isAdmin, onMutate }: {
  members: CommitteeMember[]; projects: Project[]; selectedProjectId: string; isAdmin: boolean; onMutate: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ project_id: "", full_name: "", role: "Member", phone: "", email: "" });

  const handleAdd = async () => {
    if (!form.project_id || !form.full_name) { toast.error("Project and name are required"); return; }
    try {
      await createCommitteeMember({ ...form, photo_url: null, phone: form.phone || null, email: form.email || null });
      toast.success("Member added");
      setShowForm(false);
      setForm({ project_id: "", full_name: "", role: "Member", phone: "", email: "" });
      onMutate();
    } catch { toast.error("Failed to add member"); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteCommitteeMember(id); toast.success("Member removed"); onMutate(); }
    catch { toast.error("Failed to remove member"); }
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Committee Members</h3>
          <p className="text-[10px] text-muted-foreground">{members.length} members</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs font-bold shadow hover:opacity-90 active:scale-[0.98] transition-all">
            <PlusCircle className="w-3.5 h-3.5" /> Add Member
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <div className="p-4 border-b border-border bg-muted/20 flex flex-wrap gap-2 items-end">
          <select value={form.project_id} onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))} className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs">
            <option value="">Select Project</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input placeholder="Full Name" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs w-40" />
          <input placeholder="Role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs w-28" />
          <input placeholder="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs w-32" />
          <input placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs w-40" />
          <button onClick={handleAdd} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold">Save</button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/50">
            <tr>
              {["#", "Name", "Role", "Phone", "Email", "Project", ...(isAdmin ? [""] : [])].map(h => (
                <th key={h} className="px-3 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => (
              <tr key={m.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                <td className="px-3 py-2 font-medium flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                    {m.full_name.charAt(0)}
                  </div>
                  {m.full_name}
                </td>
                <td className="px-3 py-2"><span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">{m.role}</span></td>
                <td className="px-3 py-2">{m.phone ? <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-muted-foreground" />{m.phone}</span> : "—"}</td>
                <td className="px-3 py-2">{m.email ? <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-muted-foreground" />{m.email}</span> : "—"}</td>
                <td className="px-3 py-2 max-w-[180px] truncate">{projects.find(p => p.id === m.project_id)?.name || "—"}</td>
                {isAdmin && (
                  <td className="px-3 py-2">
                    <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                )}
              </tr>
            ))}
            {members.length === 0 && (
              <tr><td colSpan={isAdmin ? 7 : 6} className="text-center py-10 text-xs text-muted-foreground">No committee members found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Meetings ────────────────────────────────────── */
function MeetingsPanel({ meetings, members, projects, selectedProjectId, isAdmin, onMutate }: {
  meetings: CommitteeMeeting[]; members: CommitteeMember[]; projects: Project[]; selectedProjectId: string; isAdmin: boolean; onMutate: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ project_id: "", meeting_date: new Date().toISOString().split("T")[0], agenda: "", decisions: "" });

  const handleAdd = async () => {
    if (!form.project_id || !form.agenda) { toast.error("Project and agenda are required"); return; }
    try {
      await createCommitteeMeeting({ ...form, attendees: [], decisions: form.decisions || null });
      toast.success("Meeting recorded");
      setShowForm(false);
      setForm({ project_id: "", meeting_date: new Date().toISOString().split("T")[0], agenda: "", decisions: "" });
      onMutate();
    } catch { toast.error("Failed to add meeting"); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteCommitteeMeeting(id); toast.success("Meeting removed"); onMutate(); }
    catch { toast.error("Failed to remove meeting"); }
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Meeting Records</h3>
          <p className="text-[10px] text-muted-foreground">{meetings.length} meetings logged</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs font-bold shadow hover:opacity-90 active:scale-[0.98] transition-all">
            <PlusCircle className="w-3.5 h-3.5" /> Log Meeting
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <div className="p-4 border-b border-border bg-muted/20 flex flex-wrap gap-2 items-end">
          <select value={form.project_id} onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))} className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs">
            <option value="">Select Project</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input type="date" value={form.meeting_date} onChange={e => setForm(f => ({ ...f, meeting_date: e.target.value }))} className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs" />
          <input placeholder="Agenda" value={form.agenda} onChange={e => setForm(f => ({ ...f, agenda: e.target.value }))} className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs flex-1 min-w-[200px]" />
          <input placeholder="Decisions (optional)" value={form.decisions} onChange={e => setForm(f => ({ ...f, decisions: e.target.value }))} className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs flex-1 min-w-[200px]" />
          <button onClick={handleAdd} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold">Save</button>
        </div>
      )}

      <div className="divide-y divide-border/50">
        {meetings.map(m => (
          <div key={m.id} className="p-4 hover:bg-muted/20 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarDays className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-bold text-foreground">{new Date(m.meeting_date).toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}</span>
                  <span className="text-[10px] text-muted-foreground">• {projects.find(p => p.id === m.project_id)?.name}</span>
                </div>
                <p className="text-xs text-foreground"><strong>Agenda:</strong> {m.agenda}</p>
                {m.decisions && <p className="text-xs text-muted-foreground mt-1"><strong>Decisions:</strong> {m.decisions}</p>}
              </div>
              {isAdmin && (
                <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
              )}
            </div>
          </div>
        ))}
        {meetings.length === 0 && (
          <div className="text-center py-10 text-xs text-muted-foreground">No meetings recorded.</div>
        )}
      </div>
    </div>
  );
}

/* ─── Tasks ───────────────────────────────────────── */
function TasksPanel({ tasks, members, projects, selectedProjectId, isAdmin, onMutate }: {
  tasks: CommitteeTask[]; members: CommitteeMember[]; projects: Project[]; selectedProjectId: string; isAdmin: boolean; onMutate: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ project_id: "", assigned_to: "", title: "", description: "", due_date: "" });

  const handleAdd = async () => {
    if (!form.project_id || !form.title) { toast.error("Project and title are required"); return; }
    try {
      await createCommitteeTask({
        project_id: form.project_id,
        assigned_to: form.assigned_to || null,
        title: form.title,
        description: form.description || null,
        status: "Pending",
        due_date: form.due_date || null,
      });
      toast.success("Task created");
      setShowForm(false);
      setForm({ project_id: "", assigned_to: "", title: "", description: "", due_date: "" });
      onMutate();
    } catch { toast.error("Failed to create task"); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try { await updateCommitteeTaskStatus(id, status); toast.success("Task updated"); onMutate(); }
    catch { toast.error("Failed to update task"); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteCommitteeTask(id); toast.success("Task removed"); onMutate(); }
    catch { toast.error("Failed to remove task"); }
  };

  const projectMembers = members.filter(m => !form.project_id || m.project_id === form.project_id);

  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Task Assignments</h3>
          <p className="text-[10px] text-muted-foreground">{tasks.length} tasks</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs font-bold shadow hover:opacity-90 active:scale-[0.98] transition-all">
            <PlusCircle className="w-3.5 h-3.5" /> Add Task
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <div className="p-4 border-b border-border bg-muted/20 flex flex-wrap gap-2 items-end">
          <select value={form.project_id} onChange={e => setForm(f => ({ ...f, project_id: e.target.value, assigned_to: "" }))} className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs">
            <option value="">Select Project</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))} className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs">
            <option value="">Assign to (optional)</option>
            {projectMembers.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
          </select>
          <input placeholder="Task title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs flex-1 min-w-[180px]" />
          <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs" />
          <button onClick={handleAdd} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold">Save</button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/50">
            <tr>
              {["#", "Task", "Project", "Assigned To", "Due Date", "Status", ...(isAdmin ? [""] : [])].map(h => (
                <th key={h} className="px-3 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map((t, i) => {
              const assignee = members.find(m => m.id === t.assigned_to);
              return (
                <tr key={t.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                  <td className="px-3 py-2 font-medium max-w-[220px] truncate">{t.title}</td>
                  <td className="px-3 py-2 max-w-[180px] truncate">{projects.find(p => p.id === t.project_id)?.name || "—"}</td>
                  <td className="px-3 py-2">{assignee?.full_name || "Unassigned"}</td>
                  <td className="px-3 py-2">{t.due_date ? new Date(t.due_date).toLocaleDateString("en-KE") : "—"}</td>
                  <td className="px-3 py-2">
                    {isAdmin ? (
                      <select
                        value={t.status}
                        onChange={e => handleStatusChange(t.id, e.target.value)}
                        className={`appearance-none px-2 py-0.5 rounded-full text-[10px] font-semibold border-0 cursor-pointer ${taskStatusClass[t.status] || "bg-muted/50 text-muted-foreground"}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${taskStatusClass[t.status] || ""}`}>
                        {taskStatusIcon[t.status]} {t.status}
                      </span>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="px-3 py-2">
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  )}
                </tr>
              );
            })}
            {tasks.length === 0 && (
              <tr><td colSpan={isAdmin ? 7 : 6} className="text-center py-10 text-xs text-muted-foreground">No tasks assigned.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CommitteeModule;

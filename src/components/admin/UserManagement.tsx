import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, UserX, UserCheck, Shield, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ManagedUser {
  id: string;
  full_name: string;
  email: string;
  department: string;
  status: string;
  role: string;
}

const ROLES = ["admin", "executive", "staff", "viewer"] as const;
const DEPARTMENTS = [
  "ICT", "Health", "Governor's Office", "Roads", "Education",
  "Finance", "Agriculture", "Water", "Lands", "Trade",
];

async function callManageUsers(action: string, payload: Record<string, any> = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const res = await supabase.functions.invoke("manage-users", {
    body: { action, ...payload },
  });

  if (res.error) throw new Error(res.error.message);
  if (res.data?.error) throw new Error(res.data.error);
  return res.data;
}

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<ManagedUser | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState<ManagedUser | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Add user form
  const [newUser, setNewUser] = useState({ full_name: "", email: "", password: "", department: DEPARTMENTS[0], role: "staff" as string });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await callManageUsers("list");
      setUsers(data.users || []);
    } catch (err: any) {
      toast({ title: "Error loading users", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = async () => {
    if (!newUser.full_name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      toast({ title: "Validation Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    if (newUser.password.length < 6) {
      toast({ title: "Validation Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    try {
      setSubmitting(true);
      await callManageUsers("create", newUser);
      toast({ title: "User created successfully" });
      setShowAddDialog(false);
      setNewUser({ full_name: "", email: "", password: "", department: DEPARTMENTS[0], role: "staff" });
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Failed to create user", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!showDeleteDialog) return;
    try {
      setSubmitting(true);
      await callManageUsers("delete", { user_id: showDeleteDialog.id });
      toast({ title: "User deleted successfully" });
      setShowDeleteDialog(null);
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Failed to delete user", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: ManagedUser) => {
    const newStatus = user.status === "Active" ? "Inactive" : "Active";
    try {
      await callManageUsers("toggle_status", { user_id: user.id, status: newStatus });
      toast({ title: `User ${newStatus === "Active" ? "activated" : "deactivated"}` });
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Failed to update status", description: err.message, variant: "destructive" });
    }
  };

  const handleUpdateRole = async () => {
    if (!showRoleDialog) return;
    try {
      setSubmitting(true);
      await callManageUsers("update_role", { user_id: showRoleDialog.id, role: showRoleDialog.role });
      toast({ title: "Role updated successfully" });
      setShowRoleDialog(null);
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Failed to update role", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground text-sm">Manage system users, roles, and access status.</p>
        </div>
        <Button className="gap-2 shrink-0" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4" /> Add New User
        </Button>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>System Users</CardTitle>
              <CardDescription>A list of all users including their name, role, and email.</CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>User Details</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                        No users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.full_name || "—"}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 min-w-max capitalize">
                            {user.role === "admin" && <Shield className="w-3.5 h-3.5 text-primary" />}
                            {user.role}
                          </div>
                        </TableCell>
                        <TableCell>{user.department || "—"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={user.status === "Active" ? "default" : "secondary"}
                            className={user.status === "Active" ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" : ""}
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline" size="icon" className="h-8 w-8"
                              title="Change Role"
                              onClick={() => setShowRoleDialog({ ...user })}
                            >
                              <Shield className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            {user.status === "Active" ? (
                              <Button
                                variant="outline" size="icon"
                                className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                title="Deactivate"
                                onClick={() => handleToggleStatus(user)}
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline" size="icon"
                                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                title="Activate"
                                onClick={() => handleToggleStatus(user)}
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline" size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Delete User"
                              onClick={() => setShowDeleteDialog(user)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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

      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new system user with role and department assignment.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" value={newUser.full_name} onChange={e => setNewUser(p => ({ ...p, full_name: e.target.value }))} placeholder="e.g. Jane Doe" maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} placeholder="jane@bungoma.go.ke" maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} placeholder="Min 6 characters" maxLength={128} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={newUser.department} onValueChange={v => setNewUser(p => ({ ...p, department: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={newUser.role} onValueChange={v => setNewUser(p => ({ ...p, role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map(r => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddUser} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete <strong>{showDeleteDialog?.full_name || showDeleteDialog?.email}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={!!showRoleDialog} onOpenChange={() => setShowRoleDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>Update role for {showRoleDialog?.full_name || showRoleDialog?.email}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={showRoleDialog?.role || "viewer"} onValueChange={v => setShowRoleDialog(prev => prev ? { ...prev, role: v } : null)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLES.map(r => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(null)}>Cancel</Button>
            <Button onClick={handleUpdateRole} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

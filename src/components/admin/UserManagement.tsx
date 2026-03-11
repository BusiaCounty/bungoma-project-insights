import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, UserX, UserCheck, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const mockUsers = [
  { id: 1, name: "Jane Doe", email: "jane.doe@bungoma.go.ke", role: "Admin", department: "ICT", status: "Active" },
  { id: 2, name: "John Smith", email: "john.smith@bungoma.go.ke", role: "Staff", department: "Health", status: "Active" },
  { id: 3, name: "Alice Mwangi", email: "alice.m@bungoma.go.ke", role: "Executive", department: "Governor's Office", status: "Inactive" },
  { id: 4, name: "Peter Ochieng", email: "peter.o@bungoma.go.ke", role: "Staff", department: "Roads", status: "Active" },
];

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground text-sm">Manage system users, roles, and access status.</p>
        </div>
        <Button className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Add New User
        </Button>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>System Users</CardTitle>
              <CardDescription>A list of all users in your account including their name, role, and email.</CardDescription>
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
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 min-w-max">
                          {user.role === "Admin" && <Shield className="w-3.5 h-3.5 text-primary" />}
                          {user.role}
                        </div>
                      </TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === "Active" ? "default" : "secondary"} className={user.status === "Active" ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" : ""}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8" title="Edit User">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          {user.status === "Active" ? (
                            <Button variant="outline" size="icon" className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50" title="Deactivate">
                              <UserX className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button variant="outline" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" title="Activate">
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

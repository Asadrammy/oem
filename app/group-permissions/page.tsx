"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, Search, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getGroups, AddGroups } from "@/lib/api";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

type Group = {
  id: number;
  name: string;
  permissions?: any[];
  users?: any[];
};

export default function RoleManagementPage() {
  const { toast } = useToast();

  const [items, setItems] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [roleName, setRoleName] = useState<string>("");

  // Dialog state
  const [addRoleOpen, setAddRoleOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [totalCount, setTotalCount] = useState(0);

  // Search
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const q = searchTerm.toLowerCase();
    return items.filter((group) => group.name?.toLowerCase().includes(q));
  }, [items, searchTerm]);

  // Fetch page
  const fetchPage = async (pageNum: number) => {
    setLoading(true);
    setError("");
    try {
      const resp = await getGroups(pageNum);
      const rows: Group[] = resp?.results ?? resp ?? [];
      setItems(rows);
      setTotalCount(resp.count ?? rows.length);
      setPage(pageNum);
    } catch (e: any) {
      setError(e?.message || "Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(1);
  }, []);

  // Handle save role

  const handleSaveRole = async () => {
    if (!roleName.trim()) {
      setError("Role name is required");
      toast({
        title: "Error",
        description: "Role name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: roleName.trim(),
      };

      const resp = await AddGroups(payload);

      // Add the new role to the list
      const newRole = resp.data || resp;
      setItems((prev) => [newRole, ...prev]);

      // Reset form and close dialog
      setRoleName("");
      setAddRoleOpen(false);

      // ✅ Success toast
      toast({
        title: "Success",
        description: "Role created successfully!",
      });

      // Optionally refresh the page to get updated data
      await fetchPage(1);
    } catch (e: any) {
      const msg =
        e?.response?.data?.name?.join(", ") ||
        e?.message ||
        "Failed to create role";
      setError(msg);

      // ❌ Error toast
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setAddRoleOpen(false);
    setRoleName("");
    setError("");
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveRole();
  };

  const totalPages = Math.ceil(totalCount / rowsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600">Manage user roles and permissions</p>
        </div>

        <Dialog open={addRoleOpen} onOpenChange={setAddRoleOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Role</DialogTitle>
              <DialogDescription>
                Create a new role for your organization. You can assign
                permissions and users later.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roleName">Role Name</Label>
                <Input
                  id="roleName"
                  placeholder="Enter role name (e.g., Admin, Editor, Viewer)"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  disabled={saving}
                  className="w-full"
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}
            </form>

            <DialogFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleDialogClose}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveRole}
                disabled={saving || !roleName.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? "Creating..." : "Create Role"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by role name..."
              className="pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button
            onClick={() => setSearchTerm(query)}
            className="bg-gray-700 hover:bg-gray-800"
          >
            Search
          </Button>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && !addRoleOpen && (
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Roles ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Users</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={3}>Loading…</TableCell>
                  </TableRow>
                )}
                {!loading && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3}>No roles found</TableCell>
                  </TableRow>
                )}
                {filtered
                  .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                  .map((group) => (
                    <TableRow key={group.id}>
                      <TableCell>
                        <Link
                          className="text-blue-600 hover:underline font-medium"
                          href={`/group-permissions/${group.id}`}
                        >
                          {group.name}
                        </Link>
                      </TableCell>
                      <TableCell>{group.permissions?.length || 0}</TableCell>
                      <TableCell>{group.users?.length || 0} users</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => fetchPage(page - 1)}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <Button
                      key={p}
                      variant={p === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => fetchPage(p)}
                    >
                      {p}
                    </Button>
                  )
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => fetchPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

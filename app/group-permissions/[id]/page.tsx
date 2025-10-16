"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  RefreshCw,
  Edit,
  Trash2,
  FileText,
  Plus,
  MoreVertical,
  UserPlus,
  Search,
  Filter,
  X,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
// Import your API functions
import {
  getGroupsById,
  getGroupPermissions,
  getGroupUsers,
  deleteGroupsById,
  updateGroupsById,
  assignPermissionsToGroup,
  removeUsersFromGroup,
} from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Permission = {
  id: number;
  name: string;
  codename: string;
  content_type_app: string;
  content_type_model: string;
  content_type_name: string;
};

type User = {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  full_name?: string;
  email: string;
  is_active: boolean;
};

type RoleData = {
  id: number;
  name: string;
  permissions: any[];
  users?: any[];
  status?: string;
  description?: string;
};

export default function RoleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params?.id;
  const { toast } = useToast();

  const [roleData, setRoleData] = useState<RoleData | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [currentPage1, setCurrentPage1] = useState(1);
  
  // Permission filters
  const [permissionSearch, setPermissionSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("name");
  
  // User search
  const [userSearch, setUserSearch] = useState("");
  // NEW: delete confirm state

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // NEW: delete confirm state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const rowsPerPage1 = 10;
  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = permissions.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(permissions.length / rowsPerPage);
  //
  const indexOfLastRow1 = currentPage1 * rowsPerPage1;
  const indexOfFirstRow1 = indexOfLastRow1 - rowsPerPage1;
  const currentRows1 = users.slice(indexOfFirstRow1, indexOfLastRow1);
  const totalPages1 = Math.ceil(users.length / rowsPerPage1);
  // Fetch role data using the API
  useEffect(() => {
    const fetchRoleData = async () => {
      if (!roleId) return;

      try {
        setLoading(true);
        setError(null);
        const response = await getGroupsById(Number(roleId));

        // Transform the API response to match your RoleData type
        const transformedData: RoleData = {
          id: response.id,
          name: response.name,
          permissions: response.permissions || [],
          users: response.user_set || response.users || [],
          status: "Active",
          description: response.description || "",
        };

        setRoleData(transformedData);

        // Also fetch permissions and users immediately
        await Promise.all([
          fetchPermissions(),
          fetchUsers()
        ]);
      } catch (error: any) {
        console.error("Error fetching role data:", error);
        if (error?.response?.status === 404) {
          router.push('/not-found');
          return;
        }
        setError("Failed to load role details");
      } finally {
        setLoading(false);
      }
    };

    fetchRoleData();
  }, [roleId, router]);

  // Fetch permissions for the permissions tab
  const fetchPermissions = async () => {
    if (!roleId) return;

    try {
      setPermissionsLoading(true);
      const response = await getGroupPermissions(Number(roleId));
      setPermissions(response.results || response || []);
    } catch (error) {
      console.error("Error fetching permissions:", error);
    } finally {
      setPermissionsLoading(false);
    }
  };

  // Fetch users for the users tab
  const fetchUsers = async () => {
    if (!roleId) return;

    try {
      setUsersLoading(true);
      const response = await getGroupUsers(Number(roleId));
      setUsers(response || response || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch data when tabs are accessed
  const handleTabChange = (value: string) => {
    if (value === "permissions" && permissions.length === 0) {
      fetchPermissions();
    }
    if (value === "users" && users.length === 0) {
      fetchUsers();
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [permissionSearch, selectedApp, selectedModel]);

  // Reset user page when search changes
  useEffect(() => {
    setCurrentPage1(1);
  }, [userSearch]);

  const handleRefresh = async () => {
    if (!roleId) return;

    try {
      setLoading(true);
      const response = await getGroupsById(Number(roleId));

      const transformedData: RoleData = {
        id: response.id,
        name: response.name,
        permissions: response.permissions || [],
        users: response.user_set || response.users || [],
        status: "Active",
        description: response.description || "",
      };

      setRoleData(transformedData);

      // Also refresh permissions and users if they were loaded
      if (permissions.length > 0) {
        await fetchPermissions();
      }
      if (users.length > 0) {
        await fetchUsers();
      }
    } catch (error) {
      console.error("Error refreshing role data:", error);
      setError("Failed to refresh role details");
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async () => {
    if (!roleId) return;

    try {
      setDeleteSubmitting(true);
      await deleteGroupsById(Number(roleId));

      toast({
        title: "Deleted",
        description: "Role deleted successfully!",
        variant: "default",
      });

      setIsDeleteOpen(false);
    } catch (error) {
      console.error("Delete failed:", error);
      toast({
        title: "Error",
        description: "Failed to delete role.",
        variant: "destructive",
      });
    } finally {
      setDeleteSubmitting(false);
    }
  };
  const handleEdit = () => {
    if (!roleData) return;
    setEditName(roleData.name || "");
    setIsEditOpen(true);
  };
const handleUpdateSubmit = async () => {
  if (!roleId) return;
  try {
    setEditSubmitting(true);
    const payload: Partial<RoleData> = {
      name: editName?.trim(),
    };

    // payload पाठवणे आवश्यक आहे
    const updated = await updateGroupsById(Number(roleId), payload);

    // merge into local state
    setRoleData((prev) =>
      prev
        ? {
            ...prev,
            name: updated?.name ?? payload.name ?? prev.name,
          }
        : prev
    );

    setIsEditOpen(false);

    // ✅ success toast
    toast({
      title: "Updated",
      description: "Role updated successfully!",
    });
  } catch (e: any) {
    console.error("Update failed", e);

    if (e?.response?.data?.name) {
      toast({
        title: "Error",
        description: e.response.data.name.join(", "),
        variant: "destructive",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update role.",
        variant: "destructive",
      });
    }
  } finally {
    setEditSubmitting(false);
  }
};

  const handleBackToRoles = () => {
    router.push("/group-permissions");
  };

  const handleAssignPermissions = () => {
    router.push(`/group-permissions/addPermissions/${roleId}`);
  };

  const handleAddUser = () => {
    router.push(`/group-permissions/addUsers/${roleId}`);
  };

  // Remove user from group
  const handleRemoveUser = async (userId: number) => {
    if (!users) return;
    
    const confirmRemove = window.confirm("Are you sure you want to remove this user from the role?");
    if (!confirmRemove) return;
    
    try {
      await removeUsersFromGroup(Number(roleId), [userId]);
      
      toast({
        title: "Success",
        description: "User removed successfully",
      });
      
      // Refresh users
      await fetchUsers();
    } catch (error) {
      console.error("Error removing user:", error);
      toast({
        title: "Error",
        description: "Failed to remove user",
        variant: "destructive",
      });
    }
  };

  // Remove permission from group
  const handleRemovePermission = async (permissionId: number) => {
    if (!permissions) return;
    
    const confirmRemove = window.confirm("Are you sure you want to remove this permission from the role?");
    if (!confirmRemove) return;
    
    try {
      const remainingPermissions = permissions
        .filter(p => p.id !== permissionId)
        .map(p => p.id);
      
      await assignPermissionsToGroup(Number(roleId), remainingPermissions);
      
      toast({
        title: "Success",
        description: "Permission removed successfully",
      });
      
      // Refresh permissions
      await fetchPermissions();
    } catch (error) {
      console.error("Error removing permission:", error);
      toast({
        title: "Error",
        description: "Failed to remove permission",
        variant: "destructive",
      });
    }
  };

  const handleUserAction = (action: string, userId: number) => {
    console.log(`${action} user ${userId}`);
    // Implement your action logic here
    switch (action) {
      case "edit":
        router.push(`/user/edit/${userId}`);
        break;

      case "view":
        router.push(`/user/${userId}`);
        break;
      default:
        break;
    }
  };

  const getUserDisplayName = (user: User) => {
    if (user.name) return user.name;
    if (user.full_name) return user.full_name;
    if (user.first_name || user.last_name) {
      return `${user.first_name || ""} ${user.last_name || ""}`.trim();
    }
    return "";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-sm text-gray-500">Loading role details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="text-sm text-red-600">{error}</div>
        <Button onClick={handleRefresh} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (!roleData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-sm text-gray-500">Role not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleBackToRoles}
              className="flex items-center text-gray-600 hover:text-gray-800 text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Roles
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="px-6 py-6">
        {/* Title and actions */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            {roleData.name}
          </h1>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="gap-2"
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              onClick={handleEdit}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Edit className="h-4 w-4" />
              Edit Role
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit role</DialogTitle>
              <DialogDescription>
                Update the role details, then click Save to apply changes.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="role-name">Name</Label>
                <Input
                  id="role-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Role name"
                />
              </div>

             
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateSubmit}
                disabled={editSubmitting || !editName.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="text-sm text-gray-500 mb-1">Users</div>
              <div className="text-3xl font-semibold text-gray-900">
                {users.length || roleData.users?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="text-sm text-gray-500 mb-1">Permissions</div>
              <div className="text-3xl font-semibold text-gray-900">
                {permissions.length || roleData.permissions.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="text-sm text-gray-500 mb-1">Role ID</div>
              <div className="text-3xl font-semibold text-gray-900">
                {roleData.id}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200">
          <Tabs
            defaultValue="overview"
            className="w-full"
            onValueChange={handleTabChange}
          >
            <TabsList className="grid w-full grid-cols-3 bg-transparent border-b border-gray-200 rounded-none h-auto p-0">
              <TabsTrigger
                value="overview"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 py-3"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="permissions"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 py-3"
              >
                Permissions
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 py-3"
              >
                Users
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-0 p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Role Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-gray-500">Name</label>
                    <div className="mt-1 text-gray-900 font-medium">
                      {roleData.name}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500">ID</label>
                    <div className="mt-1 text-gray-900 font-medium">
                      {roleData.id}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500">Status</label>
                    <div className="mt-1">
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 hover:bg-blue-100"
                      >
                        {roleData.status || "Active"}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500">Permissions</label>
                    <div className="mt-1 text-gray-900 font-medium">
                      {permissions.length || roleData.permissions.length}
                    </div>
                  </div>
                </div>

                {roleData.description && (
                  <div>
                    <label className="text-sm text-gray-500">Description</label>
                    <div className="mt-1 text-gray-900">
                      {roleData.description}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="mt-0 p-0">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Permissions
                  </h3>
                  <Button
                    onClick={handleAssignPermissions}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Assign Permission
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative flex-1 min-w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search permissions..."
                      className="pl-10"
                      value={permissionSearch}
                      onChange={(e) => setPermissionSearch(e.target.value)}
                    />
                  </div>
                  <Select value={selectedApp} onValueChange={setSelectedApp}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Apps" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Apps</SelectItem>
                      {Array.from(new Set(permissions.map(p => p.content_type_app))).map(app => (
                        <SelectItem key={app} value={app}>{app}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Models" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Models</SelectItem>
                      {selectedApp && Array.from(new Set(
                        permissions
                          .filter(p => p.content_type_app === selectedApp)
                          .map(p => p.content_type_model)
                      )).map(model => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="codename">Codename</SelectItem>
                      <SelectItem value="content_type_name">Content Type</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="overflow-hidden">
                {permissionsLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="text-sm text-gray-500">
                      Loading permissions...
                    </div>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Permission Name</TableHead>
                          <TableHead>Codename</TableHead>
                          <TableHead>App / Model</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(() => {
                          // Apply filters and sorting
                          let filteredPermissions = permissions.filter(permission => {
                            const matchesSearch = !permissionSearch || 
                              permission.name.toLowerCase().includes(permissionSearch.toLowerCase()) ||
                              permission.codename.toLowerCase().includes(permissionSearch.toLowerCase());
                            const matchesApp = !selectedApp || selectedApp === "all" || permission.content_type_app === selectedApp;
                            const matchesModel = !selectedModel || selectedModel === "all" || permission.content_type_model === selectedModel;
                            return matchesSearch && matchesApp && matchesModel;
                          });

                          // Apply sorting
                          filteredPermissions.sort((a, b) => {
                            switch (sortBy) {
                              case "name":
                                return a.name.localeCompare(b.name);
                              case "codename":
                                return a.codename.localeCompare(b.codename);
                              case "content_type_name":
                                return a.content_type_name.localeCompare(b.content_type_name);
                              default:
                                return 0;
                            }
                          });

                          // Apply pagination
                          const startIndex = (currentPage - 1) * rowsPerPage;
                          const endIndex = startIndex + rowsPerPage;
                          const paginatedPermissions = filteredPermissions.slice(startIndex, endIndex);

                          return paginatedPermissions.length === 0 ? (
                          <TableRow>
                            <TableCell
                                colSpan={4}
                              className="text-center py-8 text-gray-500"
                            >
                                No permissions match the current filters
                            </TableCell>
                          </TableRow>
                        ) : (
                            paginatedPermissions.map((permission) => (
                            <TableRow key={permission.id}>
                              <TableCell className="font-medium">
                                {permission.name}
                              </TableCell>
                              <TableCell className="text-gray-700">
                                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                                  {permission.codename}
                                  </code>
                              </TableCell>
                              <TableCell className="text-gray-700">
                                  {permission.content_type_app} / {permission.content_type_model}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemovePermission(permission.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                              </TableCell>
                            </TableRow>
                          ))
                          );
                        })()}
                      </TableBody>
                    </Table>

                    {/* Pagination controls */}
                    {(() => {
                      // Calculate total pages based on filtered permissions
                      const filteredPermissions = permissions.filter(permission => {
                        const matchesSearch = !permissionSearch || 
                          permission.name.toLowerCase().includes(permissionSearch.toLowerCase()) ||
                          permission.codename.toLowerCase().includes(permissionSearch.toLowerCase());
                        const matchesApp = !selectedApp || selectedApp === "all" || permission.content_type_app === selectedApp;
                        const matchesModel = !selectedModel || selectedModel === "all" || permission.content_type_model === selectedModel;
                        return matchesSearch && matchesApp && matchesModel;
                      });
                      const filteredTotalPages = Math.ceil(filteredPermissions.length / rowsPerPage);
                      
                      return filteredTotalPages > 1 && (
                      <div className="flex justify-between items-center mt-6">
                        {/* Page info */}
                        <span className="text-sm text-gray-600">
                            Page {currentPage} of {filteredTotalPages}
                        </span>

                        {/* Pagination buttons */}
                        <div className="flex gap-2">
                          {/* Previous button */}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => p - 1)}
                          >
                            Previous
                          </Button>

                          {/* Numbered buttons with ellipsis */}
                            {Array.from({ length: filteredTotalPages }, (_, i) => i + 1)
                            .filter((p) => {
                              return (
                                p === 1 ||
                                p === 2 ||
                                  p === filteredTotalPages ||
                                (p >= currentPage - 1 && p <= currentPage + 1)
                              );
                            })
                            .map((p, i, arr) => {
                              const prev = arr[i - 1];
                              return (
                                <React.Fragment key={p}>
                                  {prev && p - prev > 1 && (
                                    <span className="px-2 text-gray-500">
                                      …
                                    </span>
                                  )}
                                  <Button
                                    variant={
                                      p === currentPage ? "default" : "outline"
                                    }
                                    size="sm"
                                    onClick={() => setCurrentPage(p)}
                                  >
                                    {p}
                                  </Button>
                                </React.Fragment>
                              );
                            })}

                          {/* Next button */}
                          <Button
                            variant="outline"
                            size="sm"
                              disabled={currentPage === filteredTotalPages}
                            onClick={() => setCurrentPage((p) => p + 1)}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                      );
                    })()}
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="users" className="mt-0 p-0">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Users With This Role
                  </h3>
                  <Button
                    onClick={handleAddUser}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <UserPlus className="h-4 w-4" />
                    Add User
                  </Button>
                </div>
              </div>

              {/* User Search */}
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 min-w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      className="pl-10"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      // Apply search filter
                      const filteredUsers = users.filter(user => {
                        const matchesSearch = !userSearch || 
                          user.username.toLowerCase().includes(userSearch.toLowerCase()) ||
                          user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                          getUserDisplayName(user).toLowerCase().includes(userSearch.toLowerCase());
                        return matchesSearch;
                      });

                      // Apply pagination
                      const startIndex = (currentPage1 - 1) * rowsPerPage1;
                      const endIndex = startIndex + rowsPerPage1;
                      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

                      return paginatedUsers.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-8 text-gray-500"
                        >
                            {userSearch ? "No users match the search criteria" : "No users assigned to this role"}
                        </TableCell>
                      </TableRow>
                    ) : (
                        paginatedUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.username}
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {getUserDisplayName(user)}
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {user.email}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={user.is_active ? "default" : "secondary"}
                            >
                              {user.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                              <div className="flex items-center gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUserAction("view", user.id)
                                  }
                                >
                                  View User
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUserAction("edit", user.id)
                                  }
                                >
                                  Edit User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveUser(user.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                          </TableCell>
                        </TableRow>
                      ))
                      );
                    })()}
                  </TableBody>
                </Table>

                {/* Pagination controls */}
                {(() => {
                  // Calculate total pages based on filtered users
                  const filteredUsers = users.filter(user => {
                    const matchesSearch = !userSearch || 
                      user.username.toLowerCase().includes(userSearch.toLowerCase()) ||
                      user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                      getUserDisplayName(user).toLowerCase().includes(userSearch.toLowerCase());
                    return matchesSearch;
                  });
                  const filteredTotalPages = Math.ceil(filteredUsers.length / rowsPerPage1);
                  
                  return filteredTotalPages > 1 && (
                  <div className="flex justify-between items-center mt-6">
                    <span className="text-sm text-gray-600">
                        Page {currentPage1} of {filteredTotalPages}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage1 === 1}
                          onClick={() => setCurrentPage1((p) => p - 1)}
                      >
                        Previous
                      </Button>

                        {Array.from({ length: filteredTotalPages }, (_, i) => i + 1)
                        .filter((p) => {
                          return (
                            p === 1 ||
                            p === 2 ||
                              p === filteredTotalPages ||
                            (p >= currentPage1 - 1 && p <= currentPage1 + 1)
                          );
                        })
                        .map((p, i, arr) => {
                          const prev = arr[i - 1];
                          return (
                            <React.Fragment key={p}>
                              {prev && p - prev > 1 && (
                                <span className="px-2 text-gray-500">…</span>
                              )}
                              <Button
                                variant={
                                  p === currentPage1 ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => setCurrentPage1(p)}
                              >
                                {p}
                              </Button>
                            </React.Fragment>
                          );
                        })}

                      <Button
                        variant="outline"
                        size="sm"
                          disabled={currentPage1 === filteredTotalPages}
                        onClick={() => setCurrentPage1((p) => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                  );
                })()}
              </>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

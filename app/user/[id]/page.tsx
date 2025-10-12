"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getUser, deleteUser, getUserPermissions, updateUserPermissions, getPermissions } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Settings,
  Activity,
  Calendar,
  Building,
  Bell,
  Edit,
  Trash2,
  RefreshCw,
  UserCheck,
  Crown,
  Palette,
  Hash,
  Clock,
  Database,
  FileText,
  Loader2,
  Search,
  Filter,
  X,
  Eye,
  ShieldCheck,
  Users,
  Plus,
} from "lucide-react";

interface Profile {
  id: number;
  user: number;
  phone_number: string;
  city: string;
  state: string;
  pin: string;
  address: string;
  is_phone_verified: boolean;
  is_email_verified: boolean;
  role: string;
  preferred_theme: string;
  fleet_operator: number | null;
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: Profile;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  date_joined: string;
  last_login: string;
}

interface Permission {
  id: number;
  name: string;
  codename: string;
  content_type_app: string;
  content_type_model: string;
  content_type_name: string;
}

interface UserPermissions {
  direct_permissions: Permission[];
  group_permissions: Permission[];
  all_permissions: Permission[];
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params?.id);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false); // Add deleting state

  // Permissions state
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  
  // Permissions filters
  const [permissionSearch, setPermissionSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  
  // Add Permission drawer state
  const [addPermissionOpen, setAddPermissionOpen] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<number>>(new Set());
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogTotalPages, setCatalogTotalPages] = useState(1);
  
  // Catalog filters
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogApp, setCatalogApp] = useState<string>("");
  const [catalogModel, setCatalogModel] = useState<string>("");
  
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      getUser(userId)
        .then((data) => setUser(data))
        .finally(() => setLoading(false));
    }
  }, [userId]);

  // Load permissions when permissions tab is accessed
  const handleTabChange = (value: string) => {
    if (value === "permissions" && !userPermissions) {
      fetchUserPermissions();
    }
  };

  // Initialize catalog when add permission dialog opens
  useEffect(() => {
    if (addPermissionOpen && availablePermissions.length === 0) {
      fetchAvailablePermissions();
    }
  }, [addPermissionOpen]);

  // Pre-select current direct permissions when catalog loads
  useEffect(() => {
    if (userPermissions?.direct_permissions && availablePermissions.length > 0) {
      const currentDirectIds = new Set(userPermissions.direct_permissions.map(p => p.id));
      setSelectedPermissionIds(currentDirectIds);
    }
  }, [userPermissions, availablePermissions]);

  // Add refresh function
  const handleRefresh = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getUser(userId);
      setUser(data);
    } catch (error) {
      console.error("Error refreshing user data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user permissions
  const fetchUserPermissions = async () => {
    if (!userId) return;
    
    setPermissionsLoading(true);
    setPermissionsError(null);
    try {
      console.log("Fetching permissions for user:", userId);
      const data = await getUserPermissions(userId);
      console.log("Permissions data received:", data);
      setUserPermissions(data);
    } catch (error) {
      console.error("Error fetching user permissions:", error);
      setPermissionsError("Failed to load permissions");
      
      // Set empty permissions structure to prevent crashes
      setUserPermissions({
        direct_permissions: [],
        group_permissions: [],
        all_permissions: []
      });
      
      toast({
        title: "Error",
        description: "Failed to load user permissions",
        variant: "destructive",
      });
    } finally {
      setPermissionsLoading(false);
    }
  };

  // Remove permission from user
  const handleRemovePermission = async (permissionId: number) => {
    if (!userPermissions?.direct_permissions) return;
    
    const confirmRemove = window.confirm("Are you sure you want to remove this permission?");
    if (!confirmRemove) return;
    
    try {
      const remainingPermissions = userPermissions.direct_permissions
        .filter(p => p.id !== permissionId)
        .map(p => p.id);
      
      await updateUserPermissions(userId, remainingPermissions);
      
      toast({
        title: "Success",
        description: "Permission removed successfully",
      });
      
      // Refresh permissions
      await fetchUserPermissions();
    } catch (error) {
      console.error("Error removing permission:", error);
      toast({
        title: "Error",
        description: "Failed to remove permission",
        variant: "destructive",
      });
    }
  };

  // Fetch available permissions for catalog
  const fetchAvailablePermissions = async () => {
    setCatalogLoading(true);
    try {
      const data = await getPermissions({
        page: catalogPage,
        page_size: 20,
        search: catalogSearch || undefined,
        app_label: catalogApp || undefined,
        model: catalogModel || undefined,
      });
      
      setAvailablePermissions(data?.results || data || []);
      setCatalogTotalPages(Math.ceil((data?.count || 0) / 20));
    } catch (error) {
      console.error("Error fetching permissions catalog:", error);
      setAvailablePermissions([]);
      setCatalogTotalPages(1);
      toast({
        title: "Error",
        description: "Failed to load permissions catalog",
        variant: "destructive",
      });
    } finally {
      setCatalogLoading(false);
    }
  };

  // Handle catalog search/filter changes
  const handleCatalogFilterChange = () => {
    setCatalogPage(1);
    fetchAvailablePermissions();
  };

  // Handle adding permissions
  const handleAddPermissions = async () => {
    if (!userPermissions?.direct_permissions) return;
    
    try {
      const currentDirectIds = userPermissions.direct_permissions.map(p => p.id);
      const newPermissionIds = Array.from(selectedPermissionIds);
      const allPermissionIds = [...currentDirectIds, ...newPermissionIds];
      
      await updateUserPermissions(userId, allPermissionIds);
      
      toast({
        title: "Success",
        description: "Permissions added successfully",
      });
      
      setAddPermissionOpen(false);
      setSelectedPermissionIds(new Set());
      await fetchUserPermissions();
    } catch (error) {
      console.error("Error adding permissions:", error);
      toast({
        title: "Error",
        description: "Failed to add permissions",
        variant: "destructive",
      });
    }
  };

  // Add delete function
  const handleDelete = async () => {
    if (!user) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete user "${user.first_name} ${user.last_name}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    setDeleting(true);
    try {
      await deleteUser(user.id);
      // Show success message (you can use a toast library here)
      alert("User deleted successfully!");
      // Navigate back to users list
      router.push("/user");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
        <span className="ml-2 text-gray-500">Loading user...</span>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center text-red-500">User not found.</div>;
  }

  return (
    <div className="mx-auto px-4 py-4 max-w-7xl space-y-6">
      {/* Header */}
      <div className="space-y-4">
        {/* First Row - Back Button Only */}
        <div className="flex items-center">
          <Link href="/user">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Users</span>
            </Button>
          </Link>
        </div>

        {/* Second Row - User Name and Action Buttons */}
        <div className="flex items-center justify-between">
          {/* Left side - User Name and Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">
                {user.first_name} {user.last_name} (@{user.username})
              </h1>
            </div>
          </div>

          {/* Right side - Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 border border-gray-200"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>

            <Button
              onClick={() => router.push(`/user/edit/${user.id}`)}
              className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 px-4 py-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit User</span>
            </Button>

            <Button
              onClick={handleDelete}
              disabled={deleting}
              variant="ghost"
              className="flex items-center bg-white gap-2 text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span>{deleting ? "Deleting..." : "Delete"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Rest of your existing code remains the same... */}
      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4 flex items-center gap-3">
            <UserCheck className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold">
                {user.is_active ? "Active" : "Inactive"}
              </p>
              <p className="text-xs text-gray-600">Account Status</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4 flex items-center gap-3">
            <Mail className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold">
                {user.profile?.is_email_verified ? "Verified" : "Unverified"}
              </p>
              <p className="text-xs text-gray-600">Email Status</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4 flex items-center gap-3">
            <Phone className="w-6 h-6 text-orange-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold">
                {user.profile?.is_phone_verified ? "Verified" : "Unverified"}
              </p>
              <p className="text-xs text-gray-600">Phone Status</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4 flex items-center gap-3">
            <Shield className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold truncate" title={user.profile?.role}>
                {user.profile?.role ?? "User"}
              </p>
              <p className="text-xs text-gray-600">Role</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-4" onValueChange={handleTabChange}>
        <TabsList className="w-full justify-start border-b">
          <TabsTrigger value="info" className="flex items-center gap-2">
            <User className="w-4 h-4 text-black" />
            User Info
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-black" />
            Profile Details
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-black" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-black" />
            Activity
          </TabsTrigger>
        </TabsList>

        {/* User Info Tab */}
        <TabsContent value="info">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Basic User Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-black" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="font-semibold">{user.first_name} {user.last_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Hash className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Username</p>
                    <p className="font-semibold">@{user.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-semibold">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Date Joined</p>
                    <p className="font-semibold">
                      {new Date(user.date_joined).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="w-5 h-5 text-black" />
                  Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Phone Number</p>
                    <p className="font-semibold">
                      {user.profile?.phone_number || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">City</p>
                    <p className="font-semibold">{user.profile?.city || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">State</p>
                    <p className="font-semibold">{user.profile?.state || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Hash className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">PIN Code</p>
                    <p className="font-semibold">{user.profile?.pin || "Not provided"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status & Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-black" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Account Status</p>
                    <Badge variant={user.is_active ? "default" : "secondary"}>
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Email Verification</p>
                    <Badge
                      variant={user.profile?.is_email_verified ? "default" : "secondary"}
                    >
                      {user.profile?.is_email_verified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Phone Verification</p>
                    <Badge
                      variant={user.profile?.is_phone_verified ? "default" : "secondary"}
                    >
                      {user.profile?.is_phone_verified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Last Login</p>
                    <p className="text-sm">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleString()
                        : "Never"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Profile Details Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-black" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Full Address</p>
                    <p className="font-semibold">
                      {user.profile?.address || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="font-semibold">{user.profile?.role || "User"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Palette className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Preferred Theme</p>
                    <p className="font-semibold">
                      {user.profile?.preferred_theme || "Default"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Fleet Operator</p>
                    <p className="font-semibold">
                      {user.profile?.fleet_operator || "Not assigned"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions">
          <div className="space-y-6">
            {/* Permissions Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold">User Permissions</h3>
                {userPermissions && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Direct: {userPermissions.direct_permissions.length}</span>
                    <span>•</span>
                    <span>Group: {userPermissions.group_permissions.length}</span>
                    <span>•</span>
                    <span>Total: {userPermissions.all_permissions.length}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setAddPermissionOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Permission
                </Button>
                <Button
                  variant="outline"
                  onClick={fetchUserPermissions}
                  disabled={permissionsLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${permissionsLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                    </div>
                  </div>

            {/* Filters */}
          <Card>
              <CardContent className="p-4">
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
                      <SelectItem value="">All Apps</SelectItem>
                      {userPermissions?.all_permissions && Array.from(new Set(userPermissions.all_permissions.map(p => p.content_type_app))).map(app => (
                        <SelectItem key={app} value={app}>{app}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Models" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Models</SelectItem>
                      {userPermissions?.all_permissions && selectedApp && Array.from(new Set(
                        userPermissions.all_permissions
                          .filter(p => p.content_type_app === selectedApp)
                          .map(p => p.content_type_model)
                      )).map(model => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Permissions Table */}
            <Card>
              <CardContent className="p-0">
                {permissionsLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                    <span className="ml-2 text-gray-500">Loading permissions...</span>
                  </div>
                ) : permissionsError ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="text-center">
                      <p className="text-red-600 mb-2">{permissionsError}</p>
                      <Button variant="outline" onClick={fetchUserPermissions}>
                        Try Again
                      </Button>
                    </div>
                  </div>
                ) : userPermissions ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Permission</TableHead>
                        <TableHead>Codename</TableHead>
                        <TableHead>App / Model</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userPermissions?.all_permissions
                        ?.filter(permission => {
                          const matchesSearch = !permissionSearch || 
                            permission.name.toLowerCase().includes(permissionSearch.toLowerCase()) ||
                            permission.codename.toLowerCase().includes(permissionSearch.toLowerCase());
                          const matchesApp = !selectedApp || permission.content_type_app === selectedApp;
                          const matchesModel = !selectedModel || permission.content_type_model === selectedModel;
                          return matchesSearch && matchesApp && matchesModel;
                        })
                        ?.map((permission) => {
                          const isDirect = userPermissions?.direct_permissions?.some(p => p.id === permission.id) || false;
                          return (
                            <TableRow key={permission.id}>
                              <TableCell className="font-medium">{permission.name}</TableCell>
                              <TableCell>
                                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                                  {permission.codename}
                                </code>
                              </TableCell>
                              <TableCell>
                                {permission.content_type_app} / {permission.content_type_model}
                              </TableCell>
                              <TableCell>
                                <Badge variant={isDirect ? "default" : "secondary"}>
                                  {isDirect ? "Direct" : "Group"}
                  </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {isDirect ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemovePermission(permission.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        }) || []}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex justify-center items-center py-8">
                    <p className="text-gray-500">No permissions loaded</p>
                </div>
                )}
            </CardContent>
          </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-black" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Account Created</p>
                        <p className="text-sm text-gray-600">
                          User account was created
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(user.date_joined).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {user.last_login && (
                  <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Activity className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">Last Login</p>
                          <p className="text-sm text-gray-600">
                            Most recent login activity
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(user.last_login).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Permission Dialog */}
      <Dialog open={addPermissionOpen} onOpenChange={setAddPermissionOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Permissions — {user?.first_name} {user?.last_name} (@{user?.username})</DialogTitle>
            <DialogDescription>
              Select permissions to assign to this user. Current direct permissions are pre-selected.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search permissions..."
                  className="pl-10"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                />
              </div>
              <Select value={catalogApp} onValueChange={setCatalogApp}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Apps" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Apps</SelectItem>
                  {availablePermissions && Array.from(new Set(availablePermissions.map(p => p.content_type_app))).map(app => (
                    <SelectItem key={app} value={app}>{app}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={catalogModel} onValueChange={setCatalogModel}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Models" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Models</SelectItem>
                  {catalogApp && availablePermissions && Array.from(new Set(
                    availablePermissions
                      .filter(p => p.content_type_app === catalogApp)
                      .map(p => p.content_type_model)
                  )).map(model => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleCatalogFilterChange} variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
            </div>

            {/* Selection Counter */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Selected: {selectedPermissionIds.size} permissions
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentPageIds = availablePermissions.map(p => p.id);
                    const allSelected = currentPageIds.every(id => selectedPermissionIds.has(id));
                    if (allSelected) {
                      // Deselect all on current page
                      const newSelected = new Set(selectedPermissionIds);
                      currentPageIds.forEach(id => newSelected.delete(id));
                      setSelectedPermissionIds(newSelected);
                    } else {
                      // Select all on current page
                      const newSelected = new Set(selectedPermissionIds);
                      currentPageIds.forEach(id => newSelected.add(id));
                      setSelectedPermissionIds(newSelected);
                    }
                  }}
                >
                  {availablePermissions?.every(p => selectedPermissionIds.has(p.id)) ? "Deselect Page" : "Select Page"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPermissionIds(new Set())}
                >
                  Clear
                </Button>
              </div>
            </div>

            {/* Permissions Table */}
            <div className="flex-1 overflow-auto">
              {catalogLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                  <span className="ml-2 text-gray-500">Loading permissions...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={availablePermissions && availablePermissions.length > 0 && availablePermissions.every(p => selectedPermissionIds.has(p.id))}
                          onCheckedChange={(checked) => {
                            if (checked && availablePermissions) {
                              const newSelected = new Set(selectedPermissionIds);
                              availablePermissions.forEach(p => newSelected.add(p.id));
                              setSelectedPermissionIds(newSelected);
                            } else if (availablePermissions) {
                              const newSelected = new Set(selectedPermissionIds);
                              availablePermissions.forEach(p => newSelected.delete(p.id));
                              setSelectedPermissionIds(newSelected);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Permission</TableHead>
                      <TableHead>Codename</TableHead>
                      <TableHead>App / Model</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availablePermissions?.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedPermissionIds.has(permission.id)}
                            onCheckedChange={(checked) => {
                              const newSelected = new Set(selectedPermissionIds);
                              if (checked) {
                                newSelected.add(permission.id);
                              } else {
                                newSelected.delete(permission.id);
                              }
                              setSelectedPermissionIds(newSelected);
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{permission.name}</TableCell>
                        <TableCell>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {permission.codename}
                          </code>
                        </TableCell>
                        <TableCell>
                          {permission.content_type_app} / {permission.content_type_model}
                        </TableCell>
                      </TableRow>
                    )) || []}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Pagination */}
            {catalogTotalPages > 1 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Page {catalogPage} of {catalogTotalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={catalogPage === 1}
                    onClick={() => {
                      setCatalogPage(p => p - 1);
                      fetchAvailablePermissions();
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={catalogPage === catalogTotalPages}
                    onClick={() => {
                      setCatalogPage(p => p + 1);
                      fetchAvailablePermissions();
                    }}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddPermissionOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPermissions}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

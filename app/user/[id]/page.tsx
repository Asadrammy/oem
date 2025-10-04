"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getUser, deleteUser } from "@/lib/api"; // Add deleteUser import
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params?.id);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false); // Add deleting state

  useEffect(() => {
    if (userId) {
      getUser(userId)
        .then((data) => setUser(data))
        .finally(() => setLoading(false));
    }
  }, [userId]);

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
      <Tabs defaultValue="info" className="space-y-4">
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-black" />
                User Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Crown className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-semibold">Superuser Access</p>
                      <p className="text-sm text-gray-600">
                        Full administrative privileges
                      </p>
                    </div>
                  </div>
                  <Badge variant={user.is_superuser ? "default" : "secondary"}>
                    {user.is_superuser ? "Granted" : "Not granted"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold">Staff Access</p>
                      <p className="text-sm text-gray-600">
                        Access to admin interface
                      </p>
                    </div>
                  </div>
                  <Badge variant={user.is_staff ? "default" : "secondary"}>
                    {user.is_staff ? "Granted" : "Not granted"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
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
    </div>
  );
}

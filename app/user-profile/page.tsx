"use client";

import { useEffect, useState } from "react";
import { getMyProfile } from "@/lib/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Home,
  Shield,
  Moon,
  CheckCircle2,
  XCircle,
  UserCog,
  Key,
  Activity,
  Clock,
  Settings,
  Building,
} from "lucide-react";

type Profile = {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile?: {
    phone_number?: string;
    city?: string;
    state?: string;
    pin?: string;
    address?: string;
    is_phone_verified?: boolean;
    is_email_verified?: boolean;
    role?: string;
    preferred_theme?: string;
    fleet_operator?: string | null;
    ocpi_party_id?: string | null;
    ocpi_role?: string | null;
    ocpi_token?: string | null;
  };
  is_staff?: boolean;
  is_superuser?: boolean;
  is_active?: boolean;
  last_login?: string | null;
};

export default function ProfilePage() {
  const [data, setData] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getMyProfile();
        if (mounted) setData(res);
      } catch (e: any) {
        if (mounted) setErr(e?.message ?? "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading profile...</div>
      </div>
    );
  }
  
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!data) return <div className="p-6">No profile data.</div>;

  const fullName = `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="mb-8">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                    <AvatarFallback className="text-2xl font-bold bg-white text-blue-600">
                      {data.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="text-white">
                  <h1 className="text-3xl font-bold mb-2">
                    {fullName || data.username}
                  </h1>
                  <p className="text-blue-100 text-lg mb-3">{data.email}</p>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {data.profile?.role || "User"}
                    </Badge>
                    {data.is_staff && (
                      <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-100 border-yellow-300/30">
                        Staff
                      </Badge>
                    )}
                    {data.is_superuser && (
                      <Badge variant="secondary" className="bg-red-500/20 text-red-100 border-red-300/30">
                        Superuser
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoField icon={<User className="w-4 h-4" />} label="Username" value={data.username} />
              <InfoField icon={<Mail className="w-4 h-4" />} label="Email" value={data.email} />
              <InfoField icon={<Phone className="w-4 h-4" />} label="Phone" value={data.profile?.phone_number} />
              <InfoField icon={<MapPin className="w-4 h-4" />} label="City" value={data.profile?.city} />
              <InfoField icon={<MapPin className="w-4 h-4" />} label="State" value={data.profile?.state} />
              <InfoField icon={<MapPin className="w-4 h-4" />} label="PIN" value={data.profile?.pin} />
              <InfoField icon={<Home className="w-4 h-4" />} label="Address" value={data.profile?.address} />
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <StatusField
                icon={<Activity className="w-4 h-4" />}
                label="Account Status"
                value={data.is_active ? "Active" : "Inactive"}
                status={data.is_active ? "success" : "error"}
              />
              <StatusField
                icon={<CheckCircle2 className="w-4 h-4" />}
                label="Phone Verified"
                value={data.profile?.is_phone_verified ? "Verified" : "Not Verified"}
                status={data.profile?.is_phone_verified ? "success" : "warning"}
              />
              <StatusField
                icon={<CheckCircle2 className="w-4 h-4" />}
                label="Email Verified"
                value={data.profile?.is_email_verified ? "Verified" : "Not Verified"}
                status={data.profile?.is_email_verified ? "success" : "warning"}
              />
              <InfoField icon={<Clock className="w-4 h-4" />} label="Last Login" 
                value={data.last_login ? new Date(data.last_login).toLocaleString() : "Never"} />
            </CardContent>
          </Card>

          {/* Settings & Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                Settings & Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoField icon={<Shield className="w-4 h-4" />} label="Role" value={data.profile?.role} />
              <InfoField icon={<Moon className="w-4 h-4" />} label="Theme" value={data.profile?.preferred_theme} />
              <InfoField icon={<Building className="w-4 h-4" />} label="Fleet Operator" value={data.profile?.fleet_operator} />
            </CardContent>
          </Card>
        </div>

        {/* OCPI Configuration */}
        {(data.profile?.ocpi_party_id || data.profile?.ocpi_role || data.profile?.ocpi_token) && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-orange-600" />
                OCPI Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoField icon={<Key className="w-4 h-4" />} label="OCPI Party ID" value={data.profile?.ocpi_party_id} />
                <InfoField icon={<Key className="w-4 h-4" />} label="OCPI Role" value={data.profile?.ocpi_role} />
                <InfoField icon={<Key className="w-4 h-4" />} label="OCPI Token" value={data.profile?.ocpi_token} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

/* Reusable Info Field Component */
function InfoField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-gray-500">{icon}</span>
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium text-gray-900">{value || "—"}</p>
      </div>
    </div>
  );
}

/* Status Field Component with colored indicators */
function StatusField({
  icon,
  label,
  value,
  status,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  status: "success" | "warning" | "error";
}) {
  const statusColors = {
    success: "text-green-600",
    warning: "text-yellow-600", 
    error: "text-red-600"
  };

  return (
    <div className="flex items-center gap-3 py-2">
      <span className={statusColors[status]}>{icon}</span>
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className={`font-medium ${statusColors[status]}`}>{value}</p>
      </div>
    </div>
  );
}

/* Small reusable field component */
function Field({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-black">{icon}</span>
      <span className="text-gray-500">{label}:</span>
      <span className="font-medium text-gray-800">{value || "-"}</span>
    </div>
  );
}

/* Simple clock icon (black) */
function ClockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 text-black"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
      />
    </svg>
  );
}

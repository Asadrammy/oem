"use client";

import { useEffect, useState } from "react";
import { getMyProfile } from "@/lib/api"; // adjust path
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

  if (loading) return <div className="p-6 text-gray-500">Loading profile…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!data) return <div className="p-6">No profile data.</div>;

  const fullName = `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim();

  return (
    <main className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="text-xl font-semibold">
            {data.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {fullName || data.username}
          </h1>
          <p className="text-sm text-gray-500">{data.email}</p>
        </div>
      </div>

      <Separator />

      {/* Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-12 text-sm">
        <Field icon={<User size={16} />} label="Username" value={data.username} />
        <Field icon={<Mail size={16} />} label="Email" value={data.email} />
        <Field icon={<Phone size={16} />} label="Phone" value={data.profile?.phone_number} />
        <Field icon={<MapPin size={16} />} label="City" value={data.profile?.city} />
        <Field icon={<MapPin size={16} />} label="State" value={data.profile?.state} />
        <Field icon={<MapPin size={16} />} label="PIN" value={data.profile?.pin} />
        <Field icon={<Home size={16} />} label="Address" value={data.profile?.address} />
        <Field icon={<Shield size={16} />} label="Role" value={data.profile?.role} />
        <Field icon={<Moon size={16} />} label="Theme" value={data.profile?.preferred_theme} />
        <Field icon={<UserCog size={16} />} label="Fleet Operator" value={data.profile?.fleet_operator} />
        <Field icon={<Key size={16} />} label="OCPI Party ID" value={data.profile?.ocpi_party_id} />
        <Field icon={<Key size={16} />} label="OCPI Role" value={data.profile?.ocpi_role} />
        <Field icon={<Key size={16} />} label="OCPI Token" value={data.profile?.ocpi_token} />

        <Field
          icon={<CheckCircle2 size={16} />}
          label="Phone Verified"
          value={data.profile?.is_phone_verified ? "Yes" : "No"}
        />
        <Field
          icon={<CheckCircle2 size={16} />}
          label="Email Verified"
          value={data.profile?.is_email_verified ? "Yes" : "No"}
        />
        <Field
          icon={<Activity size={16} />}
          label="Active"
          value={data.is_active ? "Yes" : "No"}
        />
        <Field
          icon={<Shield size={16} />}
          label="Staff"
          value={data.is_staff ? "Yes" : "No"}
        />
        <Field
          icon={<Shield size={16} />}
          label="Superuser"
          value={data.is_superuser ? "Yes" : "No"}
        />
        <Field
          icon={<ClockIcon />}
          label="Last Login"
          value={data.last_login ? new Date(data.last_login).toLocaleString() : "Never"}
        />
      </div>
    </main>
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

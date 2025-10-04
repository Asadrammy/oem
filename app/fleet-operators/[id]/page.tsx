"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  deleteFleetOperator,
  getFleetOperatorById,
  updateFleetOperatorLogo,
} from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building,
  Barcode,
  Phone,
  Mail,
  MapPin,
  Ruler,
  Languages,
  Calendar,
  Clock,
  Edit,
  Palette,
  Image as ImageIcon,
  Bell,
  Settings,
  Car,
  Shield,
  Users,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Trash2,
  Currency,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";

type FleetOperator = {
  id: number;
  name: string;
  code: string;
  contact: string | null;
  contact_email: string | null;
  address: string | null;
  metadata: any;
  timezone: string;
  currency: string;
  unit_system: string;
  language: string;
  total_vehicles: number;
  date_format: string;
  logo: string | null;
  primary_color: string | null;
  created_at: string;
};

export default function FleetOperatorDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const numericId = useMemo(
    () => (params?.id ? Number(params.id) : NaN),
    [params?.id]
  );

  const [operator, setOperator] = useState<FleetOperator | null>(null);
  const [loading, setLoading] = useState(true);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!numericId || Number.isNaN(numericId)) return;
    let mounted = true;
    (async () => {
      try {
        const data = await getFleetOperatorById(numericId);
        if (!mounted) return;
        setOperator(data);
        setLogoUrl(data?.logo ?? null);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [numericId]);

  useEffect(() => {
    return () => {
      if (logoUrl?.startsWith("blob:")) URL.revokeObjectURL(logoUrl);
    };
  }, [logoUrl]);

  const chooseFile = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowed.includes(file.type)) {
      alert("Unsupported file type");
      return;
    }
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      alert("File too large (max 5MB)");
      return;
    }

    if (logoUrl?.startsWith("blob:")) URL.revokeObjectURL(logoUrl);
    const preview = URL.createObjectURL(file);
    setLogoFile(file);
    setLogoUrl(preview);
  };

  const uploadLogo = async () => {
    if (!numericId || Number.isNaN(numericId)) return;
    if (!logoFile) {
      alert("Please choose a file first");
      return;
    }
    setUploading(true);
    const currentPreview = logoUrl;
    try {
      const updated = await updateFleetOperatorLogo(numericId, logoFile);
      const finalUrl = updated?.logo ?? operator?.logo ?? null;
      if (currentPreview?.startsWith("blob:")) URL.revokeObjectURL(currentPreview);
      setLogoUrl(finalUrl);
      setOperator((prev) => (prev ? { ...prev, logo: finalUrl } : prev));
      setLogoFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      alert("Failed to upload logo");
      if (currentPreview?.startsWith("blob:")) URL.revokeObjectURL(currentPreview);
      setLogoUrl(operator?.logo ?? null);
      setLogoFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    if (logoUrl?.startsWith("blob:")) URL.revokeObjectURL(logoUrl);
    setLogoFile(null);
    setLogoUrl(operator?.logo ?? null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async () => {
    if (!operator) return;
    if (!confirm("Are you sure you want to delete this operator?")) return;
    try {
      await deleteFleetOperator(operator.id);
      alert("Operator deleted successfully");
      router.back();
    } catch (err) {
      console.error(err);
      alert("Failed to delete operator");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!operator) return <p className="p-6">Not found</p>;

  return (
    <div className="mx-auto px-4 py-4 max-w-7xl">
      {/* Header & Actions */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <Button variant="ghost" className="rounded-full" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Fleet Operator
          </Button>
        </div>

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {operator.name} • {operator.code}
          </h1>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Link href={`/fleet-operators/edit/${operator.id}`}>
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                <Edit className="w-4 h-4 mr-2" />
                Edit Operator
              </Button>
            </Link>
            <Button variant="outline" onClick={handleDelete}>
              <span className="flex items-center">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardContent className="p-4 flex items-center gap-3">
            <Car className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-bold text-amber-700">
                {operator?.total_vehicles}
              </p>
              <p className="text-xs text-gray-600">Total Vehicles</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100">
          <CardContent className="p-4 flex items-center gap-3">
            <Shield className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-bold text-amber-700">
                {operator.metadata?.max_vehicles || "N/A"}
              </p>
              <p className="text-xs text-gray-600">Max Vehicles</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100">
          <CardContent className="p-4 flex items-center gap-3">
            <Phone className="w-6 h-6 text-cyan-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p
                className="text-lg font-bold text-cyan-700 truncate"
                title={operator.contact || "N/A"}
              >
                {operator.contact || "N/A"}
              </p>
              <p className="text-xs text-gray-600">Contact</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info Section */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Fleet Operator Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4" />
                  <div>
                    <p className="text-lg text-gray-500">Name</p>
                    <p className="font-semibold">{operator.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Barcode className="w-4 h-4 " />
                  <div>
                    <p className="text-lg">Code</p>
                    <p className="font-semibold">{operator.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4" />
                  <div>
                    <p className="text-xs text-gray-500">Contact</p>
                    <p className="font-semibold">{operator.contact || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4  " />
                  <div>
                    <p className="text-xs text-gray-500">Contact Email</p>
                    <p className="font-semibold">
                      {operator.contact_email ? (
                        <a
                          href={`mailto:${operator.contact_email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {operator.contact_email}
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Timezone</p>
                    <p className="font-semibold">
                      {operator.timezone || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Currency className="w-4 h-4" />
                  <div>
                    <p className="text-xs text-gray-500">Currency</p>
                    <p className="font-semibold">
                      {operator.currency || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Ruler className="w-4 h-4" />
                  <div>
                    <p className="text-xs text-gray-500">Unit</p>
                    <p className="font-semibold">
                      {operator.unit_system || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4" />
                  <div>
                    <p className="text-xs text-gray-500">Date Format</p>
                    <p className="font-semibold">
                      {operator.date_format || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Languages className="w-4 h-4" />
                  <div>
                    <p className="text-xs text-gray-500">Language</p>
                    <p className="font-semibold">
                      {operator.language || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4" />
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="font-semibold">{operator.address || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t">
                <Clock className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Created At</p>
                  <p className="font-semibold">
                    {new Date(operator.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Sections */}
        <div className="space-y-6">
          {/* Branding Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Palette className="w-4 h-4 text-pink-600" />
                <div>
                  <p className="text-xs text-gray-500">Primary Color</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{
                        backgroundColor: operator.primary_color || "#ccc",
                      }}
                    />
                    <p className="font-semibold">
                      {operator.primary_color || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="w-10 h-10 rounded-md object-cover border"
                  />
                ) : (
                  <div className="w-10 h-10 flex items-center justify-center bg-gray-100 border rounded-md">
                    <span className="text-gray-400 text-xs">No Logo</span>
                  </div>
                )}
              </div>

              <div>
                <Label>Logo</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={chooseFile}
                      disabled={uploading}
                    >
                      Choose File
                    </Button>
                    {logoFile && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeFile}
                        disabled={uploading}
                        title="Remove selected file"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      onClick={uploadLogo}
                      disabled={!logoFile || uploading}
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      {uploading ? "Uploading..." : "Upload Logo"}
                    </Button>
                  </div>

                  {logoFile && (
                    <div className="text-sm text-gray-600">
                      Selected: {logoFile.name} ({(logoFile.size / 1024).toFixed(1)} KB)
                    </div>
                  )}

                  <p className="text-xs text-gray-500">
                    Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-black" />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {operator.metadata?.alert_email && (
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Alert Email</p>
                    <p className="font-semibold">
                      <a
                        href={`mailto:${operator.metadata.alert_email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {operator.metadata.alert_email}
                      </a>
                    </p>
                  </div>
                </div>
              )}
              {operator.metadata?.maintenance_schedule && (
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">
                      Maintenance Schedule
                    </p>
                    <p className="font-semibold">
                      {operator.metadata.maintenance_schedule}
                    </p>
                  </div>
                </div>
              )}
              {operator.metadata?.geofence_radius_meters && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">
                      Geofence Radius (meters)
                    </p>
                    <p className="font-semibold">
                      {operator.metadata.geofence_radius_meters}
                    </p>
                  </div>
                </div>
              )}
              {operator.metadata?.subscription_tier && (
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Subscription Tier</p>
                    <p className="font-semibold capitalize">
                      {operator.metadata.subscription_tier}
                    </p>
                  </div>
                </div>
              )}
              {operator.metadata?.max_vehicles && (
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Max Vehicles</p>
                    <p className="font-semibold">
                      {operator.metadata.max_vehicles}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions Section at Bottom */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href={`/vehicles?fleet=${operator.id}`}>
                  <Car className="w-4 h-4 mr-2" />
                  View Vehicles
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

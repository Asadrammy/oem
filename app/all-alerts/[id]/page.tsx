"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Settings,
  Clock,
  Bell,
  User,
  Car,
  Zap,
  ArrowLeft,
  RefreshCw,
  Edit,
  Activity,
  Database,
  CheckCircle,
  XCircle,
  Thermometer,
  ExternalLink,
  MapPin,
  Calendar,
  Cpu,
  Eye,
  Check,
} from "lucide-react";
import { getAlerts, resolveAlerts } from "@/lib/api";

export default function AlertDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [alert, setAlert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [resolveSuccess, setResolveSuccess] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAlerts(id);
      setAlert(data);
    } catch (e) {
      setError("Failed to load alert data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const onResolve = async () => {
    if (!id || resolving || alert?.resolved) return;
    setResolving(true);
    setResolveError(null);
    setResolveSuccess(null);
    try {
      await resolveAlerts(id);
      await fetchData();
      router.refresh();
      setResolveSuccess("Alert marked as resolved");
    } catch (e: any) {
      setResolveError(e?.message || "Failed to resolve alert");
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-500">Loading alert details...</p>
        </div>
      </div>
    );
  }

  if (error || !alert) {
    return (
      <div className="text-center text-red-500 mt-10">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
        <p className="text-lg font-semibold">Error Loading Alert</p>
        <p className="text-gray-600 mb-4">{error || "Alert not found"}</p>
        <Button onClick={fetchData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "resolved":
        return "default";
      case "acknowledged":
        return "secondary";
      case "active":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="mx-auto px-4 py-4 max-w-7xl space-y-6">
      {/* Header */}
      <div className="space-y-4">
        {/* First Row - Back Button */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            className="rounded-full"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back To Alert page
          </Button>
        </div>

        {/* Second Row - Title and Action Buttons */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">{alert.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>

            <Button
              onClick={onResolve}
              disabled={resolving || !!alert.resolved}
              className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-60"
              title={alert.resolved ? "Already resolved" : "Resolve this alert"}
            >
              <Check className="w-4 h-4 mr-2" />
              {resolving ? "Resolving..." : alert.resolved ? "Resolved" : "Resolve"}
            </Button>

            <Button variant="outline" asChild>
              <Link href={`/vehicles/${alert.vehicle}`}>
                <Car className="w-4 h-4 mr-2" />
                View Vehicle
              </Link>
            </Button>
          </div>
        </div>

        {(resolveError || resolveSuccess) && (
          <div className="flex items-center gap-3">
            {resolveError && (
              <p className="text-sm text-red-600">{resolveError}</p>
            )}
            {resolveSuccess && (
              <p className="text-sm text-green-700">{resolveSuccess}</p>
            )}
          </div>
        )}
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-bold capitalize">{alert.severity}</p>
              <p className="text-xs text-gray-600">Severity Level</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4 flex items-center gap-3">
            <Database className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold capitalize">{alert.system}</p>
              <p className="text-xs text-gray-600">Affected System</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">
                {new Date(alert.created_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-600">Created Date</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4 flex items-center gap-3">
            {alert.resolved ? (
              <CheckCircle className="w-6 h-6 text-purple-600 flex-shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-purple-600 flex-shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold">
                {alert.resolved ? "Yes" : "No"}
              </p>
              <p className="text-xs text-gray-600">Resolved Status</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Alert Information */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-black" />
                Alert Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Alert Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Alert ID</p>
                    <p className="font-semibold">#{alert.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                    <Database className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Alert Type</p>
                    <p className="font-semibold capitalize">
                      {String(alert.alert_type || "").replace("_", " ")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                    <Cpu className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">OBD Device</p>
                    <p className="font-semibold">{alert.device_id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <Badge variant={getStatusColor(alert.status_label)}>
                      {alert.status_label}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Severity</p>
                    <Badge
                      variant={getSeverityColor(alert.severity)}
                      className="capitalize"
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                    {alert.read ? (
                      <Eye className="w-4 h-4 text-black" />
                    ) : (
                      <Bell className="w-4 h-4 text-black" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Read Status</p>
                    <Badge variant={alert.read ? "default" : "secondary"}>
                      {alert.read ? "Read" : "Unread"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Alert Message */}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                    <Bell className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Alert Message</p>
                    <p className="font-semibold">{alert.message}</p>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-black" />
                  Timeline
                </h4>

                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        Created
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>

                  {alert.resolved_at && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          Resolved
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold">
                        {new Date(alert.resolved_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vehicle & Device Information Sidebar */}
        <div className="space-y-6">
          {/* Vehicle Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5 text-black" />
                Vehicle Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <Car className="w-4 h-4 text-black" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Vehicle</p>
                  <p className="font-semibold">
                    {alert.vehicle_info.make} {alert.vehicle_info.model}
                  </p>
                  <p className="text-xs text-gray-500">
                    {alert.vehicle_info.year}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <Database className="w-4 h-4 text-black" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">License Plate</p>
                  <p className="font-semibold">
                    {alert.vehicle_info.license_plate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-black" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Health Status</p>
                  <Badge variant="outline" className="capitalize">
                    {alert.vehicle_info.health_status}
                  </Badge>
                </div>
              </div>

              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href={`/vehicles/${alert.vehicle}`}>
                  <Car className="w-4 h-4 mr-2 text-black" />
                  View Vehicle Details
                  <ExternalLink className="w-3 h-3 ml-1 text-black" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Device Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-black" />
                Device Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-black" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Device ID</p>
                  <p className="font-semibold">{alert.device_id}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <Database className="w-4 h-4 text-black" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">OBD Device</p>
                  <p className="font-semibold">#{alert.obd_device}</p>
                </div>
              </div>

              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href={`/obd-device/${alert.obd_device}`}>
                  <Cpu className="w-4 h-4 mr-2 text-black" />
                  View Device Details
                  <ExternalLink className="w-3 h-3 ml-1 text-black" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Alert Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-black" />
                Alert Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">
                  {alert.ignored ? "Yes" : "No"}
                </p>
                <p className="text-xs text-gray-600">Ignored</p>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-900">
                  {alert.read ? "Yes" : "No"}
                </p>
                <p className="text-xs text-gray-600">Read</p>
              </div>

              {alert.resolved && (
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-bold text-green-900">Resolved</p>
                  <p className="text-xs text-gray-600">
                    {new Date(alert.resolved_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

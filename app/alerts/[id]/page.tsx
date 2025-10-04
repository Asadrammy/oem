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
  Timer,
  Trash2,
} from "lucide-react";
import { getAlertRuleById, deleteAlertRule } from "@/lib/api";
import api from "@/lib/api"; // assuming you have axios instance

export default function AlertRuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [alertRule, setAlertRule] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAlertRuleById(id);
      setAlertRule(data);
    } catch (e) {
      setError("Failed to load alert rule data");
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async () => {
    if (!confirm("Are you sure you want to resolve this alert?")) return;

    setResolving(true);
    try {
      const res = await api.put(`/api/fleet/alerts/${id}/resolve/`, { method: "PUT" });
      alert("Alert resolved successfully");
      fetchData(); // Refresh data
    } catch (err) {
      console.error(err);
      alert("Error resolving alert");
    } finally {
      setResolving(false);
    }
  };

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

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
        <p className="text-gray-500">Loading alert rule details...</p>
      </div>
    );
  }

  if (error || !alertRule) {
    return (
      <div className="text-center text-red-500 mt-10">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
        <p className="text-lg font-semibold">Error Loading Alert Rule</p>
        <p className="text-gray-600 mb-4">{error || "Alert rule not found"}</p>
        <Button onClick={fetchData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-4 max-w-7xl space-y-6">
      {/* Header & Action Buttons */}
     <div className="flex flex-col gap-4">
  {/* Row 1: Back button only */}
  <div>
    <Button
      variant="ghost"
      className="rounded-full"
      onClick={() => router.back()}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back to Alerts
    </Button>
  </div>

  {/* Row 2: Title, badge, and actions */}
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    {/* Left side: Title + Badge */}
    <div className="flex items-center gap-3">
      <h1 className="text-xl font-bold text-gray-900">{alertRule.name}</h1>
      <Badge variant={alertRule.is_active ? "default" : "secondary"}>
        {alertRule.is_active ? "Active" : "Inactive"}
      </Badge>
    </div>

    {/* Right side: Actions */}
    <div className="flex items-center gap-3">
      {alertRule.is_active && (
        <Button
          className="bg-green-600 text-white hover:bg-green-700"
          onClick={resolveAlert}
          disabled={resolving}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          {resolving ? "Resolving..." : "Resolve Alert"}
        </Button>
      )}
      <Button variant="outline" onClick={fetchData}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Refresh
      </Button>
      <Link href={`/alerts/edit/${alertRule.id}`}>
        <Button className="bg-blue-600 text-white hover:bg-blue-700">
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </Link>
      <Button
        variant="outline"
        onClick={async () => {
          if (confirm("Delete this alert?")) {
            try {
              await deleteAlertRule(alertRule.id);
              alert("Alert deleted");
              router.back();
            } catch (err) {
              console.error(err);
              alert("Delete failed");
            }
          }
        }}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete
      </Button>
    </div>
  </div>
</div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-bold capitalize">{alertRule.severity}</p>
              <p className="text-xs text-gray-600">Severity</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-bold">{alertRule.trigger_duration_sec}s</p>
              <p className="text-xs text-gray-600">Trigger Duration</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4 flex items-center gap-3">
            <Timer className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-bold">{alertRule.cooldown_minutes}m</p>
              <p className="text-xs text-gray-600">Cooldown Period</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4 flex items-center gap-3">
            <Activity className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold">{alertRule.conditions.length}</p>
              <p className="text-xs text-gray-600">Conditions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Info & Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Alert Rule Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4" />
                  <div>
                    <p className="text-xs text-gray-500">Rule Name</p>
                    <p className="font-semibold">{alertRule.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Database className="w-4 h-4" />
                  <div>
                    <p className="text-xs text-gray-500">System</p>
                    <p className="font-semibold capitalize">{alertRule.system}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4" />
                  <div>
                    <p className="text-xs text-gray-500">Logic</p>
                    <p className="font-semibold">{alertRule.condition_logic}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {alertRule.is_active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <Badge variant={alertRule.is_active ? "default" : "secondary"}>
                      {alertRule.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4" />
                  <div>
                    <p className="text-xs text-gray-500">Auto Resolve</p>
                    <Badge variant={alertRule.auto_resolve ? "default" : "outline"}>
                      {alertRule.auto_resolve ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4" />
                  <div>
                    <p className="text-xs text-gray-500">Severity</p>
                    <Badge variant={getSeverityColor(alertRule.severity)} className="capitalize">
                      {alertRule.severity}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-3 mb-3">
                  <Database className="w-4 h-4" />
                  <div>
                    <p className="text-xs text-gray-500">Description</p>
                    <p className="font-semibold">{alertRule.description}</p>
                  </div>
                </div>
              </div>

              {/* Conditions */}
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Alert Conditions ({alertRule.condition_logic})
                </h4>

                <div className="space-y-3">
                  {alertRule.conditions.map((condition: any, index: number) => (
                    <div key={condition.id} className="p-3 bg-gray-50 rounded-lg">
                      <Badge variant="outline" className="text-xs">
                        Condition {index + 1}
                      </Badge>
                      <p className="mt-2 font-mono text-sm">
                        <span className="font-semibold text-blue-600">{condition.field}</span>
                        <span className="mx-2 text-gray-600">{condition.operator}</span>
                        <span className="font-semibold text-green-600">{condition.threshold}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Notifications, Vehicle Targeting, Timing */}
        <div className="space-y-6">
          {/* Notification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4" />
                <div>
                  <p className="text-xs text-gray-500">Channels</p>
                  {alertRule.notification_channels.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {alertRule.notification_channels.map((channel: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs capitalize">
                          {channel.replace("_", " ")}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No channels configured</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-4 h-4" />
                <div>
                  <p className="text-xs text-gray-500">Recipients</p>
                  {alertRule.recipients.length ? (
                    <div className="space-y-1">
                      {alertRule.recipients.map((recipient: string, idx: number) => (
                        <p key={idx} className="text-sm font-mono">{recipient}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No recipients configured</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Targeting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                Vehicle Targeting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Car className="w-4 h-4" />
                <div>
                  <p className="text-xs text-gray-500">Vehicle Types</p>
                  {alertRule.vehicle_types.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {alertRule.vehicle_types.map((vt: number, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">Type {vt}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">All vehicle types</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Timing Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-900">{alertRule.trigger_duration_sec}s</p>
                <p className="text-xs text-gray-600">Trigger Duration</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-900">{alertRule.cooldown_minutes}min</p>
                <p className="text-xs text-gray-600">Cooldown Period</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

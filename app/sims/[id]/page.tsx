"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Smartphone,
  Database,
  Signal,
  Calendar,
  AlertTriangle,
  Clock,
  DollarSign,
  ExternalLink,
  ArrowLeft,
  RefreshCw,
  Activity,
  Gauge,
  Wifi,
  Edit,
  TrendingUp,
  Settings,
  Cpu,
} from "lucide-react";
import { getSIMCard } from "@/lib/api";

export default function SimCardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [simCard, setSimCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSIMCard(id);
      setSimCard(data);
    } catch (e) {
      setError("Failed to load SIM card data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-500">Loading SIM card details...</p>
        </div>
      </div>
    );
  }

  if (error || !simCard) {
    return (
      <div className="text-center text-red-500 mt-10">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
        <p className="text-lg font-semibold">Error Loading SIM Card</p>
        <p className="text-gray-600 mb-4">{error || "SIM card not found"}</p>
        <Button onClick={fetchData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const dataUsagePercent =
    (simCard.current_data_used_gb / simCard.plan_data_limit_gb) * 100;
  const isOverageRisk = dataUsagePercent >= simCard.overage_threshold * 100;

  return (
    <div className="mx-auto px-4 py-4 max-w-7xl space-y-6">
      {/* Header */}
      <div className="space-y-4">
        {/* First Row - Back Button Only */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            className="rounded-full"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sim Page
          </Button>
        </div>

        {/* Second Row - Name and Action Buttons */}
        <div className="flex items-center justify-between">
          {/* Left side - SIM Name and Status */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">
                SIM Card {simCard.sim_id}
              </h1>
              <Badge
                variant={
                  simCard.status === "active"
                    ? "default"
                    : simCard.status === "suspended"
                    ? "destructive"
                    : "secondary"
                }
                className="capitalize"
              >
                {simCard.status}
              </Badge>
            </div>
          </div>

          {/* Right side - Action Buttons */}
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/sims/edit/${simCard.id}`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit SIM
              </Link>
            </Button>
            {simCard.device && (
              <Button
                asChild
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <Link href={`/obd-device/${simCard.device}`}>
                  <Cpu className="w-4 h-4 mr-2" />
                  View Device
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4 flex items-center gap-3">
            <Database className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-bold">
                {simCard.current_data_used_gb} GB
              </p>
              <p className="text-xs text-gray-600">Data Used</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4 flex items-center gap-3">
            <Gauge className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-bold">
                {simCard.plan_data_limit_gb} GB
              </p>
              <p className="text-xs text-gray-600">Data Limit</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4 flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-bold">${simCard.plan_cost}</p>
              <p className="text-xs text-gray-600">Monthly Cost</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4 flex items-center gap-3">
            <Signal className="w-6 h-6 text-orange-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p
                className="text-xl font-bold truncate"
                title={simCard.signal_strength}
              >
                {simCard.signal_strength || "Unknown"}
              </p>
              <p className="text-xs text-gray-600">Signal Strength</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SIM Card Information */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-black" />
                SIM Card Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">SIM ID</p>
                    <p className="font-semibold">{simCard.sim_id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Database className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">ICCID</p>
                    <p className="font-mono text-sm">{simCard.iccid}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <Badge
                      variant={
                        simCard.status === "active"
                          ? "default"
                          : simCard.status === "suspended"
                          ? "destructive"
                          : "secondary"
                      }
                      className="capitalize"
                    >
                      {simCard.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Signal className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Signal Strength</p>
                    <p className="font-semibold">
                      {simCard.signal_strength || "Unknown"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Signal className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Plan Name</p>
                    <p className="font-semibold">
                      {simCard?.plan_name || "Unknown"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Cpu className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Connected Device</p>
                    {simCard.device ? (
                      <Link
                        href={`/obd-device/${simCard.device}`}
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        Device #{simCard.device}
                      </Link>
                    ) : (
                      <p className="font-semibold text-gray-400">
                        Not connected
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Created At</p>
                    <p className="text-sm">
                      {new Date(simCard.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Usage Section */}
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Database className="w-4 h-4 text-black" />
                  Data Usage & Plan Details
                </h4>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Data Usage Progress
                      </span>
                      <span className="text-sm text-gray-600">
                        {simCard.current_data_used_gb} /{" "}
                        {simCard.plan_data_limit_gb} GB (
                        {dataUsagePercent.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress
                      value={dataUsagePercent}
                      className={`h-2 ${
                        isOverageRisk ? "bg-red-100" : "bg-gray-200"
                      }`}
                    />
                    {isOverageRisk && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        <span>
                          Approaching overage threshold (
                          {simCard.overage_threshold * 100}%)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <Wifi className="w-4 h-4 text-black" />
                      <div>
                        <p className="text-xs text-gray-500">Plan Name</p>
                        <p className="font-semibold">{simCard.plan_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <DollarSign className="w-4 h-4 text-black" />
                      <div>
                        <p className="text-xs text-gray-500">Monthly Cost</p>
                        <p className="font-semibold">${simCard.plan_cost}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-black" />
                      <div>
                        <p className="text-xs text-gray-500">
                          Overage Threshold
                        </p>
                        <p className="font-semibold">
                          {simCard.overage_threshold * 100}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity & Status Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-black" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Activity</p>
                  <p className="text-sm font-semibold">
                    {new Date(simCard.last_activity).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-black" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Current Cycle Start</p>
                  <p className="text-sm font-semibold">
                    {simCard.current_cycle_start}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-black" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm">
                    {new Date(simCard.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Usage Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">
                  {(
                    (simCard.current_data_used_gb /
                      simCard.plan_data_limit_gb) *
                    100
                  ).toFixed(1)}
                  %
                </p>
                <p className="text-xs text-gray-600">of data plan used</p>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-lg font-bold text-blue-900">
                  {(
                    simCard.plan_data_limit_gb - simCard.current_data_used_gb
                  ).toFixed(1)}{" "}
                  GB
                </p>
                <p className="text-xs text-gray-600">remaining this cycle</p>
              </div>

              {isOverageRisk && (
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <AlertTriangle className="w-5 h-5 text-red-600 mx-auto mb-1" />
                  <p className="text-xs text-red-700 font-medium">
                    Overage Risk
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" asChild className="h-16 flex-col gap-2" disabled={!simCard.device}>
              <Link href={`/obd-device/${simCard.device}`}>
                <Cpu className="w-5 h-5" />
                <span>View Device</span>
              </Link>
            </Button>

            <Button variant="outline" asChild className="h-16 flex-col gap-2">
              <Link href={`/sim-cards/edit/${simCard.id}`}>
                <Edit className="w-5 h-5" />
                <span>Edit SIM Card</span>
              </Link>
            </Button>

            <Button variant="outline" asChild className="h-16 flex-col gap-2">
              <Link href={`/api/fleet/sim-cards/${simCard.id}/usage-history`}>
                <TrendingUp className="w-5 h-5" />
                <span>Usage History</span>
              </Link>
            </Button>

            <Button variant="outline" onClick={fetchData} className="h-16 flex-col gap-2">
              <RefreshCw className="w-5 h-5" />
              <span>Refresh Data</span>
            </Button>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}

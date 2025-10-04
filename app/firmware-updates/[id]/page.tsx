"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Download,
  Box,
  Calendar,
  Server,
  Zap,
  Check,
  X,
  ArrowLeft,
  RefreshCw,
  Edit,
  Activity,
  Database,
  FileText,
  Settings,
  AlertTriangle,
  Clock,
  TrendingUp,
  ExternalLink,
  Package,
} from "lucide-react";
import { firmwareUpdatesByID, firmwareUpdatesSummary } from "@/lib/api";

export default function FirmwareUpdateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [update, setUpdate] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await firmwareUpdatesByID(id);
      setUpdate(data);

      const summaryData = await firmwareUpdatesSummary(id);
      setSummary(summaryData);
    } catch (err) {
      console.error("Failed to fetch firmware update", err);
      setError("Failed to load firmware update details");
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
          <p className="text-gray-500">Loading firmware update details...</p>
        </div>
      </div>
    );
  }

  if (error || !update) {
    return (
      <div className="text-center text-red-500 mt-10">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
        <p className="text-lg font-semibold">Error Loading Firmware Update</p>
        <p className="text-gray-600 mb-4">
          {error || "Firmware update not found"}
        </p>
        <Button onClick={fetchData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "rolling_out":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatFileSize = (size: number) => {
    if (!size) return "—";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalInstalls =
    (summary?.success_count || 0) + (summary?.failure_count || 0);
  const successRate =
    totalInstalls > 0
      ? ((summary?.success_count || 0) / totalInstalls) * 100
      : 0;

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
            Back To Firmware Update page
          </Button>
        </div>

        {/* Second Row - Title and Action Buttons */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">
                Firmware Update v{update.version}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            {/* <Button variant="outline" asChild>
              <Link href={`/firmware-updates/edit/${update.id}`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Update
              </Link>
            </Button> */}
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4 flex items-center gap-3">
            <Server className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-bold">{summary?.target_count || 0}</p>
              <p className="text-xs text-gray-600">Target Devices</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4 flex items-center gap-3">
            <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-bold">
                {summary?.success_count || 0}
              </p>
              <p className="text-xs text-gray-600">Successful</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-4 flex items-center gap-3">
            <X className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-bold">
                {summary?.failure_count || 0}
              </p>
              <p className="text-xs text-gray-600">Failed</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-bold">{successRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-600">Success Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Update Information */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Update Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                    <Box className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Component</p>
                    <p className="font-semibold capitalize">
                      {update.component}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                    <Server className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Version</p>
                    <p className="font-semibold">{update.version}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Priority</p>
                    <Badge variant="outline">{update.priority}</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Release Date</p>
                    <p className="font-semibold">{update.release_date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <Badge
                      variant={getStatusColor(update.status)}
                      className="capitalize"
                    >
                      {update.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                    <Download className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">File Size</p>
                    <p className="font-semibold">
                      {formatFileSize(update.file_size)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Description</p>
                    <p className="font-semibold">
                      {update.description.replace(/"/g, "") ||
                        "No description provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Download Section */}
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Firmware File
                </h4>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Firmware Package</p>
                      <p className="text-sm text-gray-600">
                        Size: {formatFileSize(update.file_size)}
                      </p>
                    </div>
                    <Button asChild>
                      <Link
                        href={update.file}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Installation Progress Sidebar */}
        <div className="space-y-6">
          {/* Installation Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Installation Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Success Rate</span>
                  <span className="text-sm text-gray-600">
                    {successRate.toFixed(1)}%
                  </span>
                </div>
                <Progress value={successRate} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-lg font-bold text-green-900">
                    {summary?.success_count || 0}
                  </p>
                  <p className="text-xs text-gray-600">Successful</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-lg font-bold text-red-900">
                    {summary?.failure_count || 0}
                  </p>
                  <p className="text-xs text-gray-600">Failed</p>
                </div>
              </div>

              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-lg font-bold text-blue-900">
                  {summary?.target_count || 0}
                </p>
                <p className="text-xs text-gray-600">Total Targets</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="font-semibold capitalize">{update.status.replace('_', ' ')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Priority Level</p>
                  <p className="font-semibold">{update.priority}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Component</p>
                  <p className="font-semibold capitalize">{update.component}</p>
                </div>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>

      {/* Installation Records */}
      {update.installs && update.installs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Installation Records ({update.installs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Device ID
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Installed At
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {update.installs.map((install: any, idx: number) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="font-semibold">
                          {install.device_id || "—"}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            install.status === "success"
                              ? "default"
                              : "destructive"
                          }
                          className="capitalize"
                        >
                          {install.status || "Unknown"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm">
                          {install.installed_at
                            ? new Date(install.installed_at).toLocaleString()
                            : "—"}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/obd-devices/${install.device_id}`}>
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" asChild className="h-16 flex-col gap-2">
              <Link href={`/firmware-updates/edit/${update.id}`}>
                <Edit className="w-5 h-5" />
                <span>Edit Update</span>
              </Link>
            </Button>

            <Button variant="outline" asChild className="h-16 flex-col gap-2">
              <Link href={update.file} target="_blank">
                <Download className="w-5 h-5" />
                <span>Download File</span>
              </Link>
            </Button>

            <Button variant="outline" asChild className="h-16 flex-col gap-2">
              <Link href={`/firmware-updates/${update.id}/deploy`}>
                <Activity className="w-5 h-5" />
                <span>Deploy Update</span>
              </Link>
            </Button>

            <Button
              variant="outline"
              onClick={fetchData}
              className="h-16 flex-col gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Refresh Data</span>
            </Button>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}

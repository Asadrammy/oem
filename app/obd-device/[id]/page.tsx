"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { deleteDevice, getOBDDevice, listVehicles } from "@/lib/api";
import {
  Cpu,
  Wifi,
  Clock,
  Signal,
  Calendar,
  Power,
  Database,
  HardDrive,
  Smartphone,
  Activity,
  Car,
  ArrowLeft,
  Edit,
  Eye,
  Settings,
  ExternalLink,
  DollarSign,
  Gauge,
  RefreshCw,
  Trash2,
} from "lucide-react";

interface Vehicle {
  id: number;
  make: string;
  model: string;
  name?: string;
}

export default function OBDDeviceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [device, setDevice] = useState<any>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    if (!device?.id) return;
    setDeleting(true);
    try {
      await deleteDevice(device.id);
      setDeleteOpen(false);
      router.push("/obd-device"); // redirect to device list page after delete
    } catch (error: any) {
      console.error("Delete failed:", error);
      alert(error?.message || "Failed to delete device");
    } finally {
      setDeleting(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setDeleteOpen(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getOBDDevice(id);
        setDevice(data);

        const vehiclesData = await listVehicles();
        const vehicles: Vehicle[] = vehiclesData.results || vehiclesData;

        const matchedVehicle =
          vehicles.find((v) => v.id === data.vehicle) || null;
        setVehicle(matchedVehicle);
      } catch (error) {
        console.error("Failed to fetch device data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-500">Loading device details...</p>
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="p-6 text-center text-gray-500">Device not found.</div>
    );
  }

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
            Back to OBD device
          </Button>
        </div>

        {/* Second Row - Device ID and Action Buttons */}
        <div className="flex items-center justify-between">
          {/* Left side - Device ID */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">
                OBD Device {device.device_id}
              </h1>
            </div>
          </div>

          {/* Right side - Action Buttons */}
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>

            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              asChild
            >
              <Link href={`/obd-device/edit/${device.id}`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Device
              </Link>
            </Button>

            {/* {device.vehicle && ( */}
            <Button 
              variant="outline" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDeleteOpen(true);
              }}
            >
              <span className="flex items-center">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </span>
            </Button>

            {/* )} */}
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4 flex items-center gap-3">
            <Database className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p
                className="text-xl font-bold truncate"
                title={device.firmware_version}
              >
                {device.firmware_version || "—"}
              </p>
              <p className="text-xs text-gray-600">Firmware Version</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4 flex items-center gap-3">
            <Wifi className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold">
                {device.is_active ? "Active" : "Inactive"}
              </p>
              <p className="text-xs text-gray-600">Status </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-6 h-6 text-orange-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold">
                {device.report_interval_sec
                  ? `${device.report_interval_sec}s`
                  : "—"}
              </p>
              <p className="text-xs text-gray-600">Report Interval</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4 flex items-center gap-3">
            <Activity className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">
                {device.last_communication_at
                  ? new Date(device.last_communication_at).toLocaleDateString()
                  : "—"}
              </p>
              <p className="text-xs text-gray-600">Last Communication</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Device Information */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5" />
                Device Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <HardDrive className="w-5 h-5 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Device ID</p>
                    <p className="font-semibold">{device.device_id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Serial Number</p>
                    <p className="font-mono text-sm">{device.serial_number}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Model</p>
                    <p className="font-semibold">{device.model || "Unknown"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Firmware Version</p>
                    <p className="font-semibold">{device.firmware_version}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Car className="w-5 h-5 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Assigned Vehicle</p>
                    {vehicle ? (
                      <Link
                        href={`/vehicles/${vehicle.id}`}
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        {vehicle.make} {vehicle.model}
                      </Link>
                    ) : (
                      <p className="font-semibold text-gray-400">
                        Not assigned
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Power className="w-5 h-5 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <Badge variant={device.is_active ? "default" : "secondary"}>
                      {device.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3">Technical Specifications</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Wifi className="w-5 h-5 text-black" />
                    <div>
                      <p className="text-xs text-gray-500">CAN Baud Rate</p>
                      <p className="font-semibold">{device.can_baud_rate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-black" />
                    <div>
                      <p className="text-xs text-gray-500">Report Interval</p>
                      <p className="font-semibold">
                        {device.report_interval_sec}s
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-black" />
                    <div>
                      <p className="text-xs text-gray-500">Installed At</p>
                      <p className="text-sm">
                        {new Date(device.installed_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-black" />
                    <div>
                      <p className="text-xs text-gray-500">
                        Last Communication
                      </p>
                      <p className="text-sm">
                        {new Date(
                          device.last_communication_at
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SIM Card Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-black" />
                SIM Card Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {device.sim_card ? (
                <>
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4 text-black" />
                    <div>
                      <p className="text-xs text-gray-500">SIM ID</p>
                      <p className="font-mono text-sm">
                        {device.sim_card.sim_id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Database className="w-4 h-4 text-black" />
                    <div>
                      <p className="text-xs text-gray-500">ICCID</p>
                      <p className="font-mono text-xs">
                        {device.sim_card.iccid}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Signal className="w-4 h-4 text-black" />
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <Badge variant="outline">{device.sim_card.status}</Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Wifi className="w-4 h-4 text-black" />
                    <div>
                      <p className="text-xs text-gray-500">Plan</p>
                      <p className="font-semibold">
                        {device.sim_card.plan_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Gauge className="w-4 h-4 text-black" />
                    <div>
                      <p className="text-xs text-gray-500">Data Usage</p>
                      <p className="font-semibold">
                        {device.sim_card.current_data_used_gb} /{" "}
                        {device.sim_card.plan_data_limit_gb} GB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <DollarSign className="w-4 h-4 text-black" />
                    <div>
                      <p className="text-xs text-gray-500">Plan Cost</p>
                      <p className="font-semibold">
                        ${device.sim_card.plan_cost}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Signal className="w-4 h-4 text-black" />
                    <div>
                      <p className="text-xs text-gray-500">Signal Strength</p>
                      <p className="font-semibold">
                        {device.sim_card.signal_strength || "Unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-black" />
                    <div>
                      <p className="text-xs text-gray-500">Cycle Start</p>
                      <p className="text-sm">
                        {device.sim_card.current_cycle_start}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-black" />
                    <div>
                      <p className="text-xs text-gray-500">Last Activity</p>
                      <p className="text-sm">
                        {new Date(
                          device.sim_card.last_activity
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full"
                  >
                    <Link href={`/sim-cards/${device.sim_card.id}`}>
                      View SIM Details
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Link>
                  </Button> */}
                </>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No SIM card linked to this device
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              asChild
              className="h-16 flex-col gap-2"
              disabled={!device.vehicle}
            >
              <Link href={`/vehicles/${device.vehicle}`}>
                <Car className="w-5 h-5" />
                <span>View Vehicle</span>
              </Link>
            </Button>

            {/* <Button variant="outline" asChild className="h-16 flex-col gap-2">
              <Link href={`/obd-device/edit/${device.id}`}>
                <Edit className="w-5 h-5" />
                <span>Edit Device</span>
              </Link>
            </Button> */}
            {/* 
            <Button
              variant="outline"
              asChild
              className="h-16 flex-col gap-2"
              disabled={!device.sim_card}
            >
              <Link href={`/sim-cards/${device.sim_card?.id}`}>
                <Smartphone className="w-5 h-5" />
                <span>SIM Card Details</span>
              </Link>
            </Button> */}

            <Button
              variant="outline"
              asChild
              className="h-16 flex-col gap-2"
              disabled={!device.vehicle}
            >
              <Link href={`/obd-telemetry/?vehicle=${device.vehicle}`}>
                <Database className="w-5 h-5" />
                <span>View Telemetry</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog
        open={deleteOpen}
        onOpenChange={handleDialogClose}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete OBD device "{device?.device_id}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDialogClose(false);
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDelete();
              }}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

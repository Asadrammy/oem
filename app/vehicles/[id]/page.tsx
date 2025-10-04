"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Battery,
  Thermometer,
  Zap,
  MapPin,
  Car,
  Cpu,
  Calendar,
  Users,
  Droplet,
  Repeat,
  Layers,
  AlertTriangle,
  SmartphoneIcon,
  Clock,
  BarChart3Icon,
  Gauge,
  DollarSign,
  Activity,
  Signal,
  Building,
  ExternalLink,
  Settings,
  FileText,
  Database,
  Bell,
  Edit,
  Trash2,
  Wifi,
  ShieldCheck,
  Palette,
  Hash,
  RefreshCw,
} from "lucide-react";
import VehicleDashboardEmbedded from "@/components/vehicle-analytics";
import { getVehicleById } from "@/lib/api";

export default function VehicleDetailsPage() {
  const params = useParams();
  const id = Number(params?.id);

  const [vehicleData, setVehicleData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await getVehicleById(id);
        setVehicleData(res);
      } catch (err) {
        console.error("Error fetching vehicle:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <p>Loading vehicle details...</p>;
  if (!vehicleData) return <p>Vehicle not found.</p>;

  const { vehicle, latest_obd, recent_alerts } = vehicleData;

  // ✅ Est. Range Calculation
  const estRange =
    vehicle.current_battery_level &&
    vehicle.battery_capacity_kwh &&
    vehicle.efficiency_km_per_kwh
      ? Math.round(
          (vehicle.current_battery_level / 100) *
            vehicle.battery_capacity_kwh *
            vehicle.efficiency_km_per_kwh
        )
      : null;

  return (
    <div className="mx-auto px-4 py-4 max-w-7xl space-y-6">
      {/* Header */}
      <div className="space-y-4">
        {/* First Row - Back Button Only */}
        <div className="flex items-center">
          <Link href="/vehicles">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Vehicles</span>
            </Button>
          </Link>
        </div>

        {/* Second Row - Vehicle Name/Info and Action Buttons */}
        <div className="flex items-center justify-between">
          {/* Left side - Vehicle Name and Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">
                {vehicle.make} {vehicle.model} - {vehicle.license_plate}
              </h1>
            </div>
          </div>

          {/* Right side - Action Buttons */}
          <div className="flex items-center gap-3">
            <Button className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 border border-gray-200">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </Button>

            <Link href={`/fleet-operators/edit/${vehicle.id}`}>
              <Button className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 px-4 py-2">
                <Edit className="w-4 h-4" />
                <span>Edit Vehicle</span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              className="flex items-center bg-white gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4 flex items-center gap-3">
            <Battery className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold">
                {vehicle.current_battery_level ?? "—"}%
              </p>
              <p className="text-xs text-gray-600">Battery Level</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4 flex items-center gap-3">
            <Wifi className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold">
                {vehicle.online_status ?? "—"}
              </p>
              <p className="text-xs text-gray-600">Online Status</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-orange-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold">{vehicle.status ?? "—"}</p>
              <p className="text-xs text-gray-600">Status</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4 flex items-center gap-3">
            <Car className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p
                className="text-lg font-bold truncate"
                title={vehicle.vehicle_type}
              >
                {vehicle.vehicle_type ?? "—"}
              </p>
              <p className="text-xs text-gray-600">Vehicle Type</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="w-full justify-start border-b">
          <TabsTrigger value="info" className="flex items-center gap-2">
            <Car className="w-4 h-4 text-black" />
            Vehicle Info
          </TabsTrigger>
          <TabsTrigger value="obd" className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-black" />
            OBD Device
          </TabsTrigger>
          <TabsTrigger value="sim" className="flex items-center gap-2">
            <SmartphoneIcon className="w-4 h-4 text-black" />
            SIM Card
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-black" />
            Recent Alerts
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-black" />
            Vehicle Analytics
          </TabsTrigger>
        </TabsList>

        {/* Vehicle Info Tab */}
        <TabsContent value="info">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Basic Vehicle Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Car className="w-5 h-5 text-black" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Make</p>
                    <p className="font-semibold">{vehicle.make}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Car className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Model</p>
                    <p className="font-semibold">{vehicle.model}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Year</p>
                    <p className="font-semibold">{vehicle.year}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Hash className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">VIN</p>
                    <p className="font-semibold">{vehicle.vin}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Palette className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Color</p>
                    <p className="font-semibold">{vehicle.color}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Specifications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5 text-black" />
                  Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Droplet className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Fuel Type</p>
                    <p className="font-semibold">{vehicle.fuel_type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Repeat className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Transmission</p>
                    <p className="font-semibold">{vehicle.transmission_type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Seating Capacity</p>
                    <p className="font-semibold">{vehicle.seating_capacity}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Battery className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Battery Capacity</p>
                    <p className="font-semibold">
                      {vehicle.battery_capacity_kwh} kWh
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status & Location */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-black" />
                  Status & Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <Badge variant="outline" className="capitalize">
                      {vehicle.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Wifi className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Online Status</p>
                    <Badge
                      variant={
                        vehicle.online_status === "online"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {vehicle.online_status}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Gauge className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Mileage</p>
                    <p className="font-semibold">
                      {vehicle.mileage?.toLocaleString() ?? "—"} km
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm font-mono">
                      {vehicle.latitude}, {vehicle.longitude}
                    </p>
                    <Link
                      href={`https://www.google.com/maps?q=${vehicle.latitude},${vehicle.longitude}`}
                      target="_blank"
                      className="text-blue-600 hover:underline text-xs flex items-center gap-1 mt-1"
                    >
                      <MapPin className="w-3 h-3 text-black" /> View on Map
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* OBD Device Tab */}
        <TabsContent value="obd">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Cpu className="w-5 h-5 text-black" />
                OBD Device Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vehicle.obd_device ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <Cpu className="w-4 h-4 text-black" />
                    <div>
                      <p className="text-xs text-gray-500">Device ID</p>
                      <p className="font-semibold">
                        {vehicle.obd_device.device_id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Settings className="w-4 h-4 text-black" />
                    <div>
                      <p className="text-xs text-gray-500">Model</p>
                      <p className="font-semibold">
                        {vehicle.obd_device.model}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Hash className="w-4 h-4 text-black" />
                    <div>
                      <p className="text-xs text-gray-500">Serial Number</p>
                      <p className="font-mono text-sm">
                        {vehicle.obd_device.serial_number}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-black" />
                    <div>
                      <p className="text-xs text-gray-500">Firmware Version</p>
                      <p className="font-semibold">
                        {vehicle.obd_device.firmware_version}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-black" />
                    <div>
                      <p className="text-xs text-gray-500">Installed At</p>
                      <p className="text-sm">
                        {new Date(
                          vehicle.obd_device.installed_at
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-black" />
                    <div>
                      <p className="text-xs text-gray-500">
                        Last Communication
                      </p>
                      <p className="text-sm">
                        {new Date(
                          vehicle.obd_device.last_communication_at
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No OBD device connected.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SIM Card Tab */}
        <TabsContent value="sim">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <SmartphoneIcon className="w-5 h-5 text-black" />
                SIM Card Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vehicle?.obd_device?.sim_card ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* SIM ID */}
                  <div className="flex items-center gap-3">
                    <SmartphoneIcon className="w-5 h-5 text-black" />
                    <div>
                      <p className="text-xs text-gray-500">SIM ID</p>
                      <p className="font-mono text-sm">
                        {vehicle.obd_device.sim_card.sim_id}
                      </p>
                    </div>
                  </div>

                  {/* ICCID */}
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-black" />
                    <div>
                      <p className="text-xs text-gray-500">ICCID</p>
                      <p className="font-mono text-sm">
                        {vehicle.obd_device.sim_card.iccid}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <Badge variant="outline">
                        {vehicle.obd_device.sim_card.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Plan Name */}
                  <div className="flex items-center gap-3">
                    <Layers className="w-5 h-5 text-black" />
                    <div>
                      <p className="text-xs text-gray-500">Plan Name</p>
                      <p className="font-semibold">
                        {vehicle.obd_device.sim_card.plan_name}
                      </p>
                    </div>
                  </div>

                  {/* Data Limit */}
                  <div className="flex items-center gap-3">
                    <Gauge className="w-5 h-5 text-black" />
                    <div>
                      <p className="text-xs text-gray-500">Data Limit</p>
                      <p className="font-semibold">
                        {vehicle.obd_device.sim_card.plan_data_limit_gb} GB
                      </p>
                    </div>
                  </div>

                  {/* Data Used */}
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-black" />
                    <div>
                      <p className="text-xs text-gray-500">Data Used</p>
                      <p className="font-semibold">
                        {vehicle.obd_device.sim_card.current_data_used_gb} GB
                      </p>
                    </div>
                  </div>

                  {/* Plan Cost */}
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-black" />
                    <div>
                      <p className="text-xs text-gray-500">Plan Cost</p>
                      <p className="font-semibold">
                        ${vehicle.obd_device.sim_card.plan_cost}
                      </p>
                    </div>
                  </div>

                  {/* Signal Strength */}
                  <div className="flex items-center gap-3">
                    <Signal className="w-5 h-5 text-black" />
                    <div>
                      <p className="text-xs text-gray-500">Signal Strength</p>
                      <p className="font-semibold">
                        {vehicle.obd_device.sim_card.signal_strength || "none"}
                      </p>
                    </div>
                  </div>

                  {/* Last Activity */}
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-black" />
                    <div>
                      <p className="text-xs text-gray-500">Last Activity</p>
                      <p className="text-sm">
                        {new Date(
                          vehicle.obd_device.sim_card.last_activity
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No SIM card connected.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Alerts Tab */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-black" />
                Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recent_alerts.length ? (
                <div className="space-y-4">
                  {recent_alerts.map((alert: any) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        alert.severity === "high"
                          ? "border-red-500 bg-red-50"
                          : alert.severity === "medium"
                          ? "border-yellow-400 bg-yellow-50"
                          : "border-green-400 bg-green-50"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              [{alert.severity}] {alert.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {alert.message}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(alert.created_at).toLocaleDateString()}
                          </p>
                          <Badge variant="outline" className="mt-1">
                            {alert.status_label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No recent alerts</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3Icon className="w-5 h-5 text-black" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense
                fallback={
                  <p className="text-sm text-gray-500">Loading analytics…</p>
                }
              >
                <VehicleDashboardEmbedded vehicleId={id} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions - Bottom Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-black" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Button variant="outline" asChild className="h-16 flex-col gap-2">
              <Link href={`/obd-telemetry/?vehicle=${vehicle.id}`}>
                <Database className="w-5 h-5" />
                <span>OBD Telemetry</span>
              </Link>
            </Button>

            <Button variant="outline" asChild className="h-16 flex-col gap-2">
              <Link href={`/fleet-operators/${vehicle.fleet_operator}`}>
                <Building className="w-5 h-5" />
                <span>Fleet Operator</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-16 flex-col gap-2">
              <Link href={`/vehicle-dashboard/?vehicleId=${vehicle.id}`}>
                <Building className="w-5 h-5" />
                <span>View Analatics</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-16 flex-col gap-2">
              <Link href={`/sims/${vehicle?.obd_device?.sim_card?.id}`}>
                <Building className="w-5 h-5" />
                <span>SIM Card </span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-16 flex-col gap-2">
              <Link href={`/obd-device/${vehicle?.obd_device?.id}`}>
                <Building className="w-5 h-5" />
                <span>OBD Device</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

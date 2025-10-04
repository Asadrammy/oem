"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getOBDTelemetry } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Battery,
  Thermometer,
  Gauge,
  MapPin,
  Car,
  Zap,
  Activity,
  Ruler,
  CircleDot,
  Power,
  GaugeCircle,
  ArrowLeft,
  Clock,
  Database,
  AlertTriangle,
  Navigation,
  TrendingUp,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

export default function OBDTelemetryPage() {
   const params = useParams();
  const router = useRouter();

  const obdId = Number(params?.id);
  console.log("obdId",obdId)
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOBDTelemetry(obdId);
      setTelemetry(data);
    } catch (error) {
      console.error("Failed to fetch telemetry", error);
      setError("Failed to load telemetry data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [obdId]);

  const formatValue = (val: any, unit: string = "") =>
    val === null || val === "" ? "—" : `${val}${unit}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-500">Loading telemetry data...</p>
        </div>
      </div>
    );
  }

  if (error || !telemetry) {
    return (
      <div className="text-center text-red-500 mt-10">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
        <p className="text-lg font-semibold">Error Loading Telemetry</p>
        <p className="text-gray-600 mb-4">
          {error || "Telemetry data not found"}
        </p>
        <Button onClick={fetchData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-4 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
  {/* Row 1 - Back Button */}
  <div>
    <Button
      variant="ghost"
      className="rounded-full"
      onClick={() => router.back()}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back To OBD Telemetry Page
    </Button>
  </div>

  {/* Row 2 - Title and Actions */}
  <div className="flex items-center justify-between">
    <h1 className="text-xl font-bold text-gray-900">OBD Telemetry</h1>
    <div className="flex items-center gap-3">
      <Button variant="outline" onClick={fetchData}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Refresh
      </Button>
      <Link href={`/vehicles/${telemetry.vehicle_id}`}>
        <Button className="bg-blue-600 text-white hover:bg-blue-700">
          <Car className="w-4 h-4 mr-2" />
          Vehicle Details
        </Button>
      </Link>
    </div>
  </div>
</div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4 flex items-center gap-3">
            <Gauge className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-bold">
                {formatValue(telemetry.speed_kph, " km/h")}
              </p>
              <p className="text-xs text-gray-600">Current Speed</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4 flex items-center gap-3">
            <Battery className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-bold">
                {formatValue(telemetry.battery_level_percent, "%")}
              </p>
              <p className="text-xs text-gray-600">Battery Level</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4 flex items-center gap-3">
            <Thermometer className="w-6 h-6 text-orange-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-bold">
                {formatValue(telemetry.motor_temp_c, "°C")}
              </p>
              <p className="text-xs text-gray-600">Motor Temperature</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4 flex items-center gap-3">
            <MapPin className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">
                {telemetry.latitude?.toFixed(4)},{" "}
                {telemetry.longitude?.toFixed(4)}
              </p>
              <p className="text-xs text-gray-600">Current Location</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Telemetry Data */}
        <div className="md:col-span-2 space-y-6">
          {/* Battery & Power Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Battery className="w-5 h-5" />
                Battery & Power Systems
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                    <Battery className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Battery Level</p>
                    <p className="font-semibold">
                      {formatValue(telemetry.battery_level_percent, "%")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Battery Voltage</p>
                    <p className="font-semibold">
                      {formatValue(telemetry.battery_voltage, " V")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                    <Power className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Battery Power</p>
                    <p className="font-semibold">
                      {formatValue(telemetry.battery_power_kw, " kW")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                    <GaugeCircle className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Charge Limit</p>
                    <p className="font-semibold">
                      {formatValue(telemetry.charge_limit_percent, "%")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance & Diagnostics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Performance & Diagnostics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                    <Gauge className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Current Speed</p>
                    <p className="font-semibold">
                      {formatValue(telemetry.speed_kph, " km/h")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                    <Thermometer className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Motor Temperature</p>
                    <p className="font-semibold">
                      {formatValue(telemetry.motor_temp_c, "°C")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                    <CircleDot className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Torque</p>
                    <p className="font-semibold">
                      {formatValue(telemetry.torque_nm, " Nm")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                    <Ruler className="w-4 h-4 " />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Tire Pressure</p>
                    <p className="font-semibold">
                      {formatValue(telemetry.tire_pressure_kpa, " kPa")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                    <Navigation className="w-4 h-4 " />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Range</p>
                    <p className="font-semibold">
                      {formatValue(telemetry.range_km, " km")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                    <Gauge className="w-4 h-4 " />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Odometer</p>
                    <p className="font-semibold">
                      {formatValue(telemetry.odometer_km, " km")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Trip Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                Trip Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                  <Navigation className="w-4 h-4 text-black" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Trip ID</p>
                  <p className="font-semibold">#{telemetry.trip}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                  <Car className="w-4 h-4 " />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Vehicle ID</p>
                  <p className="font-semibold">#{telemetry.vehicle_id}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                  <Database className="w-4 h-4 text-black" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Device ID</p>
                  <p className="font-semibold">
                    {formatValue(telemetry.device_id)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 " />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Timestamp</p>
                  <p className="text-sm font-mono">
                    {new Date(telemetry.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Latitude</p>
                  <p className="font-mono text-sm">{telemetry.latitude}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Longitude</p>
                  <p className="font-mono text-sm">{telemetry.longitude}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Coordinates</p>
                  <p className="text-xs text-gray-700">
                    {telemetry.coordinates}
                  </p>
                </div>
              </div>

              <Button variant="outline" size="sm" asChild className="w-full">
                <Link
                  href={`https://www.google.com/maps?q=${telemetry.latitude},${telemetry.longitude}`}
                  target="_blank"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  View on Map
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Error Codes</p>
                  <p className="font-semibold">
                    {telemetry.error_codes || (
                      <Badge
                        variant="secondary"
                        className="text-green-700 bg-green-100"
                      >
                        No Errors
                      </Badge>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" asChild className="h-16 flex-col gap-2">
              <Link href={`/vehicles/${telemetry.vehicle_id}`}>
                <Car className="w-5 h-5" />
                <span>Vehicle Details</span>
              </Link>
            </Button>

            <Button variant="outline" asChild className="h-16 flex-col gap-2">
              <Link href={`/api/fleet/history/vehicle/${telemetry.vehicle_id}`}>
                <TrendingUp className="w-5 h-5" />
                <span>Analytics</span>
              </Link>
            </Button>

            <Button variant="outline" asChild className="h-16 flex-col gap-2">
              <Link
                href={`https://www.google.com/maps?q=${telemetry.latitude},${telemetry.longitude}`}
                target="_blank"
              >
                <MapPin className="w-5 h-5" />
                <span>View on Map</span>
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

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  ArrowLeft,
  Edit,
  Gauge,
  Zap,
  Battery,
  Car,
  Trash2,
} from "lucide-react";
import { deleteVehicleType, getVehicleType } from "@/lib/api";

type VehicleType = {
  id: number;
  code: string;
  name: string;
  category: string;
  drivetrain: string;
  battery_capacity_kwh: number;
  motor_power_kw: number;
  wltp_range_km: number;
  status: "active" | "inactive";
  description?: string;
  active_vehicle_count?: number;
};

export default function VehicleTypeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [vt, setVt] = useState<VehicleType | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchType() {
    try {
      const data = await getVehicleType(id);
      setVt(data);
    } catch (e) {
      console.error("Failed to load vehicle type", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    fetchType();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-500">Loading vehicle type...</p>
        </div>
      </div>
    );
  }

  if (!vt) {
    return (
      <div className="p-6 text-center text-gray-500">
        Vehicle type not found.
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-4 max-w-5xl space-y-6">
      {/* Header */}
      <div className="space-y-4">
        {/* Back */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            className="rounded-full"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to types
          </Button>
        </div>

        {/* Title + Actions */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">
                {vt.name} ({vt.code})
              </h1>
              <Badge variant="outline" className="capitalize">
                {vt.category}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {vt.drivetrain}
              </Badge>
              <Badge
                variant={vt.status === "active" ? "default" : "secondary"}
                className="capitalize"
              >
                {vt.status}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => fetchType()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>

            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              asChild
            >
              <Link href={`/vehicle-types/edit/${vt.id}`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Type
              </Link>
            </Button>
            <Button
              className="bg-white text-black hover:bg-gray-300"
              onClick={async () => {
                if (
                  !confirm("Are you sure you want to delete this vehicle type?")
                )
                  return;
                try {
                  await deleteVehicleType(vt.id); // use your API call
                  router.push("/vehicle-types"); // go back after deletion
                } catch (e) {
                  console.error(e);
                  alert("Failed to delete vehicle type");
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete 
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100">
          <CardContent className="p-4 flex items-center gap-3">
            <Battery className="w-6 h-6 text-indigo-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold">
                {vt.battery_capacity_kwh ?? "—"}
              </p>
              <p className="text-xs text-gray-600">Battery (kWh)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4 flex items-center gap-3">
            <Zap className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold">{vt.motor_power_kw ?? "—"}</p>
              <p className="text-xs text-gray-600">Motor Power (kW)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-4 flex items-center gap-3">
            <Gauge className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold">{vt.wltp_range_km ?? "—"}</p>
              <p className="text-xs text-gray-600">WLTP Range (km)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4 flex items-center gap-3">
            <Car className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold">
                {vt.active_vehicle_count ?? "—"}
              </p>
              <p className="text-xs text-gray-600">Active Vehicles</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex gap-2 items-center">
            <Zap className="w-4 h-4 text-black" />
            <span className="text-gray-500 w-32">Code</span>
            <span className="font-medium">{vt.code}</span>
          </div>

          <div className="flex gap-2 items-center">
            <Car className="w-4 h-4 text-black" />
            <span className="text-gray-500 w-32">Name</span>
            <span className="font-medium">{vt.name}</span>
          </div>

          <div className="flex gap-2 items-center">
            <Battery className="w-4 h-4 text-black" />
            <span className="text-gray-500 w-32">Category</span>
            <span className="font-medium">{vt.category}</span>
          </div>

          <div className="flex gap-2 items-center">
            <Gauge className="w-4 h-4 text-black" />
            <span className="text-gray-500 w-32">Drivetrain</span>
            <span className="font-medium">{vt.drivetrain}</span>
          </div>

          <div className="flex gap-2 items-center">
            <Zap className="w-4 h-4 text-black" />
            <span className="text-gray-500 w-32">Status</span>
            <span className="font-medium capitalize">{vt.status}</span>
          </div>

          {vt.description && (
            <div className="pt-2 border-t flex gap-2 items-start">
              <Edit className="w-4 h-4 mt-1 text-black" />
              <p className="text-gray-700">{vt.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Button variant="outline" asChild className="h-16 flex-col gap-2">
              <Link href={`/vehicles?vehicle_type=${vt.id}`}>
                <Car className="w-5 h-5" />
                <span>View Vehicles</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Eye, Plus, Edit, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listVehicles, listVehiclesType, deleteVehicle } from "@/lib/api";

interface Vehicle {
  id: number;
  vin: string;
  model: string;
  make: string;
  vehicle_type: number;
  health_status: "Good" | "Warning" | "Critical";
  current_battery_level: number;
  mileage_km: number;
  license_plate: string;
  online_status: string;
  status?: string; // Add status field for filtering
}

interface VehicleType {
  id: number;
  name: string;
}

const healthConfig = {
  Good: { color: "bg-green-500", label: "Good" },
  Warning: { color: "bg-orange-500", label: "Warning" },
  Critical: { color: "bg-red-500", label: "Critical" },
};

export default function VehiclesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fleetId = searchParams.get("fleet");
  const initialTypeId = searchParams.get("vehicletypeId") || "all";

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedOnlineStatus, setSelectedOnlineStatus] = useState<string>("all");
  const [selectedHealth, setSelectedHealth] = useState<string>("all");

  // pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchVehicleTypes = async () => {
    try {
      const data = await listVehiclesType();
      console.log("Vehicle Types API Response:", data);
      setVehicleTypes(data.results ?? []);
    } catch (err) {
      console.error("Error fetching vehicle types:", err);
    }
  };

  const typeMap = useMemo(
    () => {
      const map = Object.fromEntries(vehicleTypes.map((t) => [t.id, t.name]));
      console.log("TypeMap created:", map);
      return map;
    },
    [vehicleTypes]
  );

  const fetchVehicles = async (pageNum: number = page) => {
    setLoading(true);
    try {
      const resp = await listVehicles(
        pageNum,
        fleetId ? Number(fleetId) : undefined,
        initialTypeId !== "all" ? Number(initialTypeId) : undefined
      );

      console.log("API Response:", resp);
      let rows: Vehicle[] = resp.results ?? [];
      let count = resp.count ?? rows.length;
      
      // Debug vehicle data
      if (rows.length > 0) {
        console.log("First vehicle data:", rows[0]);
        console.log("Vehicle types available:", vehicleTypes);
      }

      // local filters
      if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        rows = rows.filter((v) => {
          const name = `${v.make} ${v.model}`.toLowerCase();
          return (
            (v.vin ?? "").toLowerCase().includes(lower) ||
            name.includes(lower) ||
            (v.model ?? "").toLowerCase().includes(lower) ||
            (v.make ?? "").toLowerCase().includes(lower) ||
            (v.license_plate ?? "").toLowerCase().includes(lower)
          );
        });
      }

      if (selectedStatus !== "all") {
        // Note: This assumes the API returns a status field. You may need to adjust based on actual API response
        rows = rows.filter((v) => {
          // Map the status values - adjust based on your actual data structure
          const statusMap: Record<string, string> = {
            "Available": "available",
            "In-Service/Maintenance": "maintenance", 
            "Retired": "retired"
          };
          return v.status === statusMap[selectedStatus];
        });
      }

      if (selectedOnlineStatus !== "all") {
        rows = rows.filter((v) => {
          const onlineMap: Record<string, string> = {
            "Online": "online",
            "Offline": "offline"
          };
          return v.online_status === onlineMap[selectedOnlineStatus];
        });
      }

      if (selectedHealth !== "all") {
        rows = rows.filter((v) => v.health_status === selectedHealth);
      }

      // After local filtering, reflect counts in UI
      count = rows.length;

      setVehicles(rows);
      setTotalCount(count);
      setTotalPages(Math.ceil(count / limit) || 1);
      setPage(pageNum);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles(1);
  }, [fleetId]);

  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [page, selectedStatus, selectedOnlineStatus, selectedHealth]);

  // Auto-clear search when search term is empty
  useEffect(() => {
    if (searchTerm === "") {
      fetchVehicles(1);
    }
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fleet Vehicles</h1>
          <p className="text-gray-600">Manage and monitor your vehicle fleet</p>
        </div>
        <Link href="/vehicles/add">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Vehicle
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-4">
          {/* Free text search across VIN/Make/Model/Plate */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by VIN, make, model, license plate..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <Select
            value={selectedStatus}
            onValueChange={(val) => {
              setSelectedStatus(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="In-Service/Maintenance">In-Service/Maintenance</SelectItem>
              <SelectItem value="Retired">Retired</SelectItem>
            </SelectContent>
          </Select>

          {/* Online Status Filter */}
          <Select
            value={selectedOnlineStatus}
            onValueChange={(val) => {
              setSelectedOnlineStatus(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Online Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Online Status</SelectItem>
              <SelectItem value="Online">Online</SelectItem>
              <SelectItem value="Offline">Offline</SelectItem>
            </SelectContent>
          </Select>

          {/* Health */}
          <Select
            value={selectedHealth}
            onValueChange={(val) => {
              setSelectedHealth(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Health Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Good">Good</SelectItem>
              <SelectItem value="Warning">Warning</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => fetchVehicles(1)} className="bg-gray-700 hover:bg-gray-800">
            Search
          </Button>
        </CardContent>
      </Card>

      {/* Vehicles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Fleet ({vehicles.length} / {totalCount})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading vehicles...</p>
          ) : vehicles.length === 0 ? (
            <p className="text-gray-500">No vehicles found.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Vehicle Type</TableHead>
                    <TableHead>License Plate</TableHead>
                    <TableHead>Health</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => {
                    const name = `${vehicle.make} ${vehicle.model}`.trim();
                    const vt = typeMap[vehicle.vehicle_type] ?? "N/A";
                    console.log(`Vehicle ${vehicle.vin}: vehicle_type=${vehicle.vehicle_type}, mapped_type=${vt}, typeMap=`, typeMap);
                    return (
                      <TableRow key={vehicle.id}>
                        <TableCell>
                          <Link href={`/vehicles/${vehicle.id}`} className="block">
                            <div className="font-medium text-blue-600 hover:underline">{vehicle.vin}</div>
                            <div className="text-sm text-gray-500">{name || "—"}</div>
                          </Link>
                        </TableCell>
                        <TableCell>{vehicle.model || <span className="text-gray-400 italic">N/A</span>}</TableCell>
                        <TableCell>{vt}</TableCell>
                        <TableCell>
                          {vehicle.license_plate || (
                            <span className="text-gray-400 italic">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${healthConfig[vehicle.health_status].color}`}
                            />
                            <span className="text-sm">
                              {healthConfig[vehicle.health_status].label}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{vehicle.online_status}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Link href={`/vehicles/${vehicle.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                console.log("Edit button clicked for vehicle:", vehicle.id);
                                e.stopPropagation();
                                router.push(`/vehicles/edit/${vehicle.id}`);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                if (confirm("Are you sure you want to delete this vehicle?")) {
                                  try {
                                    await deleteVehicle(vehicle.id);
                                    fetchVehicles(page);
                                  } catch (err) {
                                    console.error("Delete failed:", err);
                                    alert("Failed to delete vehicle");
                                  }
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex flex-col md:flex-row justify-between items-center mt-4 px-2 gap-3">
                <span className="text-sm text-gray-600">
                  Showing {(page - 1) * limit + 1}–{Math.min(page * limit, totalCount)} of {totalCount}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Button
                      key={p}
                      variant={p === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

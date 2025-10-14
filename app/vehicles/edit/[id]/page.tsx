"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Save, ArrowLeft } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

import {
  getVehicleById,
  updateVehicle,
  listVehiclesType,
  listFleetOperators,
} from "@/lib/api";
interface FleetOperator {
  id: string;
  name: string;
}
export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const vehicleId = Number(params?.id); // now vehicleId is a number

  // State for form fields
  const [vin, setVin] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [vehicleType, setVehicleType] = useState<string | undefined>(undefined);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [batteryCapacity, setBatteryCapacity] = useState("");
  const [currentBattery, setCurrentBattery] = useState("");
  const [mileage, setMileage] = useState("");
  const [warranty, setWarranty] = useState("");
  const [status, setStatus] = useState("available");
  const [color, setColor] = useState("");
  const [seating, setSeating] = useState("");
  const [fuelType, setFuelType] = useState("Electric");
  const [transmission, setTransmission] = useState("Automatic");
  const [efficiency, setEfficiency] = useState("");

  // Vehicle Types
  const [vehicleTypes, setVehicleTypes] = useState<
    { id: string; name: string; category: string }[]
  >([]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  // Error & Loading
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fleetOperator, setFleetOperator] = useState<string | undefined>(
    undefined
  );

  const [fleetOperators, setFleetOperators] = useState<FleetOperator[]>([]);

  useEffect(() => {
    async function fetchOperators() {
      try {
        // setLoading(true);
        const resp = await listFleetOperators(); // call your API fn
        setFleetOperators(resp.results); // assuming resp is array of {id, name}
      } catch (error) {
        console.error("Error fetching fleet operators:", error);
      } finally {
        // setLoading(false);
      }
    }

    fetchOperators();
  }, []);
  // Load vehicle types
  useEffect(() => {
    (async () => {
      try {
        setLoadingTypes(true);
        const resp = await listVehiclesType();
        const types = Array.isArray(resp?.results)
          ? resp.results
          : Array.isArray(resp)
          ? resp
          : [];
        setVehicleTypes(
          types.map((t: any) => ({
            id: String(t.id),
            name: t.name || `Type ${t.id}`,
            category: t.category || "Uncategorized", // Add category field
          }))
        );
      } finally {
        setLoadingTypes(false);
      }
    })();
  }, []);

  // Load vehicle data
  useEffect(() => {
    if (!vehicleId) return;
    (async () => {
      try {
        setLoading(true);
        const vehicledata = await getVehicleById(vehicleId);
        const data = vehicledata; // API returns data directly, not nested under 'vehicle'
        console.log("Full API response:", vehicledata);
        console.log("Vehicle data:", data);
        console.log("Vehicle type from API:", data.vehicle_type);
        console.log("Vehicle type ID from API:", data.vehicle_type_id);
        console.log("Fleet operator from API:", data.fleet_operator);
        console.log("Fleet operator type:", typeof data.fleet_operator);
        console.log("All vehicle fields:", Object.keys(data));

        setVin(data.vin || "");
        setLicensePlate(data.license_plate || "");
        setVehicleType(
          data.vehicle_type_id ? String(data.vehicle_type_id) : 
          (typeof data.vehicle_type === 'object' && data.vehicle_type?.id) ? String(data.vehicle_type.id) :
          data.vehicle_type ? String(data.vehicle_type) : undefined
        );
        // Handle fleet_operator - could be object with id or just the id
        setFleetOperator(
          typeof data.fleet_operator === 'object' && data.fleet_operator?.id 
            ? String(data.fleet_operator.id) 
            : data.fleet_operator 
            ? String(data.fleet_operator) 
            : undefined
        );
        setMake(data.make || "");
        setModel(data.model || "");
        setYear(data.year ? String(data.year) : "");
        setBatteryCapacity(data.battery_capacity_kwh?.toString() || "");
        setCurrentBattery(data.current_battery_level?.toString() || "");
        setMileage(data.mileage_km?.toString() || "");
        setWarranty(data.warranty_expiry_date || "");
        setStatus(data.status || "available");
        setColor(data.color || "");
        setSeating(data.seating_capacity?.toString() || "");
        setFuelType(data.fuel_type || "Electric");
        setTransmission(data.transmission_type || "Automatic");
        setEfficiency(data.efficiency_km_per_kwh?.toString() || "");
      } catch (e: any) {
        setErr("Failed to load vehicle data");
      } finally {
        setLoading(false);
      }
    })();
  }, [vehicleId]);

  // Handle submit

  const onSubmit = async () => {
    setErr("");
    setSubmitting(true);

    // Basic validation
    if (!vin.trim()) {
      toast({
        title: "Error",
        description: "VIN is required",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    if (!licensePlate.trim()) {
      toast({
        title: "Error", 
        description: "License Plate is required",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    if (!vehicleType) {
      toast({
        title: "Error",
        description: "Vehicle Type is required", 
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    const payload = {
      vin,
      license_plate: licensePlate,
      fleet_operator: fleetOperator ? Number(fleetOperator) : undefined,
      vehicle_type: vehicleType ? Number(vehicleType) : undefined,
      make,
      model,
      year: year ? Number(year) : undefined,
      battery_capacity_kwh: batteryCapacity ? parseFloat(batteryCapacity) : undefined,
      current_battery_level: currentBattery ? parseFloat(currentBattery) : undefined,
      mileage_km: mileage ? Number(mileage) : undefined,
      warranty_expiry_date: warranty,
      status,
      color,
      seating_capacity: seating ? Number(seating) : undefined,
      fuel_type: fuelType,
      transmission_type: transmission,
      efficiency_km_per_kwh: efficiency ? parseFloat(efficiency) : undefined,
    };

    console.log("Update payload:", payload);
    console.log("Vehicle ID:", vehicleId);
    console.log("Vehicle Type value:", vehicleType);
    console.log("Fleet Operator value:", fleetOperator);

    try {
      const result = await updateVehicle(vehicleId, payload);
      console.log("Update successful:", result);

      toast({
        title: "Success",
        description: "Vehicle updated successfully!",
        variant: "default", // default for success
      });

      router.push("/vehicles");
    } catch (e: any) {
      console.error("Update error:", e);
      console.error("Error response:", e?.response?.data);
      
      const errorMessage = e?.response?.data?.detail || 
                          e?.response?.data?.message || 
                          e?.message || 
                          "Failed to update vehicle";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive", // red for error
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading vehicle...</div>;
  
  // Debug: Log current state values
  console.log("Form state values:", {
    vin,
    licensePlate,
    vehicleType,
    fleetOperator,
    make,
    model,
    year,
    batteryCapacity,
    currentBattery,
    mileage,
    warranty,
    status,
    color,
    seating,
    fuelType,
    transmission,
    efficiency
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Link href="/vehicles">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Vehicles
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-center">Edit Vehicle</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {err && <div className="text-red-600">{err}</div>}

          {/* VIN & Plate */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>VIN *</Label>
              <Input value={vin} onChange={(e) => setVin(e.target.value)} />
            </div>
            <div>
              <Label>License Plate *</Label>
              <Input
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
              />
            </div>
          </div>

          {/* Type & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Vehicle Type *</Label>
              <Select value={vehicleType} onValueChange={setVehicleType}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingTypes ? "Loading types..." : "Select type"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} ({type.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Fleet Operator *</Label>
              <Select value={fleetOperator} onValueChange={setFleetOperator}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loading ? "Loading operators..." : "Select operator"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {fleetOperators.map((op) => (
                    <SelectItem key={op.id} value={op.id}>
                      {op.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Rest of form (same as Add) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Make *</Label>
              <Input value={make} onChange={(e) => setMake(e.target.value)} />
            </div>
            <div>
              <Label>Model *</Label>
              <Input value={model} onChange={(e) => setModel(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Year</Label>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
            <div>
              <Label>Warranty Expiry</Label>
              <Input
                type="date"
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Battery Capacity (kWh)</Label>
              <Input
                type="number"
                value={batteryCapacity}
                onChange={(e) => setBatteryCapacity(e.target.value)}
              />
            </div>
            <div>
              <Label>Current Battery Level (%)</Label>
              <Input
                type="number"
                value={currentBattery}
                onChange={(e) => setCurrentBattery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Mileage (km)</Label>
              <Input
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
              />
            </div>
            <div>
              <Label>Efficiency (km/kWh)</Label>
              <Input
                type="number"
                value={efficiency}
                onChange={(e) => setEfficiency(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Color</Label>
              <Input value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
            <div>
              <Label>Seating Capacity</Label>
              <Input
                type="number"
                value={seating}
                onChange={(e) => setSeating(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fuel Type</Label>
              <Input
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
              />
            </div>
            <div>
              <Label>Transmission</Label>
              <Input
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link href="/vehicles">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={onSubmit} disabled={submitting}>
              <Save className="w-4 h-4 mr-2" />
              {submitting ? "Updating…" : "Update Vehicle"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

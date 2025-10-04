"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  createDevice,
  listFleetOperators,
  listVehicles,
  listVehiclesWithoutOBD,
} from "@/lib/api";
import { PaginatedDropdown } from "@/components/paginationDropdown";
import { useToast } from "@/components/ui/use-toast";

export default function AddOBDDevicePage() {
  const { toast } = useToast();

  const router = useRouter();

  // Form state
  const [deviceId, setDeviceId] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [fleetId, setFleetId] = useState<string | undefined>(undefined);
  const [vehicleId, setVehicleId] = useState<string | undefined>(undefined);
  const [firmwareVersion, setFirmwareVersion] = useState("");
  const [reportInterval, setReportInterval] = useState("");
  const [canBaudRate, setCanBaudRate] = useState("");
  const [model, setModel] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Fleet operators state
  const [fleetOperators, setFleetOperators] = useState<
    { id: number; name: string }[]
  >([]);
  const [loadingFleetOperators, setLoadingFleetOperators] = useState(false);

  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load fleet operators on component mount
  useEffect(() => {
    const fetchFleetOperators = async () => {
      try {
        setLoadingFleetOperators(true);
        const resp = await listFleetOperators();
        setFleetOperators(resp.results || resp);
      } catch (error) {
        console.error("Error fetching fleet operators:", error);
      } finally {
        setLoadingFleetOperators(false);
      }
    };
    fetchFleetOperators();
  }, []);

  // Reset vehicle selection when fleet changes
  useEffect(() => {
    if (fleetId) {
      setVehicleId(undefined);
    }
  }, [fleetId]);

  // Create a stable reference to prevent unnecessary re-renders
  const fetchVehiclesForFleet = useCallback(
    async (page: number = 1) => {
      if (!fleetId) {
        return { results: [], hasMore: false };
      }

      try {
        const resp = await listVehiclesWithoutOBD(page, Number(fleetId));
        return resp;
      } catch (error) {
        console.error("Error fetching vehicles for fleet:", error);
        return { results: [], hasMore: false };
      }
    },
    [fleetId]
  ); // Only depend on fleetId

  const onSubmit = async () => {
    setErr("");
    setSubmitting(true);

    const payload = {
      device_id: deviceId,
      serial_number: serialNumber,
      vehicle: vehicleId ? Number(vehicleId) : undefined,
      firmware_version: firmwareVersion,
      report_interval_sec: Number(reportInterval),
      can_baud_rate: Number(canBaudRate),
      model: model,
      is_active: isActive,
    };

    try {
      await createDevice(payload);

      toast({
        title: "Success",
        description: "OBD Device added successfully!",
        variant: "default",
      });

      router.push("/obd-device");
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to add OBD device",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Link href="/obd-device">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Devices
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-center">Add OBD Device</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>OBD Device Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Device ID *</Label>
              <Input
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
              />
            </div>
            <div>
              <Label>Serial Number *</Label>
              <Input
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fleet Operator *</Label>
              <Select
                value={fleetId}
                onValueChange={setFleetId}
                disabled={loadingFleetOperators}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingFleetOperators
                        ? "Loading..."
                        : "Select Fleet Operator"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {fleetOperators.map((fleet) => (
                    <SelectItem key={fleet.id} value={fleet.id.toString()}>
                      {fleet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Firmware Version *</Label>
              <Input
                value={firmwareVersion}
                onChange={(e) => setFirmwareVersion(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              {fleetId ? (
                <PaginatedDropdown
                  label="Vehicle *"
                  value={vehicleId}
                  onChange={setVehicleId}
                  fetchData={fetchVehiclesForFleet}
                  renderItem={(v: any) => ({
                    id: v.id.toString(),
                    label: `${v.vin} (${v.make}: ${v.model})`,
                  })}
                />
              ) : (
                <div>
                  <Label>Vehicle *</Label>
                  <div className="border rounded-md px-3 py-2 bg-gray-50 text-gray-400">
                    Select Fleet Operator first
                  </div>
                </div>
              )}
            </div>
            <div>
              <Label>Report Interval (sec) *</Label>
              <Input
                type="number"
                value={reportInterval}
                onChange={(e) => setReportInterval(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>CAN Baud Rate *</Label>
              <Input
                type="number"
                value={canBaudRate}
                onChange={(e) => setCanBaudRate(e.target.value)}
              />
            </div>
            <div>
              <Label>Model</Label>
              <Input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>
          </div>

          {/* {err && (
            <div className="text-red-500 text-sm">{err}</div>
          )} */}

          <div className="flex justify-end gap-4">
            <Link href="/obd-device">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={onSubmit} disabled={submitting}>
              <Save className="w-4 h-4 mr-2" />
              {submitting ? "Saving…" : "Add Device"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

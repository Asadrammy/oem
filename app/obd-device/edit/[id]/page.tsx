"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
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
  updateDevice,
  listFleetOperators,
  listVehiclesWithoutOBD,
  getOBDDevice,
} from "@/lib/api";
import { PaginatedDropdown } from "@/components/paginationDropdown";
import { useToast } from "@/components/ui/use-toast";
export default function EditOBDDevicePage() {
  const { toast } = useToast();

  const router = useRouter();
  const params = useParams();
  const deviceIdParam = Number(params?.id);

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
  const [loading, setLoading] = useState(true);
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

  // Load device details
  useEffect(() => {
    const fetchDevice = async () => {
      try {
        setLoading(true);
        const data = await getOBDDevice(deviceIdParam);

        setDeviceId(data.device_id || "");
        setSerialNumber(data.serial_number || "");
        setFirmwareVersion(data.firmware_version || "");
        setReportInterval(data.report_interval_sec?.toString() || "");
        setModel(data.model?.toString() || "");
        setCanBaudRate(data.can_baud_rate?.toString() || "");
        setIsActive(Boolean(data.is_active));
        // Set fleet ID if available from vehicle data
        // if (data.vehicle && data.vehicle.fleet_operator) {
        setFleetId(data?.fleet_operator.toString());
        // }
        setVehicleId(data.vehicle ? data.vehicle.id.toString() : undefined);
      } catch (error) {
        console.error("Error fetching device:", error);
        setErr("Failed to load device details");
      } finally {
        setLoading(false);
      }
    };

    if (deviceIdParam) fetchDevice();
  }, [deviceIdParam]);

  // Reset vehicle selection when fleet changes (but not on initial load)
  useEffect(() => {
    // Only reset if we're changing fleet after initial load
    if (fleetId && !loading) {
      setVehicleId(undefined);
    }
  }, [fleetId, loading]);

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
  );

  const onSubmit = async () => {
    setErr("");
    setSubmitting(true);

    const payload = {
      device_id: deviceId,
      serial_number: serialNumber,
      model: model,
      fleet_operator: model, // make sure this is correct
      vehicle: vehicleId ? Number(vehicleId) : undefined,
      firmware_version: firmwareVersion,
      report_interval_sec: Number(reportInterval),
      can_baud_rate: Number(canBaudRate),
      is_active: isActive,
    };

    try {
      await updateDevice(deviceIdParam, payload);

      toast({
        title: "Success",
        description: "OBD Device updated successfully!",
        variant: "default", // green/default for success
      });

      router.push("/obd-device");
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to update OBD device",
        variant: "destructive", // red for error
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        Loading device details...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Link href="/obd-device">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Devices
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-center">Edit OBD Device</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>OBD Device Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* {err && <div className="text-red-600 text-sm">{err}</div>} */}

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

          <div className="flex justify-end gap-4">
            <Link href="/obd-device">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={onSubmit} disabled={submitting}>
              <Save className="w-4 h-4 mr-2" />
              {submitting ? "Saving…" : "Update Device"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

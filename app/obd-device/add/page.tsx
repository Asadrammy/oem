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
  const [isFormValid, setIsFormValid] = useState(false);

  // Validation error states
  const [deviceIdError, setDeviceIdError] = useState("");
  const [serialNumberError, setSerialNumberError] = useState("");
  const [firmwareError, setFirmwareError] = useState("");
  const [reportIntervalError, setReportIntervalError] = useState("");
  const [canBaudError, setCanBaudError] = useState("");

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

  // Validation functions
  const validateDeviceId = (value: string) => {
    if (!value.trim()) {
      setDeviceIdError("Device ID is required");
      return false;
    }
    
    // Device ID should follow pattern: OBD-XXXX or OBD-XXXX-XXX
    const deviceIdPattern = /^OBD-\d{4}(-\w{3})?$/;
    if (!deviceIdPattern.test(value)) {
      setDeviceIdError("Device ID must follow format: OBD-XXXX or OBD-XXXX-XXX (e.g., OBD-6002)");
      return false;
    }
    
    setDeviceIdError("");
    return true;
  };

  const validateSerialNumber = (value: string) => {
    if (!value.trim()) {
      setSerialNumberError("Serial Number is required");
      return false;
    }
    
    // Serial Number should follow pattern: SN-XXXX-XXXX or SN-XXXX-XXX
    const serialPattern = /^SN-\w{4}-\w{3,4}$/;
    if (!serialPattern.test(value)) {
      setSerialNumberError("Serial Number must follow format: SN-XXXX-XXXX (e.g., SN-6002-AX02)");
      return false;
    }
    
    setSerialNumberError("");
    return true;
  };

  const validateFirmwareVersion = (value: string) => {
    if (!value.trim()) {
      setFirmwareError("Firmware Version is required");
      return false;
    }
    
    // Firmware version should follow semantic versioning: X.Y.Z or X.Y
    const firmwarePattern = /^\d+\.\d+(\.\d+)?$/;
    if (!firmwarePattern.test(value)) {
      setFirmwareError("Firmware Version must follow format: X.Y.Z or X.Y (e.g., 1.4.5)");
      return false;
    }
    
    setFirmwareError("");
    return true;
  };

  const validateReportInterval = (value: string) => {
    if (!value.trim()) {
      setReportIntervalError("Report Interval is required");
      return false;
    }
    
    const num = parseInt(value);
    if (isNaN(num) || num < 1) {
      setReportIntervalError("Report Interval must be a positive integer (minimum 1 second)");
      return false;
    }
    
    if (num > 3600) {
      setReportIntervalError("Report Interval cannot exceed 3600 seconds (1 hour)");
      return false;
    }
    
    setReportIntervalError("");
    return true;
  };

  const validateCanBaudRate = (value: string) => {
    if (!value.trim()) {
      setCanBaudError("CAN Baud Rate is required");
      return false;
    }
    
    const num = parseInt(value);
    if (isNaN(num) || num < 1000) {
      setCanBaudError("CAN Baud Rate must be at least 1000 bps");
      return false;
    }
    
    // Common CAN baud rates: 125000, 250000, 500000, 1000000
    const validBaudRates = [125000, 250000, 500000, 1000000];
    if (!validBaudRates.includes(num)) {
      setCanBaudError("CAN Baud Rate must be one of: 125000, 250000, 500000, or 1000000");
      return false;
    }
    
    setCanBaudError("");
    return true;
  };

  // Form validation
  useEffect(() => {
    const valid = deviceId.trim() !== "" && 
                  serialNumber.trim() !== "" && 
                  fleetId !== undefined && 
                  vehicleId !== undefined && 
                  firmwareVersion.trim() !== "" && 
                  reportInterval.trim() !== "" && 
                  canBaudRate.trim() !== "" &&
                  validateDeviceId(deviceId) &&
                  validateSerialNumber(serialNumber) &&
                  validateFirmwareVersion(firmwareVersion) &&
                  validateReportInterval(reportInterval) &&
                  validateCanBaudRate(canBaudRate);
    setIsFormValid(valid);
  }, [deviceId, serialNumber, fleetId, vehicleId, firmwareVersion, reportInterval, canBaudRate]);

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

    // Final validation before submission
    if (!isFormValid) {
      setErr("Please fix all validation errors before submitting");
      setSubmitting(false);
      return;
    }

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
          {err && <div className="text-red-600">{err}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Device ID *</Label>
              <Input
                value={deviceId}
                onChange={(e) => {
                  setDeviceId(e.target.value.toUpperCase());
                  validateDeviceId(e.target.value);
                }}
                className={deviceIdError ? "border-red-500" : ""}
                placeholder="e.g., OBD-6002"
              />
              {deviceIdError && (
                <p className="text-sm text-red-600 mt-1">{deviceIdError}</p>
              )}
            </div>
            <div>
              <Label>Serial Number *</Label>
              <Input
                value={serialNumber}
                onChange={(e) => {
                  setSerialNumber(e.target.value.toUpperCase());
                  validateSerialNumber(e.target.value);
                }}
                className={serialNumberError ? "border-red-500" : ""}
                placeholder="e.g., SN-6002-AX02"
              />
              {serialNumberError && (
                <p className="text-sm text-red-600 mt-1">{serialNumberError}</p>
              )}
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
                onChange={(e) => {
                  setFirmwareVersion(e.target.value);
                  validateFirmwareVersion(e.target.value);
                }}
                className={firmwareError ? "border-red-500" : ""}
                placeholder="e.g., 1.4.5"
              />
              {firmwareError && (
                <p className="text-sm text-red-600 mt-1">{firmwareError}</p>
              )}
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
                min="1"
                max="3600"
                value={reportInterval}
                onChange={(e) => {
                  setReportInterval(e.target.value);
                  validateReportInterval(e.target.value);
                }}
                className={reportIntervalError ? "border-red-500" : ""}
                placeholder="e.g., 90"
              />
              {reportIntervalError && (
                <p className="text-sm text-red-600 mt-1">{reportIntervalError}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>CAN Baud Rate *</Label>
              <Select value={canBaudRate} onValueChange={(value) => {
                setCanBaudRate(value);
                validateCanBaudRate(value);
              }}>
                <SelectTrigger className={canBaudError ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select CAN Baud Rate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="125000">125,000 bps</SelectItem>
                  <SelectItem value="250000">250,000 bps</SelectItem>
                  <SelectItem value="500000">500,000 bps</SelectItem>
                  <SelectItem value="1000000">1,000,000 bps</SelectItem>
                </SelectContent>
              </Select>
              {canBaudError && (
                <p className="text-sm text-red-600 mt-1">{canBaudError}</p>
              )}
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
            <Button onClick={onSubmit} disabled={!isFormValid || submitting}>
              <Save className="w-4 h-4 mr-2" />
              {submitting ? "Saving…" : "Add Device"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

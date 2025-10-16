"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { firmwareUpdatesByID, updateFirmwareUpdates, listVehiclesType } from "@/lib/api";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

type VehicleType = {
  id: number;
  name: string;
};

export default function EditFirmwarePage() {
  const params = useParams();
  const router = useRouter();
  const firmwareId = Number(params?.id);

  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [component, setComponent] = useState("");
  const [version, setVersion] = useState("");
  const [description, setDescription] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [priority, setPriority] = useState("1");
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [selectedVehicleType, setSelectedVehicleType] = useState<number | null>(null);
  const [existingFile, setExistingFile] = useState<string>("");

  const fetchFirmwareData = async () => {
    try {
      const data = await firmwareUpdatesByID(firmwareId);
      setComponent(data.component || "");
      setVersion(data.version || "");
      setDescription(data.description || "");
      setReleaseDate(data.release_date || "");
      setPriority(data.priority?.toString() || "1");
      setSelectedVehicleType(data.vehicle_type || null);
      setExistingFile(data.file || "");
    } catch (err) {
      console.error("Error fetching firmware data:", err);
      setErr("Failed to load firmware data");
    }
  };

  const fetchVehicleTypes = async () => {
    try {
      const data = await listVehiclesType();
      setVehicleTypes(data.results || []);
    } catch (err) {
      console.error("Error fetching vehicle types:", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchFirmwareData(), fetchVehicleTypes()]);
      setLoading(false);
    };
    loadData();
  }, [firmwareId]);

  // Form validation
  useEffect(() => {
    const valid = component.trim() !== "" && 
                  version.trim() !== "" && 
                  description.trim() !== "" && 
                  releaseDate !== "";
    setIsFormValid(valid);
  }, [component, version, description, releaseDate]);

  const onSubmit = async () => {
    setSubmitting(true);
    setErr("");

    try {
      const formData = new FormData();
      formData.append("component", component);
      formData.append("version", version);
      formData.append("description", description);
      formData.append("release_date", releaseDate);
      if (selectedVehicleType !== null) {
        formData.append("vehicle_type", selectedVehicleType.toString());
      }
      formData.append("priority", priority);
      
      // Only append file if a new one is selected
      if (file) {
        formData.append("file", file);
        formData.append("file_size", file.size.toString());
      }

      // Debug logging
      console.log("Firmware update payload:", {
        id: firmwareId,
        component,
        version,
        description,
        release_date: releaseDate,
        vehicle_type: selectedVehicleType,
        priority,
        hasFile: !!file,
        existingFile
      });

      // Log FormData contents
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      await updateFirmwareUpdates(firmwareId, formData);
      alert("Firmware updated successfully!");
      router.push("/firmware-updates");
    } catch (e: any) {
      console.error("Firmware update error:", e);
      console.error("Error details:", {
        status: e.response?.status,
        statusText: e.response?.statusText,
        data: e.response?.data,
        url: e.config?.url
      });
      
      if (e.response?.status === 400) {
        // Handle validation errors
        const errorData = e.response?.data;
        if (typeof errorData === 'object' && errorData !== null) {
          const errorMessages = [];
          for (const [field, message] of Object.entries(errorData)) {
            if (Array.isArray(message)) {
              errorMessages.push(`${field}: ${message.join(', ')}`);
            } else {
              errorMessages.push(`${field}: ${message}`);
            }
          }
          
          // Check for specific status validation error
          const errorText = errorMessages.join('; ');
          if (errorText.includes('status') && errorText.includes('pause/resume')) {
            setErr(`Status updates must be performed via the pause/resume endpoints. Please use the status controls on the firmware list page to change the status.`);
          } else {
            setErr(`Validation Error: ${errorText}`);
          }
        } else {
          setErr(`Bad Request: ${errorData || 'Invalid data provided'}`);
        }
      } else if (e.response?.status === 401) {
        setErr("Authentication failed. Please log in again.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else if (e.response?.status === 403) {
        setErr("Access denied. You don't have permission to update firmware updates.");
      } else if (e.response?.status >= 500) {
        setErr("Server error. Please try again later or contact support.");
      } else {
        setErr(e.message || "Failed to update firmware");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <Link href="/firmware-updates">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Firmware
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-center">Edit Firmware</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Please wait while the form loads...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link href="/firmware-updates">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Firmware
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-center">Edit Firmware</h1>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Firmware Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {err && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              <div className="font-medium">Error:</div>
              <div className="text-sm mt-1">{err}</div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
            <div className="font-medium">Note:</div>
            <div className="text-sm mt-1">
              To change the firmware status (pause/resume), please use the status controls on the firmware list page. 
              This form is for updating firmware details only.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Component *</Label>
              <Input
                value={component}
                onChange={(e) => setComponent(e.target.value)}
              />
            </div>
            <div>
              <Label>Version *</Label>
              <Input
                value={version}
                onChange={(e) => setVersion(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Description *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Release Date *</Label>
              <Input
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 (High)</SelectItem>
                  <SelectItem value="2">2 (Medium)</SelectItem>
                  <SelectItem value="3">3 (Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>File</Label>
            <Input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {existingFile && !file && (
              <p className="text-sm text-gray-500 mt-1">
                Current file: {existingFile.split('/').pop()}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Leave empty to keep current file, or select a new file to replace it.
            </p>
          </div>

          <div>
            <Label>Vehicle Types</Label>
            <Select 
              value={selectedVehicleType?.toString() || "none"} 
              onValueChange={(value) => setSelectedVehicleType(value === "none" ? null : Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {vehicleTypes.map((v) => (
                  <SelectItem key={v.id} value={v.id.toString()}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-4">
            <Link href="/firmware-updates">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={onSubmit} disabled={!isFormValid || submitting}>
              <Save className="w-4 h-4 mr-2" />
              {submitting ? "Saving…" : "Update Firmware"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

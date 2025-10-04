"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createFirmwareUpdates, listVehiclesType } from "@/lib/api";
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

export default function AddFirmwarePage() {
  const router = useRouter();
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [component, setComponent] = useState("obd");
  const [version, setVersion] = useState("");
  const [description, setDescription] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [priority, setPriority] = useState("1");
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [selectedVehicleType, setSelectedVehicleType] = useState<number | null>(
    null
  );

  const fetchVehicleTypes = async () => {
    try {
      const data = await listVehiclesType();
      setVehicleTypes(data.results || []);
    } catch (err) {
      console.error("Error fetching vehicle types:", err);
    }
  };

  useEffect(() => {
    fetchVehicleTypes();
  }, []);

const onSubmit = async () => {
  setSubmitting(true);
  setErr("");

  try {
    if (!file) {
      setErr("Please select a file");
      setSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("component", component);
    formData.append("version", version);
    formData.append("description", description);
    formData.append("release_date", releaseDate);
    if (selectedVehicleType !== null) {
      formData.append("vehicle_type", selectedVehicleType.toString());
    }
    formData.append("priority", priority);
    formData.append("file", file);              // actual file
    formData.append("file_size", file.size.toString());

    await createFirmwareUpdates(formData);      // FormData, not JSON
    router.push("/firmware-updates");
  } catch (e: any) {
    setErr(e.message || "Failed to create firmware");
  } finally {
    setSubmitting(false);
  }
};


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link href="/firmware-updates">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Firmware
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-center ">Add Firmware</h1>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Firmware Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {err && <div className="text-red-600">{err}</div>}

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
              <Label>Priority *</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 (High)</SelectItem>
                  <SelectItem value="2">2 (Medium)</SelectItem>
                  <SelectItem value="3">3 (Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>File *</Label>
              <Input
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const selectedFile = e.target.files[0];
                    setFile(selectedFile);

                    // 👇 Log file data
                    console.log("File selected:",file);
                    console.log("Name:", selectedFile.name);
                    console.log("Type:", selectedFile.type);
                    console.log("Size (bytes):", selectedFile.size);
                  }
                }}
              />
              {file && <p className="text-sm mt-2">Selected: {file.name}</p>}
            </div>

            <div>
              <Label htmlFor="vehicleTypes">Vehicle Types</Label>
              <Select
                value={selectedVehicleType?.toString() || ""}
                onValueChange={(v) => setSelectedVehicleType(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map((v) => (
                    <SelectItem key={v.id} value={v.id.toString()}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link href="/firmware">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={onSubmit} disabled={submitting}>
              <Save className="w-4 h-4 mr-2" />
              {submitting ? "Saving…" : "Add Firmware"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

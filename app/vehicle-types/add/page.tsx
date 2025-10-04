"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createVehicleType } from "@/lib/api";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AddVehicleTypePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [drivetrain, setDrivetrain] = useState("");
  const [batteryCapacity, setBatteryCapacity] = useState("");
  const [motorPower, setMotorPower] = useState("");
  const [wltpRange, setWltpRange] = useState("");
  const [status, setStatus] = useState("active");
  const [description, setDescription] = useState("");

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        code,
        name,
        category,
        drivetrain,
        battery_capacity_kwh: parseFloat(batteryCapacity),
        motor_power_kw: parseFloat(motorPower),
        wltp_range_km: parseFloat(wltpRange),
        status,
        description,
      };

      await createVehicleType(payload);

      toast({
        title: "Success",
        description: "Vehicle Type added successfully!",
      });

      router.push("/vehicle-types");
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to create vehicle type",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Link href="/vehicle-types">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Vehicle Types
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-center">Add Vehicle Type</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Type Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {err && <div className="text-red-600">{err}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Code *</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <div>
              <Label>Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category *</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
            <div>
              <Label>Drivetrain *</Label>
              <Input
                value={drivetrain}
                onChange={(e) => setDrivetrain(e.target.value)}
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
              <Label>Motor Power (kW)</Label>
              <Input
                type="number"
                value={motorPower}
                onChange={(e) => setMotorPower(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>WLTP Range (km)</Label>
              <Input
                type="number"
                value={wltpRange}
                onChange={(e) => setWltpRange(e.target.value)}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Input
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Link href="/vehicle-types">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={onSubmit} disabled={submitting}>
              <Save className="w-4 h-4 mr-2" />
              {submitting ? "Saving…" : "Add Vehicle Type"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

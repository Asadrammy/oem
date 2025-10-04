"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createFleetOperator } from "@/lib/api";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
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
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
export default function AddFleetOperatorPage() {
  const { toast } = useToast();

  const router = useRouter();
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [maxVehicles, setMaxVehicles] = useState("");
  const [subscriptionTier, setSubscriptionTier] = useState("basic");

  const [timezone, setTimezone] = useState("");
  const [currency, setCurrency] = useState("");
  const [unitSystem, setUnitSystem] = useState("");
  const [language, setLanguage] = useState("");
  const [dateFormat, setDateFormat] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#000000"); // default 6-digit hex

  // Settings
  const [alertEmail, setAlertEmail] = useState("");
  const [maintenanceSchedule, setMaintenanceSchedule] = useState("");
  const [geofenceRadius, setGeofenceRadius] = useState("");

  // Helper: normalize hex input to start with #
  const handleHexInputChange = (value: string) => {
    let v = value.trim();
    if (v === "") {
      setPrimaryColor("");
      return;
    }
    if (!v.startsWith("#")) v = "#" + v;
    setPrimaryColor(v);
  };

  const onSubmit = async () => {
    setSubmitting(true);
    setErr("");

    try {
      const payload = {
        name: name.trim(),
        code: code.trim(),
        contact: contactPhone.trim(),
        contact_email: contactEmail.trim(),
        address: address.trim(),
        metadata: {
          alert_email: alertEmail.trim(),
          maintenance_schedule: maintenanceSchedule,
          geofence_radius_meters: Number(geofenceRadius) || 0,
          subscription_tier: subscriptionTier,
          max_vehicles: Number(maxVehicles) || 0,
        },
        timezone,
        currency,
        unit_system: unitSystem,
        language,
        date_format: dateFormat,
        primary_color: primaryColor || "#000000",
      };

      console.log("Payload to API:", payload);

      await createFleetOperator(payload);

      // ✅ Success toast
      toast({
        title: "Fleet Operator Created",
        description: `"${name}" has been successfully added.`,
        variant: "default", // or "destructive" for error
      });

      router.push("/fleet-operators");
    } catch (e: any) {
      console.error("Submission error:", e);
      setErr(e?.message || "Failed to create fleet operator");

      // ❌ Failure toast
      toast({
        title: "Creation Failed",
        description: e?.message || "Unable to create fleet operator.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Link href="/fleet-operators">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Fleet Operators
          </Button>
        </Link>

        <h1 className="text-2xl font-bold text-center ">Add Fleet Operator</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fleet Operator Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information - 2 fields per row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Zenfleet Solutions"
                required
              />
            </div>
            <div>
              <Label>Code *</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g., ZENFLEET-002"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Address *</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., 45 Fleet Street, London, UK"
                required
              />
            </div>
            <div>
              <Label>Contact Email *</Label>
              <Input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="support@company.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Contact Phone *</Label>
              <Input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91-98765-43210"
                required
              />
            </div>

            {/* PRIMARY COLOR: native color picker + hex input (same row) */}
            <div>
              <Label>Primary Color</Label>
              <div className="flex items-center gap-3">
                {/* native color input for reliable color picking */}
                <input
                  aria-label="Primary color picker"
                  type="color"
                  value={primaryColor || "#000000"}
                  onChange={(e) => {
                    setPrimaryColor(e.target.value);
                  }}
                  className="h-10 w-12 rounded border"
                />

                {/* hex text input using same styled Input component */}
                <Input
                  value={primaryColor}
                  onChange={(e) => {
                    handleHexInputChange(e.target.value);
                  }}
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>

          {/* Config + metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Max Vehicles</Label>
              <Input
                type="number"
                value={maxVehicles}
                onChange={(e) => setMaxVehicles(e.target.value)}
                placeholder="200"
              />
            </div>
            <div>
              <Label>Subscription Tier</Label>
              <Select
                value={subscriptionTier}
                onValueChange={setSubscriptionTier}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Alert + Maintenance */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Alert Email</Label>
              <Input
                type="email"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                placeholder="alerts@company.com"
              />
            </div>
            <div>
              <Label>Maintenance Schedule</Label>
              <Select
                value={maintenanceSchedule}
                onValueChange={setMaintenanceSchedule}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select schedule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="bi-monthly">Bi-monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Geofence Radius (meters)</Label>
            <Input
              type="number"
              value={geofenceRadius}
              onChange={(e) => setGeofenceRadius(e.target.value)}
              placeholder="150"
            />
          </div>

          {/* Extra Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Timezone</Label>
              <Input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="e.g., Asia/Kolkata"
              />
            </div>
            <div>
              <Label>Currency</Label>
              <Input
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="e.g., INR"
              />
            </div>
            <div>
              <Label>Unit System</Label>
              <Select value={unitSystem} onValueChange={setUnitSystem}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Unit System" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric</SelectItem>
                  <SelectItem value="imperial">Imperial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Language</Label>
              <Input
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="e.g., en"
              />
            </div>
            <div>
              <Label>Date Format</Label>
              <Input
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                placeholder="e.g., DD-MM-YYYY"
              />
            </div>
            <div />
          </div>

          <div className="flex justify-end gap-4">
            <Link href="/fleet-operators">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button
              onClick={onSubmit}
              disabled={
                submitting ||
                !name ||
                !code ||
                !address ||
                !contactEmail ||
                !contactPhone
              }
            >
              <Save className="w-4 h-4 mr-2" />
              {submitting ? "Saving…" : "Add Fleet Operator"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

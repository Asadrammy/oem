"use client";
import { useState, useEffect } from "react";
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
  const [isFormValid, setIsFormValid] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [timezone, setTimezone] = useState("");
  const [currency, setCurrency] = useState("");
  const [unitSystem, setUnitSystem] = useState("");
  const [language, setLanguage] = useState("");
  const [dateFormat, setDateFormat] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#000000"); // default 6-digit hex

  // Dynamic metadata
  const [metadataPairs, setMetadataPairs] = useState<Array<{key: string, value: string}>>([]);

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

  // Metadata management functions
  const addMetadataPair = () => {
    setMetadataPairs([...metadataPairs, { key: "", value: "" }]);
  };

  const removeMetadataPair = (index: number) => {
    setMetadataPairs(metadataPairs.filter((_, i) => i !== index));
  };

  const updateMetadataPair = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...metadataPairs];
    updated[index][field] = value;
    setMetadataPairs(updated);
  };

  // Form validation
  useEffect(() => {
    const valid = name.trim() !== "" && 
                  code.trim() !== "" && 
                  contactPhone.trim() !== "" && 
                  contactEmail.trim() !== "" && 
                  address.trim() !== "";
    setIsFormValid(valid);
  }, [name, code, contactPhone, contactEmail, address]);

  const onSubmit = async () => {
    setSubmitting(true);
    setErr("");

    try {
      // Convert metadata pairs to object
      const metadata: Record<string, any> = {};
      metadataPairs.forEach(pair => {
        if (pair.key.trim()) {
          metadata[pair.key.trim()] = pair.value.trim();
        }
      });

      const payload = {
        name: name.trim(),
        code: code.trim(),
        contact: contactPhone.trim(),
        contact_email: contactEmail.trim(),
        address: address.trim(),
        timezone: timezone || "Asia/Kolkata",
        currency: currency || "INR",
        unit_system: unitSystem || "metric",
        language: language || "en",
        date_format: dateFormat || "DD-MM-YYYY",
        primary_color: primaryColor || "#000000",
        is_active: true,
        metadata,
      };

      console.log("JSON payload to API:", payload);

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

          {/* Advanced Metadata Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Advanced Metadata</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMetadataPair}
              >
                + Add Attribute
              </Button>
            </div>
            
            {metadataPairs.length > 0 && (
              <div className="space-y-3">
                {metadataPairs.map((pair, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <Input
                        placeholder="Key (e.g., billing_reference)"
                        value={pair.key}
                        onChange={(e) => updateMetadataPair(index, 'key', e.target.value)}
                      />
                    </div>
                    <div className="col-span-5">
                      <Input
                        placeholder="Value (e.g., ACME-2024)"
                        value={pair.value}
                        onChange={(e) => updateMetadataPair(index, 'value', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMetadataPair(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                <p className="text-sm text-gray-500">
                  Hint: Values are stored as JSON when you save.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Link href="/fleet-operators">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button
              onClick={onSubmit}
              disabled={!isFormValid || submitting}
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

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, X } from "lucide-react";
import { getFleetOperatorById, updateFleetOperator } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export default function EditFleetOperatorPage() {
  const { toast } = useToast();

  const router = useRouter();
  const params = useParams();
  const id = params?.id ? Number(params.id) : null;

  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state - Basic Information
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Configuration Settings
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [currency, setCurrency] = useState("INR");
  const [unitSystem, setUnitSystem] = useState("metric");
  const [language, setLanguage] = useState("en");
  const [dateFormat, setDateFormat] = useState("DD-MM-YYYY");
  const [primaryColor, setPrimaryColor] = useState("#6366F1");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [existingLogoUrl, setExistingLogoUrl] = useState<string>("");

  // Dynamic metadata
  const [metadataPairs, setMetadataPairs] = useState<Array<{key: string, value: string}>>([]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      // File validation
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];

      if (file.size > maxSize) {
        setErr("File size must be less than 5MB");
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        setErr("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
        return;
      }

      setErr("");
      setLogoFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected file
  const removeFile = () => {
    setLogoFile(null);
    setLogoPreview("");
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
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

  // Fetch operator data
  useEffect(() => {
    if (id) {
      getFleetOperatorById(id)
        .then((data) => {
          // Basic Information
          setName(data.name || "");
          setCode(data.code || "");
          setAddress(data.address || "");
          setContactEmail(data.contact_email || "");
          setContactPhone(data.contact || "");
          setIsActive(data.is_active ?? true);

          // Configuration
          setTimezone(data.timezone || "Asia/Kolkata");
          setCurrency(data.currency || "INR");
          setUnitSystem(data.unit_system || "metric");
          setLanguage(data.language || "en");
          setDateFormat(data.date_format || "DD-MM-YYYY");
          setPrimaryColor(data.primary_color || "#6366F1");

          // Logo
          if (data.logo) {
            setExistingLogoUrl(data.logo);
          }

          // Metadata - convert to key-value pairs
          if (data.metadata) {
            const pairs = Object.entries(data.metadata).map(([key, value]) => ({
              key,
              value: String(value || "")
            }));
            setMetadataPairs(pairs);
          }
        })
        .catch(() => setErr("Failed to load fleet operator"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const onSubmit = async () => {
    if (!id) return;
    setSubmitting(true);
    setErr("");

    try {
      const formData = new FormData();

      // Add basic fields
      formData.append("name", name.trim());
      formData.append("code", code.trim());
      formData.append("contact", contactPhone.trim());
      formData.append("contact_email", contactEmail.trim());
      formData.append("address", address.trim());
      formData.append("timezone", timezone);
      formData.append("currency", currency);
      formData.append("unit_system", unitSystem);
      formData.append("language", language);
      formData.append("date_format", dateFormat);
      formData.append("primary_color", primaryColor);
      formData.append("is_active", isActive.toString());

      // Convert metadata pairs to object
      const metadata: Record<string, any> = {};
      metadataPairs.forEach(pair => {
        if (pair.key.trim()) {
          metadata[pair.key.trim()] = pair.value.trim();
        }
      });
      formData.append("metadata", JSON.stringify(metadata));

      // Add file if selected
      if (logoFile) {
        formData.append("logo", logoFile, logoFile.name);
      }

      await updateFleetOperator(id, formData);

      // ✅ Success toast
      toast({
        title: "Fleet Operator Updated",
        description: `"${name}" has been updated successfully.`,
        variant: "default", // green/default for success
      });

      router.push("/fleet-operators");
    } catch (e: any) {
      const message = e?.message || "Failed to update fleet operator";
      setErr(message);

      // ❌ Error toast
      toast({
        title: "Update Failed",
        description: message,
        variant: "destructive", // red for error
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-4">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col  gap-4">
        <Link href="/fleet-operators">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Fleet Operators
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Edit Fleet Operator</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fleet Operator Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>

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

            <div>
              <Label>Address *</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., 45 Fleet Street, London, UK"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <Label>Contact Phone *</Label>
                <Input
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91-98765-43210"
                  required
                />
              </div>
            </div>

            {/* File Upload for Logo */}
            <div>
              <Label>Logo (optional)</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  {logoFile && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeFile}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Show existing logo or new preview */}
                {(logoPreview || existingLogoUrl) && (
                  <div className="mt-2">
                    <img
                      src={logoPreview || existingLogoUrl}
                      alt="Logo preview"
                      className="w-32 h-32 object-contain border rounded-lg"
                    />
                    {!logoPreview && existingLogoUrl && (
                      <p className="text-xs text-gray-500 mt-1">Current logo</p>
                    )}
                  </div>
                )}

                {logoFile && (
                  <div className="text-sm text-gray-600">
                    Selected: {logoFile.name} (
                    {(logoFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(Boolean(checked))}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>

          {/* Configuration Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configuration</h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                    <SelectItem value="Europe/London">Europe/London</SelectItem>
                    <SelectItem value="America/New_York">
                      America/New_York
                    </SelectItem>
                    <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                    <SelectItem value="Australia/Sydney">
                      Australia/Sydney
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="JPY">JPY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Unit System</Label>
                <Select value={unitSystem} onValueChange={setUnitSystem}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metric">Metric</SelectItem>
                    <SelectItem value="imperial">Imperial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date Format</Label>
                <Select value={dateFormat} onValueChange={setDateFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                    <SelectItem value="MM-DD-YYYY">MM-DD-YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Primary Color</Label>
                <Input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
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
              {submitting ? "Saving…" : "Update Fleet Operator"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

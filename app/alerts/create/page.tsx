"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { createAlertRules, listVehiclesType } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface Condition {
  field: string;
  operator: string;
  threshold: string;
}

type VehicleType = {
  id: number;
  name: string;
};

export default function CreateWarningPage() {
const { toast } = useToast();
  const router = useRouter();
  const [ruleName, setRuleName] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("");
  const [system, setSystem] = useState("");
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [selectedVehicleType, setSelectedVehicleType] = useState<number | null>(
    null
  );

  const [conditionLogic, setConditionLogic] = useState("AND");
  const [triggerDuration, setTriggerDuration] = useState<number>(0);
  const [cooldown, setCooldown] = useState<number>(0);
  const [notificationChannels, setNotificationChannels] = useState<string[]>(
    []
  );
  const [recipients, setRecipients] = useState("");
  const [autoResolve, setAutoResolve] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [conditions, setConditions] = useState<Condition[]>([
    { field: "", operator: "", threshold: "" },
  ]);

  // Fetch vehicle types from API
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

  const handleAddCondition = () => {
    setConditions([...conditions, { field: "", operator: "", threshold: "" }]);
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleConditionChange = (
    index: number,
    key: keyof Condition,
    value: string
  ) => {
    const updated = [...conditions];
    updated[index][key] = value;
    setConditions(updated);
  };

  const handleSubmit = async () => {
    try {
      if (!selectedVehicleType) {
        toast({
          title: "Vehicle type required",
          description: "Select a vehicle type before creating a rule.",
          variant: "destructive",
        });
        return;
      }

      const payload = {
        name: ruleName,
        description,
        severity,
        system,
        is_active: isActive,
        condition_logic: conditionLogic,
        trigger_duration_sec: triggerDuration,
        cooldown_minutes: cooldown,
        auto_resolve: autoResolve,
        notification_channels: notificationChannels,
        recipients: recipients.split(",").map((r) => r.trim()),
        vehicle_types: [selectedVehicleType],
        conditions: conditions.map((c) => ({
          field: c.field,
          operator: c.operator,
          threshold: c.threshold,
        })),
      };

      await createAlertRules(payload);
      toast({
        title: "Rule created",
        description: ruleName
          ? `“${ruleName}” was created successfully.`
          : "Alert rule created successfully.",
      });

      router.push("/alerts"); // 👈 success नंतर redirect
    } catch (error: any) {
      toast({
        title: "Failed to create rule",
        description:
          error?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col gap-4">
        <Link href="/alerts">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Alert Rule Page
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-center text-gray-900">
            Create Alert Rule
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Warning Rule Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ruleName">Rule Name</Label>
              <Input
                id="ruleName"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                placeholder="e.g., Battery Temperature Critical"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe when this warning should trigger..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="severity">Severity Level</Label>
                <Select onValueChange={(v) => setSeverity(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* <div>
                <Label htmlFor="system">System </Label>
                <Select onValueChange={(v) => setSystem(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select system" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="battery">Battery Management</SelectItem>
                    <SelectItem value="motor">Motor Control</SelectItem>
                    <SelectItem value="charging">Charging System</SelectItem>
                    <SelectItem value="tpms">TPMS</SelectItem>
                    <SelectItem value="thermal">Thermal Management</SelectItem>
                    <SelectItem value="safety">Safety Systems</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}
              <div>
                <Label htmlFor="system">System</Label>
                <Input
                  id="system"
                  value={system}
                  onChange={(e) => setSystem(e.target.value)}
                  placeholder="Enter system name (e.g., Battery Management)"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="vehicleTypes">Apply to Vehicle Types</Label>
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
          </CardContent>
        </Card>

        {/* Conditions */}
        <Card>
          <CardHeader>
            <CardTitle>Warning Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {conditions.map((c, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Condition {i + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCondition(i)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Field"
                    value={c.field}
                    onChange={(e) =>
                      handleConditionChange(i, "field", e.target.value)
                    }
                  />
                  <Select
                    value={c.operator}
                    onValueChange={(v) =>
                      handleConditionChange(i, "operator", v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=">">Greater than</SelectItem>
                      <SelectItem value="<">Less than</SelectItem>
                      <SelectItem value="=">Equal to</SelectItem>
                      <SelectItem value=">=">Greater than or equal</SelectItem>
                      <SelectItem value="<=">Less than or equal</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Value"
                    value={c.threshold}
                    onChange={(e) =>
                      handleConditionChange(i, "threshold", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleAddCondition}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Condition
            </Button>

            <div>
              <Label htmlFor="logic">Condition Logic</Label>
              <Select
                value={conditionLogic}
                onValueChange={(v) => setConditionLogic(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select logic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AND">
                    All conditions must be true (AND)
                  </SelectItem>
                  <SelectItem value="OR">
                    Any condition can be true (OR)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration">Trigger Duration (seconds)</Label>
              <Input
                type="number"
                value={triggerDuration}
                onChange={(e) => setTriggerDuration(Number(e.target.value))}
                placeholder="30"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Alert Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="notification">Notification Method</Label>
                <Input
                  id="notification"
                  placeholder="Enter notification method"
                  value={notificationChannels[0] || ""} // assuming it's an array
                  onChange={(e) => setNotificationChannels([e.target.value])}
                />
              </div>
              <div>
                <Label htmlFor="cooldown">Cooldown Period (minutes)</Label>
                <Input
                  type="number"
                  value={cooldown}
                  onChange={(e) => setCooldown(Number(e.target.value))}
                  placeholder="60"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="recipients">Alert Recipients</Label>
              <Input
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder="admin@example.com, +1234567890"
              />
            </div>

            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={autoResolve}
                onChange={(e) => setAutoResolve(e.target.checked)}
                className="rounded"
              />
              <Label>Auto-resolve when conditions are no longer met</Label>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded"
              />
              <Label>Enable this warning rule</Label>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Link href="/alerts">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button onClick={handleSubmit} className="bg-black" type="button">
                <Save className="w-4 h-4 mr-2" />
                Create Warning Rule
              </Button>
              <Button onClick={() => toast({ title: "Test toast" })}>Test Toast</Button>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

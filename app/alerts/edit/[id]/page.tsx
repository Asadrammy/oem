"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import {
  getAlertRuleById,
  updateAlertRules,
  listVehiclesType,
} from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface Condition {
  field: string;
  operator: string;
  threshold: string;
}

type VehicleType = { id: number; name: string };

export default function EditAlertRulePage() {
  const { toast } = useToast();

  const router = useRouter();
  const params = useParams(); // next/navigation hook
  const ruleId = params.id ? Number(params.id) : null;

  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [ruleName, setRuleName] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("");
  const [system, setSystem] = useState("");
  const [selectedVehicleType, setSelectedVehicleType] = useState<number | null>(
    null
  );
  const [conditions, setConditions] = useState<Condition[]>([
    { field: "", operator: "", threshold: "" },
  ]);
  const [conditionLogic, setConditionLogic] = useState("AND");
  const [triggerDuration, setTriggerDuration] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [notificationChannels, setNotificationChannels] = useState<string[]>(
    []
  );
  const [recipients, setRecipients] = useState("");
  const [autoResolve, setAutoResolve] = useState(true);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      const data = await listVehiclesType();
      setVehicleTypes(data.results);
    };
    fetchVehicles();

    const fetchRule = async () => {
      if (!ruleId) return;
      const rule = await getAlertRuleById(ruleId);
      setRuleName(rule.name);
      setDescription(rule.description);
      setSeverity(rule.severity);
      setSystem(rule.system);
      setSelectedVehicleType(rule.vehicle_types[0] || null);
      setConditions(
        rule.conditions.map((c: any) => ({
          field: c.field,
          operator: c.operator,
          threshold: String(c.threshold),
        }))
      );
      setConditionLogic(rule.condition_logic);
      setTriggerDuration(rule.trigger_duration_sec);
      setCooldown(rule.cooldown_minutes);
      setNotificationChannels(rule.notification_channels);
      setRecipients(rule.recipients.join(", "));
      setAutoResolve(rule.auto_resolve);
      setIsActive(rule.is_active);
    };
    fetchRule();
  }, [ruleId]);

  const handleConditionChange = (
    index: number,
    key: keyof Condition,
    value: string
  ) => {
    const updated = [...conditions];
    updated[index][key] = value;
    setConditions(updated);
  };

  const handleAddCondition = () =>
    setConditions([...conditions, { field: "", operator: "", threshold: "" }]);
  const handleRemoveCondition = (index: number) =>
    setConditions(conditions.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!selectedVehicleType) {
      toast({
        title: "select Vehicle  type",
      });
      return;
    }
    if (ruleId === null) {
      toast({
        title: "Invalid rule id",
      });
      return; // exit early if ruleId is null
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
      conditions,
    };

    try {
      await updateAlertRules(ruleId, payload);
      toast({
        title: "Alet Rule Updated successfully ",
      });
      router.push("/alerts");
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to Updated rule",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Link href="/alerts">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Alert Rule Page
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-center">Edit Alert Rule</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rule Details */}
        <Card>
          <CardHeader>
            <CardTitle>Rule Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Rule Name</Label>
              <Input
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Severity</Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>System</Label>
                <Input
                  value={system}
                  onChange={(e) => setSystem(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>Vehicle Type</Label>
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
            <CardTitle>Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {conditions.map((c, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex justify-between mb-3">
                  <span>Condition {i + 1}</span>
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
                      <SelectItem value="=">Equal</SelectItem>
                      <SelectItem value=">=">Greater or equal</SelectItem>
                      <SelectItem value="<=">Less or equal</SelectItem>
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
              <Plus className="w-4 h-4 mr-2" /> Add Condition
            </Button>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Notification</Label>
                <Select
                  value={notificationChannels[0] || ""}
                  onValueChange={(v) => setNotificationChannels([v])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cooldown (minutes)</Label>
                <Input
                  type="number"
                  value={cooldown}
                  onChange={(e) => setCooldown(Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <Label>Recipients</Label>
              <Input
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={autoResolve}
                onChange={(e) => setAutoResolve(e.target.checked)}
              />
              <Label>Auto-resolve</Label>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <Label>Enable alert</Label>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Link href="/alerts">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleSubmit}
              >
                <Save className="w-4 h-4 mr-2" /> Update Alert Rule
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

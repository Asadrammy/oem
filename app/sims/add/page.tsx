"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSIM, listDevices } from "@/lib/api";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";

export default function AddSIMCardPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  // Form state
  const [simId, setSimId] = useState("");
  const [iccid, setIccid] = useState("");
  const [status, setStatus] = useState("active");
  const [planName, setPlanName] = useState("");
  const [planDataLimit, setPlanDataLimit] = useState("");
  const [planCost, setPlanCost] = useState("");
  const [currentDataUsed, setCurrentDataUsed] = useState("0");
  const [currentCycleStart, setCurrentCycleStart] = useState("");
  const [signal, setSignal] = useState("");
  const [devices, setDevices] = useState<{ id: number; device_id: string }[]>(
    []
  );
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string>("");

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoadingDevices(true);
        const resp = await listDevices(); // 👈 call your API
        setDevices(resp.results); // assuming { results: [...] }
      } catch (error) {
        console.error("Error fetching devices:", error);
      } finally {
        setLoadingDevices(false);
      }
    };

    fetchDevices();
  }, []);

  const onSubmit = async () => {
    // Validation
    if (!simId || !iccid || !selectedDevice) {
      setErr("Please fill in all required fields (SIM ID, ICCID, Device)");
      return;
    }

    setSubmitting(true);
    setErr("");
    try {
      const payload = {
        sim_id: simId,
        iccid,
        status,
        plan_name: planName,
        plan_data_limit_gb: Number(planDataLimit) || 0,
        plan_cost: Number(planCost) || 0,
        current_data_used_gb: Number(currentDataUsed) || 0,
        current_cycle_start: currentCycleStart,
        signal_strength: signal,
        device: Number(selectedDevice), // 👈 Using selectedDevice here
      };

      console.log("Payload being sent:", payload); // For debugging

      await createSIM(payload);
      alert("Sim Card Added Successfully")
      router.push("/sims");
    } catch (e: any) {
      setErr(e.message || "Failed to create SIM card");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Link href="/sims">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to SIM Cards
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-center">Add SIM Card</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SIM Card Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {err && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {err}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="simId">SIM ID *</Label>
              <Input
                id="simId"
                value={simId}
                onChange={(e) => setSimId(e.target.value)}
                placeholder="Enter SIM ID"
              />
            </div>
            <div>
              <Label htmlFor="iccid">ICCID *</Label>
              <Input
                id="iccid"
                value={iccid}
                onChange={(e) => setIccid(e.target.value)}
                placeholder="Enter ICCID"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="planName">Plan Name</Label>
              <Input
                id="planName"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Enter plan name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="planDataLimit">Data Limit (GB)</Label>
              <Input
                id="planDataLimit"
                type="number"
                min="0"
                value={planDataLimit}
                onChange={(e) => setPlanDataLimit(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="planCost">Plan Cost</Label>
              <Input
                id="planCost"
                type="number"
                min="0"
                step="0.01"
                value={planCost}
                onChange={(e) => setPlanCost(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentDataUsed">Current Data Used (GB)</Label>
              <Input
                id="currentDataUsed"
                type="number"
                min="0"
                value={currentDataUsed}
                onChange={(e) => setCurrentDataUsed(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="currentCycleStart">Current Cycle Start</Label>
              <Input
                id="currentCycleStart"
                type="date"
                value={currentCycleStart}
                onChange={(e) => setCurrentCycleStart(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Device *</Label>
              <Select 
                value={selectedDevice} 
                onValueChange={setSelectedDevice}
                disabled={loadingDevices}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingDevices ? "Loading devices..." : "Select device"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {devices.length === 0 && !loadingDevices && (
                    <SelectItem value="" disabled>
                      No devices available
                    </SelectItem>
                  )}
                  {devices.map((d) => (
                    <SelectItem key={d.id} value={d.id.toString()}>
                      {d.device_id} (ID: {d.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="signal">Signal Strength</Label>
              <Select value={signal} onValueChange={setSignal}>
                <SelectTrigger>
                  <SelectValue placeholder="Select signal strength" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Link href="/sims">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button 
              onClick={onSubmit} 
              disabled={submitting || !simId || !iccid || !selectedDevice}
            >
              <Save className="w-4 h-4 mr-2" />
              {submitting ? "Saving…" : "Add SIM Card"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

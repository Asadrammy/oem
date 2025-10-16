"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSIM, listDevices } from "@/lib/api";
import api from "@/lib/api"; // For debugging API URL
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
  const [isFormValid, setIsFormValid] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Form state
  const [simId, setSimId] = useState("");
  const [iccid, setIccid] = useState("");
  const [status, setStatus] = useState("active");
  const [planName, setPlanName] = useState("");
  const [planDataLimit, setPlanDataLimit] = useState("");
  const [planCost, setPlanCost] = useState("");
  const [currentDataUsed, setCurrentDataUsed] = useState("0");
  const [currentCycleStart, setCurrentCycleStart] = useState<string>("");
  const [signal, setSignal] = useState("");
  const [devices, setDevices] = useState<{ id: number; device_id: string }[]>(
    []
  );
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string>("");

  // Set mounted flag to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoadingDevices(true);
        const resp = await listDevices(); // 👈 call your API
        setDevices(resp.results || resp || []); // Handle different response formats
      } catch (error: any) {
        console.error("Error fetching devices:", error);
        // If it's a 403 error, show a warning but don't break the form
        if (error.response?.status === 403) {
          console.warn("⚠️ Access denied to OBD devices. SIM can be created without device association.");
          setDevices([]); // Set empty array so form can still work
        } else {
          // For other errors, still set empty array
          setDevices([]);
        }
      } finally {
        setLoadingDevices(false);
      }
    };

    fetchDevices();
  }, []);

  // Form validation
  useEffect(() => {
    const valid = simId.trim() !== "" && 
                  iccid.trim() !== "";
                  // Note: selectedDevice is optional since devices might not be accessible
    setIsFormValid(valid);
  }, [simId, iccid]);

  const onSubmit = async () => {
    // Validation - Device is optional if not accessible
    if (!simId || !iccid) {
      setErr("Please fill in all required fields (SIM ID, ICCID)");
      return;
    }

    // Check if user has valid authentication
    const userStr = localStorage.getItem("user");
    let hasValidToken = false;
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        hasValidToken = !!user?.token;
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
      }
    }
    
    if (!hasValidToken) {
      const accessToken = localStorage.getItem("access_token");
      hasValidToken = !!accessToken;
    }
    
    if (!hasValidToken) {
      setErr("Your session has expired. Please log in again.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
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
        // Only include device if one is selected and it's not the "no-devices" placeholder
        ...(selectedDevice && selectedDevice !== "no-devices" && { device: Number(selectedDevice) }),
      };

      console.log("Payload being sent:", payload); // For debugging
      console.log("API Base URL:", api.defaults.baseURL); // Debug API URL

      const result = await createSIM(payload);
      console.log("SIM creation result:", result); // Debug result

      alert("Sim Card Added Successfully");
      router.push("/sims");
    } catch (e: any) {
      console.error("SIM creation error:", e);
      console.error("Error details:", {
        status: e.response?.status,
        statusText: e.response?.statusText,
        data: e.response?.data,
        url: e.config?.url
      });
      
      // Handle specific error cases
      if (e.response?.status === 401) {
        const errorData = e.response?.data;
        if (errorData?.code === "token_not_valid" || errorData?.detail?.includes("token")) {
          setErr("Your session has expired. Please log in again.");
          // Optionally redirect to login after a delay
          setTimeout(() => {
            window.location.href = "/login";
          }, 3000);
        } else {
          setErr("Authentication failed. Please log in again.");
        }
      } else if (e.response?.status === 403) {
        setErr("Access denied. You don't have permission to create SIM cards.");
      } else if (e.response?.status === 400) {
        const errorData = e.response?.data;
        if (errorData?.detail) {
          setErr(`Validation error: ${errorData.detail}`);
        } else {
          setErr("Invalid data provided. Please check your input.");
        }
      } else if (e.response?.status >= 500) {
        setErr("Server error. Please try again later or contact support.");
      } else {
        setErr(e.message || "Failed to create SIM card. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state until component is mounted to prevent hydration issues
  if (!mounted) {
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
              <div className="font-medium">Error:</div>
              <div className="text-sm mt-1">{err}</div>
              <div className="text-xs mt-2 text-red-500">
                Check the browser console for more details.
              </div>
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
              {mounted ? (
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
              ) : (
                <Input
                  value="Active"
                  readOnly
                />
              )}
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
              {mounted ? (
              <Input
                id="currentCycleStart"
                type="date"
                value={currentCycleStart}
                onChange={(e) => setCurrentCycleStart(e.target.value)}
              />
              ) : (
                <Input
                  id="currentCycleStart"
                  type="text"
                  value=""
                  placeholder="Select date"
                  readOnly
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Device (Optional)</Label>
              {mounted ? (
              <Select 
                value={selectedDevice} 
                onValueChange={setSelectedDevice}
                disabled={loadingDevices}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                        loadingDevices ? "Loading devices..." : "Select device (optional)"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {devices.length === 0 && !loadingDevices && (
                      <SelectItem value="no-devices" disabled>
                        No devices available (Optional)
                    </SelectItem>
                  )}
                  {devices.map((d) => (
                    <SelectItem key={d.id} value={d.id.toString()}>
                      {d.device_id} (ID: {d.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              ) : (
                <Input
                  placeholder="Select device (optional)"
                  readOnly
                />
              )}
              {mounted && devices.length === 0 && !loadingDevices && (
                <p className="text-sm text-gray-500 mt-1">
                  Device association is optional. You can create a SIM card without linking it to a device.
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="signal">Signal Strength</Label>
              {mounted ? (
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
              ) : (
                <Input
                  placeholder="Select signal strength"
                  readOnly
                />
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <div className="text-xs text-gray-500">
              API URL: {api.defaults.baseURL}
            </div>
            <div className="flex gap-4">
            <Link href="/sims">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button 
              onClick={onSubmit} 
              disabled={!isFormValid || submitting}
            >
              <Save className="w-4 h-4 mr-2" />
              {submitting ? "Saving…" : "Add SIM Card"}
            </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { updateSIMCard, getSIMCard, listDevices } from "@/lib/api";
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
import { ArrowLeft, Save, RefreshCw } from "lucide-react";

export default function EditSIMCardPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);

  // Form state
  const [simId, setSimId] = useState("");
  const [iccid, setIccid] = useState("");
  const [status, setStatus] = useState("active");
  const [planName, setPlanName] = useState("");
  const [planDataLimit, setPlanDataLimit] = useState("");
  const [planCost, setPlanCost] = useState("");
  const [currentDataUsed, setCurrentDataUsed] = useState("0");
  const [currentCycleStart, setCurrentCycleStart] = useState<string>("");
  const [overageThreshold, setOverageThreshold] = useState("0.85");
  const [signal, setSignal] = useState("");
  const [devices, setDevices] = useState<{ id: number; device_id: string }[]>(
    []
  );
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string>("");

  // Fetch SIM card data
  useEffect(() => {
    const fetchSIMData = async () => {
      if (!id) {
        console.error("No SIM card ID provided");
        setErr("Invalid SIM card ID");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setErr("");
      
      try {
        console.log("Fetching SIM card data for ID:", id);
        const data = await getSIMCard(id);
        console.log("SIM card data received:", data);
        
        // Format date for input[type="date"] - expects YYYY-MM-DD
        let formattedDate = "";
        if (data.current_cycle_start) {
          try {
            // Handle both "YYYY-MM-DD" and "YYYY-MM-DDTHH:mm:ss" formats
            const dateStr = data.current_cycle_start.split('T')[0];
            formattedDate = dateStr;
          } catch (e) {
            console.warn("Could not format date:", data.current_cycle_start);
            formattedDate = data.current_cycle_start;
          }
        }
        
        // Populate form with existing data
        setSimId(data.sim_id || "");
        setIccid(data.iccid || "");
        setStatus(data.status || "active");
        setPlanName(data.plan_name || "");
        setPlanDataLimit(data.plan_data_limit_gb?.toString() || "");
        setPlanCost(data.plan_cost?.toString() || "");
        setCurrentDataUsed(data.current_data_used_gb?.toString() || "0");
        setCurrentCycleStart(formattedDate);
        setOverageThreshold(data.overage_threshold?.toString() || "0.85");
        setSignal(data.signal_strength || "");
        setSelectedDevice(data.device?.toString() || "");
        
        console.log("Form populated successfully");
        
      } catch (error: any) {
        console.error("❌ Error fetching SIM card:", error);
        console.error("Error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
        
        if (error.response?.status === 404) {
          setErr("SIM card not found. It may have been deleted.");
        } else if (error.response?.status === 401) {
          setErr("Session expired. Redirecting to login...");
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        } else {
          setErr(`Failed to load SIM card data: ${error.message || 'Unknown error'}. Check console for details.`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSIMData();
  }, [id]);

  // Fetch devices
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoadingDevices(true);
        const resp = await listDevices();
        setDevices(resp.results || resp || []);
      } catch (error: any) {
        console.error("Error fetching devices:", error);
        if (error.response?.status === 403) {
          console.warn("⚠️ Access denied to OBD devices. SIM can be updated without device association.");
          setDevices([]);
        } else {
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
    setIsFormValid(valid);
  }, [simId, iccid]);

  const onSubmit = async () => {
    // Validation
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
        plan_name: planName,
        plan_data_limit_gb: Number(planDataLimit) || 0,
        plan_cost: planCost,
        current_data_used_gb: Number(currentDataUsed) || 0,
        current_cycle_start: currentCycleStart,
        overage_threshold: Number(overageThreshold) || 0.85,
        status,
        // Only include device if one is selected and it's not "none" or placeholder values
        ...(selectedDevice && 
            selectedDevice !== "none" && 
            selectedDevice !== "no-devices" && 
            selectedDevice !== "no-devices-available" && 
            { device: Number(selectedDevice) }),
      };

      console.log("Payload being sent:", payload);
      console.log("API Base URL:", api.defaults.baseURL);

      const result = await updateSIMCard(id, payload);
      console.log("SIM update result:", result);

      alert("SIM Card Updated Successfully");
      router.push("/sims");
    } catch (e: any) {
      console.error("SIM update error:", e);
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
          setTimeout(() => {
            window.location.href = "/login";
          }, 3000);
        } else {
          setErr("Authentication failed. Please log in again.");
        }
      } else if (e.response?.status === 403) {
        setErr("Access denied. You don't have permission to update SIM cards.");
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
        setErr(e.message || "Failed to update SIM card. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <Link href="/sims">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to SIM Cards
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-center">Edit SIM Card</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-gray-500 ml-3">Loading SIM card data...</p>
            </div>
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
        <h1 className="text-2xl font-bold text-center">Edit SIM Card</h1>
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
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">SIM ID cannot be changed</p>
            </div>
            <div>
              <Label htmlFor="iccid">ICCID *</Label>
              <Input
                id="iccid"
                value={iccid}
                onChange={(e) => setIccid(e.target.value)}
                placeholder="Enter ICCID"
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">ICCID cannot be changed</p>
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
                step="0.1"
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
                step="0.1"
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
              <Label htmlFor="overageThreshold">Overage Threshold (0-1)</Label>
              <Input
                id="overageThreshold"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={overageThreshold}
                onChange={(e) => setOverageThreshold(e.target.value)}
                placeholder="0.85"
              />
              <p className="text-xs text-gray-500 mt-1">Example: 0.85 = 85%</p>
            </div>
            <div>
              <Label>Device (Optional)</Label>
              <Select 
                value={selectedDevice || "none"} 
                onValueChange={(value) => setSelectedDevice(value === "none" ? "" : value)}
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
                  <SelectItem value="none">No Device</SelectItem>
                  {devices.length === 0 && !loadingDevices && (
                      <SelectItem value="no-devices-available" disabled>
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
              {submitting ? "Updating…" : "Update SIM Card"}
            </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


// "use client";

// import Link from "next/link";
// import { useEffect, useMemo, useState } from "react";
// import { useRouter } from "next/navigation";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import { ArrowLeft, Save, Plus } from "lucide-react";

// import {
//   createOBDDevice,
//   listSIMCards,
//   listVehicles,
//   listVehiclesType,
//   createSIM,
// } from "@/lib/api";

// // shadcn dialog
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
//   DialogTrigger,
//   DialogDescription,
//   DialogClose,
// } from "@/components/ui/dialog";

// const deviceModels = [
//   { id: "obd-pro-v3", name: "OBD Pro V3" },
//   { id: "obd-compact-v2", name: "OBD Compact V2" },
//   { id: "obd-advanced-v4", name: "OBD Advanced V4" },
// ];

// export default function AddVehiclePage() {
//   const router = useRouter();

//   // Vehicle
//   const [vehicleCode, setVehicleCode] = useState("");
//   const [vin, setVin] = useState("");
//   const [model, setModel] = useState("");
//   const [vehicleType, setVehicleType] = useState<string | undefined>(undefined);
//   const [year, setYear] = useState<string>("");
//   const [batteryCapacity, setBatteryCapacity] = useState<string>("");
//   const [maxSpeed, setMaxSpeed] = useState<string>("");
//   const [description, setDescription] = useState("");

//   // Vehicle type list
//   const [vehicleTypes, setVehicleTypes] = useState<
//     { id: string; name: string }[]
//   >([]);
//   const [loadingVehicleTypes, setLoadingVehicleTypes] = useState(false);

//   // Device fields
//   const [deviceId, setDeviceId] = useState("");
//   const [deviceModel, setDeviceModel] = useState<string | undefined>(undefined);
//   const [firmware, setFirmware] = useState("");
//   const [serialNumber, setSerialNumber] = useState("");
//   const [canBaud, setCanBaud] = useState<string | undefined>(undefined);
//   const [reportingInterval, setReportingInterval] = useState<string>("");

//   // Initial config
//   const [location, setLocation] = useState("");
//   const [odometer, setOdometer] = useState<string>("");
//   const [soc, setSoc] = useState<string>("");
//   const [enableAlerts, setEnableAlerts] = useState(false);
//   const [enableOta, setEnableOta] = useState(false);

//   // API selects
//   const [simOptions, setSimOptions] = useState<{ id: string; label: string }[]>(
//     []
//   );
//   const [vehicleOptions, setVehicleOptions] = useState<
//     { id: string; label: string }[]
//   >([]);
//   const [selectedSimPk, setSelectedSimPk] = useState<string | undefined>(
//     undefined
//   );
//   const [selectedVehiclePk, setSelectedVehiclePk] = useState<
//     string | undefined
//   >(undefined);

//   const [loadingSims, setLoadingSims] = useState(false);
//   const [loadingVehicles, setLoadingVehicles] = useState(false);

//   // Submit & error
//   const [submitting, setSubmitting] = useState(false);
//   const [err, setErr] = useState<string>("");

//   // New SIM dialog
//   const [simDialogOpen, setSimDialogOpen] = useState(false);
//   const [simForm, setSimForm] = useState({
//     sim_id: "",
//     iccid: "",
//     plan_name: "",
//     plan_data_limit_gb: "",
//     plan_cost: "",
//     current_cycle_start: "",
//     status: "available",
//   });
//   const [simSubmitting, setSimSubmitting] = useState(false);
//   const [simError, setSimError] = useState<string>("");

//   // Load SIMs
//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         setLoadingSims(true);
//         const resp = await listSIMCards();
//         const sims = Array.isArray(resp?.results)
//           ? resp.results
//           : Array.isArray(resp)
//           ? resp
//           : [];
//         const mapped = sims
//           .map((s: any) => {
//             const id = s?.id;
//             const simId = s?.sim_id || s?.iccid || `SIM-${id}`;
//             if (typeof id !== "number" && typeof id !== "string") return null;
//             return { id: String(id), label: simId };
//           })
//           .filter(Boolean) as { id: string; label: string }[];
//         if (mounted) setSimOptions(mapped);
//       } finally {
//         if (mounted) setLoadingSims(false);
//       }
//     })();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   // Load vehicle types
//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         setLoadingVehicleTypes(true);
//         const resp = await listVehiclesType();
//         const types = Array.isArray(resp?.results)
//           ? resp.results
//           : Array.isArray(resp)
//           ? resp
//           : [];
//         const mapped = types
//           .map((t: any) => {
//             const id = t?.id;
//             const name = t?.name || t?.type_name || `Type ${id}`;
//             if (!id) return null;
//             return { id: String(id), name };
//           })
//           .filter(Boolean) as { id: string; name: string }[];
//         if (mounted) setVehicleTypes(mapped);
//       } finally {
//         if (mounted) setLoadingVehicleTypes(false);
//       }
//     })();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   // Load Vehicles
//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         setLoadingVehicles(true);
//         const resp = await listVehicles();
//         const vehicles = Array.isArray(resp?.results)
//           ? resp.results
//           : Array.isArray(resp)
//           ? resp
//           : [];
//         const mapped = vehicles
//           .map((v: any) => {
//             const id = v?.id;
//             const label =
//               v?.name ||
//               v?.registration_number ||
//               v?.vin ||
//               v?.external_id ||
//               `Vehicle ${id}`;
//             if (typeof id !== "number" && typeof id !== "string") return null;
//             return { id: String(id), label };
//           })
//           .filter(Boolean) as { id: string; label: string }[];
//         if (mounted) setVehicleOptions(mapped);
//       } finally {
//         if (mounted) setLoadingVehicles(false);
//       }
//     })();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   // Map CAN select to integer
//   const canBaudNumber: number | undefined = useMemo(() => {
//     if (canBaud === "250k") return 250000;
//     if (canBaud === "500k") return 500000;
//     if (canBaud === "1m") return 1000000;
//     return undefined;
//   }, [canBaud]);

//   const onSubmit = async () => {
//     setErr("");
//     setSubmitting(true);

//     const payload: any = {
//       device_id: deviceId.trim(),
//     };
//     if (model.trim()) payload.model = model.trim();
//     if (firmware.trim()) payload.firmware_version = firmware.trim();
//     if (serialNumber.trim()) payload.serial_number = serialNumber.trim();
//     if (typeof canBaudNumber === "number")
//       payload.can_baud_rate = canBaudNumber;
//     if (reportingInterval && !Number.isNaN(Number(reportingInterval))) {
//       payload.report_interval_sec = Number(reportingInterval);
//     }
//     if (selectedVehiclePk && !Number.isNaN(Number(selectedVehiclePk))) {
//       payload.vehicle = Number(selectedVehiclePk);
//     }
//     if (selectedSimPk && !Number.isNaN(Number(selectedSimPk))) {
//       payload.sim_card = Number(selectedSimPk);
//     }

//     try {
//       await createOBDDevice(payload);
//       router.push("/vehicles");
//     } catch (e: any) {
//       const message = e?.message || "Failed to create vehicle/device";
//       setErr(message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // New SIM handlers
//   const handleSimField = (key: keyof typeof simForm, value: string) => {
//     setSimForm((prev) => ({ ...prev, [key]: value }));
//   };

//   const handleCreateSim = async () => {
//     setSimError("");
//     setSimSubmitting(true);

//     try {
//       const payload = {
//         sim_id: simForm.sim_id.trim(), // <-- new field
//         iccid: simForm.iccid.trim(),
//         status: simForm.status || "active",
//         plan_name: simForm.plan_name.trim(),
//         plan_data_limit_gb: parseFloat(simForm.plan_data_limit_gb),
//         plan_cost: parseFloat(simForm.plan_cost),
//         current_data_used_gb: 0.0, // backend expects this
//         current_cycle_start: simForm.current_cycle_start,
//         device: selectedVehiclePk ? Number(selectedVehiclePk) : null, // link if needed
//       };

//       // simple validation
//       if (
//         !payload.sim_id ||
//         !payload.iccid ||
//         !payload.plan_name ||
//         !payload.plan_data_limit_gb ||
//         !payload.plan_cost ||
//         !payload.current_cycle_start
//       ) {
//         setSimError("All required fields must be filled");
//         setSimSubmitting(false);
//         return;
//       }

//       const created = await createSIM(payload);

//       // Add to dropdowncreateSIM
//       if (created?.id) {
//         const newOpt = {
//           id: String(created.id),
//           label: created.sim_id || created.iccid,
//         };
//         setSimOptions((opts) => [newOpt, ...opts]);
//         setSelectedSimPk(String(created.id));
//       }

//       setSimDialogOpen(false);
//     } catch (err: any) {
//       setSimError(err?.message || "Failed to create SIM");
//     } finally {
//       setSimSubmitting(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center gap-4">
//         <Link href="/vehicles">
//           <Button variant="ghost">
//             <ArrowLeft className="w-4 h-4 mr-2" />
//             Back to Vehicles
//           </Button>
//         </Link>
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Add New Vehicle</h1>
//           <p className="text-gray-600">
//             Register a new vehicle and OBD telemetry device
//           </p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Vehicle Information */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Vehicle Information</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {err && (
//               <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
//                 {err}
//               </div>
//             )}

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <Label htmlFor="vehicleId">Vehicle ID (label)</Label>
//                 <Input
//                   id="vehicleId"
//                   placeholder="e.g., BLX57820"
//                   value={vehicleCode}
//                   onChange={(e) => setVehicleCode(e.target.value)}
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="vin">VIN Number</Label>
//                 <Input
//                   id="vin"
//                   placeholder="17-character VIN"
//                   maxLength={17}
//                   value={vin}
//                   onChange={(e) => setVin(e.target.value.toUpperCase())}
//                 />
//               </div>
//             </div>

//             <div>
//               <Label htmlFor="model">Vehicle Model</Label>
//               <Input
//                 id="model"
//                 placeholder="e.g., EV Pro 2024"
//                 value={model}
//                 onChange={(e) => setModel(e.target.value)}
//               />
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <Label>Vehicle Type</Label>
//                 <Select value={vehicleType} onValueChange={setVehicleType}>
//                   <SelectTrigger>
//                     <SelectValue
//                       placeholder={
//                         loadingVehicleTypes ? "Loading types..." : "Select type"
//                       }
//                     />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {vehicleTypes.map((type) => (
//                       <SelectItem key={type.id} value={type.id}>
//                         {type.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div>
//                 <Label htmlFor="year">Manufacturing Year</Label>
//                 <Input
//                   id="year"
//                   type="number"
//                   placeholder="2024"
//                   value={year}
//                   onChange={(e) => setYear(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <Label htmlFor="batteryCapacity">Battery Capacity (kWh)</Label>
//                 <Input
//                   id="batteryCapacity"
//                   type="number"
//                   placeholder="75"
//                   value={batteryCapacity}
//                   onChange={(e) => setBatteryCapacity(e.target.value)}
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="maxSpeed">Max Speed (km/h)</Label>
//                 <Input
//                   id="maxSpeed"
//                   type="number"
//                   placeholder="180"
//                   value={maxSpeed}
//                   onChange={(e) => setMaxSpeed(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div>
//               <Label htmlFor="description">Description</Label>
//               <Textarea
//                 id="description"
//                 placeholder="Additional vehicle details..."
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//               />
//             </div>

//             <div>
//               <Label>Link to Existing Vehicle</Label>
//               <Select
//                 value={selectedVehiclePk}
//                 onValueChange={setSelectedVehiclePk}
//                 disabled={loadingVehicles || vehicleOptions.length === 0}
//               >
//                 <SelectTrigger>
//                   <SelectValue
//                     placeholder={
//                       loadingVehicles ? "Loading vehicles..." : "Select vehicle"
//                     }
//                   />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {vehicleOptions.map((v) => (
//                     <SelectItem key={v.id} value={v.id}>
//                       {v.label} (id: {v.id})
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </CardContent>
//         </Card>

//         {/* OBD Device Information */}
//         <Card>
//           <CardHeader>
//             <CardTitle>OBD Telemetry Device</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div>
//               <Label htmlFor="deviceId">Device ID *</Label>
//               <Input
//                 id="deviceId"
//                 placeholder="e.g., OBD-2024-001"
//                 value={deviceId}
//                 onChange={(e) => setDeviceId(e.target.value)}
//                 required
//               />
//             </div>

//             <div>
//               <Label>Device Model</Label>
//               <Select value={deviceModel} onValueChange={setDeviceModel}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select device model" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {deviceModels.map((m) => (
//                     <SelectItem key={m.id} value={m.id}>
//                       {m.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <Label htmlFor="firmware">Firmware Version</Label>
//                 <Input
//                   id="firmware"
//                   placeholder="v2.1.3"
//                   value={firmware}
//                   onChange={(e) => setFirmware(e.target.value)}
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="serialNumber">Serial Number</Label>
//                 <Input
//                   id="serialNumber"
//                   placeholder="SN123456789"
//                   value={serialNumber}
//                   onChange={(e) => setSerialNumber(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="flex items-end gap-2">
//               <div className="flex-1">
//                 <Label>SIM Card</Label>
//                 <Select
//                   value={selectedSimPk}
//                   onValueChange={setSelectedSimPk}
//                   disabled={loadingSims}
//                 >
//                   <SelectTrigger>
//                     <SelectValue
//                       placeholder={
//                         loadingSims ? "Loading SIMs..." : "Assign SIM card"
//                       }
//                     />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {simOptions.map((sim) => (
//                       <SelectItem key={sim.id} value={sim.id}>
//                         {sim.label} (id: {sim.id})
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* New SIM Button */}
//               <Dialog open={simDialogOpen} onOpenChange={setSimDialogOpen}>
//                 <DialogTrigger asChild>
//                   <Button type="button" variant="outline" className="mt-6">
//                     <Plus className="w-4 h-4 mr-1" />
//                     New SIM
//                   </Button>
//                 </DialogTrigger>
//                 <DialogContent>
//                   <DialogHeader>
//                     <DialogTitle>Create New SIM</DialogTitle>
//                     <DialogDescription>
//                       Enter required SIM details
//                     </DialogDescription>
//                   </DialogHeader>

//                   {simError && (
//                     <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
//                       {simError}
//                     </div>
//                   )}

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="md:col-span-2">
//                       <Label htmlFor="iccid">ICCID *</Label>
//                       <Input
//                         id="iccid"
//                         value={simForm.iccid}
//                         onChange={(e) =>
//                           handleSimField("iccid", e.target.value)
//                         }
//                         placeholder="e.g., 8991..."
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="sim_id">SIM ID *</Label>
//                       <Input
//                         id="sim_id"
//                         value={simForm.sim_id || ""}
//                         onChange={(e) =>
//                           handleSimField("sim_id", e.target.value)
//                         }
//                         placeholder="e.g., SIM-V4-005"
//                       />
//                     </div>

//                     <div>
//                       <Label htmlFor="plan_name">Plan Name *</Label>
//                       <Input
//                         id="plan_name"
//                         value={simForm.plan_name}
//                         onChange={(e) =>
//                           handleSimField("plan_name", e.target.value)
//                         }
//                         placeholder="e.g., Global 1GB"
//                       />
//                     </div>

//                     <div>
//                       <Label htmlFor="plan_data_limit_gb">
//                         Plan Data Limit (GB) *
//                       </Label>
//                       <Input
//                         id="plan_data_limit_gb"
//                         type="number"
//                         value={simForm.plan_data_limit_gb}
//                         onChange={(e) =>
//                           handleSimField("plan_data_limit_gb", e.target.value)
//                         }
//                         placeholder="e.g., 5"
//                       />
//                     </div>

//                     <div>
//                       <Label htmlFor="plan_cost">Plan Cost *</Label>
//                       <Input
//                         id="plan_cost"
//                         value={simForm.plan_cost}
//                         onChange={(e) =>
//                           handleSimField("plan_cost", e.target.value)
//                         }
//                         placeholder="e.g., 9.99"
//                       />
//                     </div>

//                     <div>
//                       <Label htmlFor="current_cycle_start">
//                         Current Cycle Start *
//                       </Label>
//                       <Input
//                         id="current_cycle_start"
//                         type="date"
//                         value={simForm.current_cycle_start}
//                         onChange={(e) =>
//                           handleSimField("current_cycle_start", e.target.value)
//                         }
//                       />
//                     </div>

//                     <div className="md:col-span-2">
//                       <Label htmlFor="status">Status (optional)</Label>
//                       <Input
//                         id="status"
//                         value={simForm.status}
//                         onChange={(e) =>
//                           handleSimField("status", e.target.value)
//                         }
//                         placeholder="available / active / suspended"
//                       />
//                     </div>
//                   </div>

//                   <DialogFooter className="mt-4">
//                     <DialogClose asChild>
//                       <Button
//                         type="button"
//                         variant="outline"
//                         disabled={simSubmitting}
//                       >
//                         Cancel
//                       </Button>
//                     </DialogClose>
//                     <Button
//                       type="button"
//                       onClick={handleCreateSim}
//                       disabled={simSubmitting}
//                     >
//                       {simSubmitting ? "Creating…" : "Create SIM"}
//                     </Button>
//                   </DialogFooter>
//                 </DialogContent>
//               </Dialog>
//             </div>

//             <div>
//               <Label>CAN Bus Baud Rate</Label>
//               <Select value={canBaud} onValueChange={setCanBaud}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select baud rate" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="250k">250 kbps</SelectItem>
//                   <SelectItem value="500k">500 kbps</SelectItem>
//                   <SelectItem value="1m">1 Mbps</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div>
//               <Label htmlFor="reportingInterval">
//                 Reporting Interval (seconds)
//               </Label>
//               <Input
//                 id="reportingInterval"
//                 type="number"
//                 placeholder="30"
//                 value={reportingInterval}
//                 onChange={(e) => setReportingInterval(e.target.value)}
//               />
//             </div>
//           </CardContent>
//         </Card>

//         {/* Configuration */}
//         <Card className="lg:col-span-2">
//           <CardHeader>
//             <CardTitle>Initial Configuration</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <Label htmlFor="location">Initial Location</Label>
//                 <Input
//                   id="location"
//                   placeholder="e.g., San Francisco, CA"
//                   value={location}
//                   onChange={(e) => setLocation(e.target.value)}
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="odometer">Current Odometer (km)</Label>
//                 <Input
//                   id="odometer"
//                   type="number"
//                   placeholder="0"
//                   value={odometer}
//                   onChange={(e) => setOdometer(e.target.value)}
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="soc">Current SoC (%)</Label>
//                 <Input
//                   id="soc"
//                   type="number"
//                   placeholder="100"
//                   value={soc}
//                   onChange={(e) => setSoc(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="flex items-center gap-4">
//               <input
//                 type="checkbox"
//                 id="enableAlerts"
//                 className="rounded"
//                 checked={enableAlerts}
//                 onChange={(e) => setEnableAlerts(e.target.checked)}
//               />
//               <Label htmlFor="enableAlerts">Enable automatic alerts</Label>
//             </div>

//             <div className="flex items-center gap-4">
//               <input
//                 type="checkbox"
//                 id="enableOta"
//                 className="rounded"
//                 checked={enableOta}
//                 onChange={(e) => setEnableOta(e.target.checked)}
//               />
//               <Label htmlFor="enableOta">Enable OTA updates</Label>
//             </div>

//             <div className="flex justify-end gap-4 pt-4">
//               <Link href="/vehicles">
//                 <Button variant="outline" disabled={submitting}>
//                   Cancel
//                 </Button>
//               </Link>
//               <Button
//                 className="bg-blue-600 hover:bg-blue-700"
//                 onClick={onSubmit}
//                 disabled={submitting}
//               >
//                 <Save className="w-4 h-4 mr-2" />
//                 {submitting ? "Saving…" : "Add Vehicle"}
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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
import { createVehicle, listFleetOperators, listVehiclesType, listVehicles } from "@/lib/api";
interface FleetOperator {
  id: string;
  name: string;
}
export default function AddVehiclePage() {
  const router = useRouter();
const { toast } = useToast();
  // State for form fields
  const [vin, setVin] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [vehicleType, setVehicleType] = useState<string | undefined>(undefined);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [batteryCapacity, setBatteryCapacity] = useState("");
  const [currentBattery, setCurrentBattery] = useState("");
  const [mileage, setMileage] = useState("");
  const [warranty, setWarranty] = useState("");
  const [status, setStatus] = useState("available");
  const [color, setColor] = useState("");
  const [seating, setSeating] = useState("");
  const [fuelType, setFuelType] = useState("Electric");
  const [transmission, setTransmission] = useState("Automatic");
  const [efficiency, setEfficiency] = useState("");

  // Vehicle Types
  const [vehicleTypes, setVehicleTypes] = useState<
    { id: string; name: string; category: string }[]
  >([]);
  // fleet operater
  const [fleetOperator, setFleetOperator] = useState<string | undefined>(
    undefined
  );

  const [fleetOperators, setFleetOperators] = useState<FleetOperator[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTypes, setLoadingTypes] = useState(false);

  // Error & Loading
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Validation states
  const [existingVehicles, setExistingVehicles] = useState<any[]>([]);
  const [vinError, setVinError] = useState("");
  const [licensePlateError, setLicensePlateError] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  
  // Non-negative validation errors
  const [batteryCapacityError, setBatteryCapacityError] = useState("");
  const [currentBatteryError, setCurrentBatteryError] = useState("");
  const [mileageError, setMileageError] = useState("");
  const [efficiencyError, setEfficiencyError] = useState("");
  const [seatingError, setSeatingError] = useState("");
  //
  useEffect(() => {
    async function fetchOperators() {
      try {
        // setLoading(true);
        const resp = await listFleetOperators(); // call your API fn
        setFleetOperators(resp.results); // assuming resp is array of {id, name}
      } catch (error) {
        console.error("Error fetching fleet operators:", error);
      } finally {
        // setLoading(false);
      }
    }

    fetchOperators();
  }, []);

  // Fetch existing vehicles for validation
  useEffect(() => {
    async function fetchExistingVehicles() {
      try {
        const resp = await listVehicles();
        const vehicles = Array.isArray(resp?.results) ? resp.results : [];
        setExistingVehicles(vehicles);
      } catch (error) {
        console.error("Error fetching existing vehicles:", error);
      }
    }

    fetchExistingVehicles();
  }, []);
  // Load vehicle types
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingTypes(true);
        const resp = await listVehiclesType();
        const types = Array.isArray(resp?.results)
          ? resp.results
          : Array.isArray(resp)
          ? resp
          : [];
        const mapped = types.map((t: any) => ({
          id: String(t.id),
          name: t.name || `Type ${t.id}`,
          category: t.category || "Uncategorized", // Add category field
        }));
        if (mounted) setVehicleTypes(mapped);
      } finally {
        if (mounted) setLoadingTypes(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Validation functions
  const validateVIN = (vinValue: string) => {
    if (!vinValue.trim()) {
      setVinError("VIN is required");
      return false;
    }
    
    if (vinValue.length < 10) {
      setVinError("VIN must be at least 10 characters long");
      return false;
    }
    
    if (vinValue.length > 17) {
      setVinError("VIN cannot exceed 17 characters");
      return false;
    }
    
    // Check for uniqueness
    const isDuplicate = existingVehicles.some(vehicle => 
      vehicle.vin && vehicle.vin.toLowerCase() === vinValue.toLowerCase()
    );
    
    if (isDuplicate) {
      setVinError("This VIN already exists in the system");
      return false;
    }
    
    // Check for meaningful content (not just numbers or repeated characters)
    const hasVariety = /[A-Za-z]/.test(vinValue) && /\d/.test(vinValue);
    const hasRepeatedChars = /(.)\1{4,}/.test(vinValue); // More than 4 repeated characters
    
    if (!hasVariety || hasRepeatedChars) {
      setVinError("VIN must contain both letters and numbers, and not have excessive repeated characters");
      return false;
    }
    
    setVinError("");
    return true;
  };

  const validateLicensePlate = (plateValue: string) => {
    if (!plateValue.trim()) {
      setLicensePlateError("License plate is required");
      return false;
    }
    
    if (plateValue.length < 4) {
      setLicensePlateError("License plate must be at least 4 characters long");
      return false;
    }
    
    if (plateValue.length > 12) {
      setLicensePlateError("License plate cannot exceed 12 characters");
      return false;
    }
    
    // Check for uniqueness
    const isDuplicate = existingVehicles.some(vehicle => 
      vehicle.license_plate && vehicle.license_plate.toLowerCase() === plateValue.toLowerCase()
    );
    
    if (isDuplicate) {
      setLicensePlateError("This license plate already exists in the system");
      return false;
    }
    
    // Check for meaningful content (not just numbers or repeated characters)
    const hasVariety = /[A-Za-z]/.test(plateValue) || /\d/.test(plateValue);
    const hasRepeatedChars = /(.)\1{3,}/.test(plateValue); // More than 3 repeated characters
    
    if (!hasVariety || hasRepeatedChars) {
      setLicensePlateError("License plate must contain meaningful characters and not have excessive repeated characters");
      return false;
    }
    
    setLicensePlateError("");
    return true;
  };

  // Form validation effect
  useEffect(() => {
    const isValid = 
      validateVIN(vin) &&
      validateLicensePlate(licensePlate) &&
      make.trim() !== "" &&
      model.trim() !== "" &&
      vehicleType !== undefined &&
      fleetOperator !== undefined &&
      validateNonNegative(batteryCapacity, "Battery Capacity", setBatteryCapacityError) &&
      validateCurrentBattery(currentBattery) &&
      validateNonNegative(mileage, "Mileage", setMileageError) &&
      validateNonNegative(efficiency, "Efficiency", setEfficiencyError) &&
      validateNonNegative(seating, "Seating Capacity", setSeatingError);
    
    setIsFormValid(isValid);
  }, [vin, licensePlate, make, model, vehicleType, fleetOperator, batteryCapacity, currentBattery, mileage, efficiency, seating, existingVehicles]);

  // Helper function to ensure non-negative values
  const toNonNegativeString = (value: string): string => {
    const num = parseFloat(value);
    if (isNaN(num) || value === '') return value;
    return Math.max(0, num).toString();
  };

  // Validation functions for numeric fields
  const validateNonNegative = (value: string, fieldName: string, setError: (error: string) => void) => {
    if (value === '') {
      setError("");
      return true;
    }
    
    const num = parseFloat(value);
    if (isNaN(num)) {
      setError(`${fieldName} must be a valid number`);
      return false;
    }
    
    if (num < 0) {
      setError(`${fieldName} cannot be negative`);
      return false;
    }
    
    setError("");
    return true;
  };

  const validateCurrentBattery = (value: string) => {
    if (value === '') {
      setCurrentBatteryError("");
      return true;
    }
    
    const num = parseFloat(value);
    if (isNaN(num)) {
      setCurrentBatteryError("Battery level must be a valid number");
      return false;
    }
    
    if (num < 0) {
      setCurrentBatteryError("Battery level cannot be negative");
      return false;
    }
    
    if (num > 100) {
      setCurrentBatteryError("Battery level cannot exceed 100%");
      return false;
    }
    
    setCurrentBatteryError("");
    return true;
  };

  // Handle submit
 const onSubmit = async () => {
  setErr("");
  setSubmitting(true);

  // Final validation before submission
  if (!isFormValid) {
    setErr("Please fix all validation errors before submitting");
    setSubmitting(false);
    return;
  }

  const payload = {
    vin,
    fleet_operator: fleetOperator ? Number(fleetOperator) : undefined,
    license_plate: licensePlate,
    vehicle_type: vehicleType ? Number(vehicleType) : undefined,
    alerts_enabled: true,
    ota_enabled: true,
    firmware_versions: { main_os: "v4.2.0" },
    make,
    model,
    year: year ? Number(year) : undefined,
    battery_capacity_kwh: parseFloat(batteryCapacity),
    current_battery_level: parseFloat(currentBattery),
    mileage_km: mileage ? Number(mileage) : undefined,
    warranty_expiry_date: warranty,
    status,
    color,
    seating_capacity: seating ? Number(seating) : undefined,
    fuel_type: fuelType,
    transmission_type: transmission,
    efficiency_km_per_kwh: parseFloat(efficiency),
  };

  try {
    await createVehicle(payload);

    // ✅ Success toast
    toast({
      title: "Vehicle Added",
      description: "The vehicle has been added successfully.",
      variant: "default", // green/default for success
    });

    router.push("/vehicles");
  } catch (e: any) {
    const message = e?.message || "Failed to add vehicle";
    setErr(message);

    // ❌ Error toast
    toast({
      title: "Error",
      description: message,
      variant: "destructive", // red for error
    });
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Link href="/vehicles">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Vehicles
          </Button>
        </Link>
        <h1 className="   text-2xl  font-bold  text-center">Add Vehicle</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {err && <div className="text-red-600">{err}</div>}
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Vehicle Entry Guidelines</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>VIN:</strong> Must be 10-17 characters, contain both letters and numbers, and be unique</li>
              <li>• <strong>License Plate:</strong> Must be 4-12 characters, meaningful, and be unique</li>
              <li>• <strong>Numeric Fields:</strong> Battery Capacity, Mileage, Efficiency, and Seating Capacity cannot be negative</li>
              <li>• <strong>Battery Level:</strong> Must be between 0-100%</li>
              <li>• <strong>Year:</strong> Must be between 1900-2030</li>
              <li>• Avoid using repetitive characters like "aaaa" or "1111"</li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>VIN *</Label>
              <Input 
                value={vin} 
                onChange={(e) => {
                  setVin(e.target.value.toUpperCase());
                  validateVIN(e.target.value);
                }}
                className={vinError ? "border-red-500" : ""}
                placeholder="e.g., 1HGBH41JXMN109186"
              />
              {vinError && (
                <p className="text-sm text-red-600 mt-1">{vinError}</p>
              )}
            </div>
            <div>
              <Label>License Plate *</Label>
              <Input
                value={licensePlate}
                onChange={(e) => {
                  setLicensePlate(e.target.value.toUpperCase());
                  validateLicensePlate(e.target.value);
                }}
                className={licensePlateError ? "border-red-500" : ""}
                placeholder="e.g., TS09EV2011"
              />
              {licensePlateError && (
                <p className="text-sm text-red-600 mt-1">{licensePlateError}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Vehicle Type *</Label>
              <Select value={vehicleType} onValueChange={setVehicleType}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingTypes ? "Loading types..." : "Select type"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} ({type.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Fleet Operator *</Label>
              <Select value={fleetOperator} onValueChange={setFleetOperator}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loading ? "Loading operators..." : "Select operator"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {fleetOperators.map((op) => (
                    <SelectItem key={op.id} value={op.id}>
                      {op.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Make *</Label>
              <Input value={make} onChange={(e) => setMake(e.target.value)} />
            </div>
            <div>
              <Label>Model *</Label>
              <Input value={model} onChange={(e) => setModel(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Year</Label>
              <Input
                type="number"
                min="1900"
                max="2030"
                value={year}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (parseInt(value) >= 1900 && parseInt(value) <= 2030)) {
                    setYear(value);
                  }
                }}
                placeholder="e.g., 2024"
              />
            </div>
            <div>
              <Label>Warranty Expiry</Label>
              <Input
                type="date"
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Battery Capacity (kWh)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={batteryCapacity}
                onChange={(e) => {
                  const sanitizedValue = toNonNegativeString(e.target.value);
                  setBatteryCapacity(sanitizedValue);
                  validateNonNegative(sanitizedValue, "Battery Capacity", setBatteryCapacityError);
                }}
                className={batteryCapacityError ? "border-red-500" : ""}
                placeholder="e.g., 75.5"
              />
              {batteryCapacityError && (
                <p className="text-sm text-red-600 mt-1">{batteryCapacityError}</p>
              )}
            </div>
            <div>
              <Label>Current Battery Level (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={currentBattery}
                onChange={(e) => {
                  const sanitizedValue = toNonNegativeString(e.target.value);
                  setCurrentBattery(sanitizedValue);
                  validateCurrentBattery(sanitizedValue);
                }}
                className={currentBatteryError ? "border-red-500" : ""}
                placeholder="e.g., 85.5"
              />
              {currentBatteryError && (
                <p className="text-sm text-red-600 mt-1">{currentBatteryError}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Mileage (km)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={mileage}
                onChange={(e) => {
                  const sanitizedValue = toNonNegativeString(e.target.value);
                  setMileage(sanitizedValue);
                  validateNonNegative(sanitizedValue, "Mileage", setMileageError);
                }}
                className={mileageError ? "border-red-500" : ""}
                placeholder="e.g., 15000"
              />
              {mileageError && (
                <p className="text-sm text-red-600 mt-1">{mileageError}</p>
              )}
            </div>
            <div>
              <Label>Efficiency (km/kWh)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={efficiency}
                onChange={(e) => {
                  const sanitizedValue = toNonNegativeString(e.target.value);
                  setEfficiency(sanitizedValue);
                  validateNonNegative(sanitizedValue, "Efficiency", setEfficiencyError);
                }}
                className={efficiencyError ? "border-red-500" : ""}
                placeholder="e.g., 6.5"
              />
              {efficiencyError && (
                <p className="text-sm text-red-600 mt-1">{efficiencyError}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Color</Label>
              <Input value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
            <div>
              <Label>Seating Capacity</Label>
              <Input
                type="number"
                min="1"
                step="1"
                value={seating}
                onChange={(e) => {
                  const sanitizedValue = toNonNegativeString(e.target.value);
                  setSeating(sanitizedValue);
                  validateNonNegative(sanitizedValue, "Seating Capacity", setSeatingError);
                }}
                className={seatingError ? "border-red-500" : ""}
                placeholder="e.g., 5"
              />
              {seatingError && (
                <p className="text-sm text-red-600 mt-1">{seatingError}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fuel Type</Label>
              <Input
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
              />
            </div>
            <div>
              <Label>Transmission</Label>
              <Input
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link href="/vehicles">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={onSubmit} disabled={submitting || !isFormValid}>
              <Save className="w-4 h-4 mr-2" />
              {submitting ? "Saving…" : "Add Vehicle"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// "use client";

// import { useEffect, useRef, useState } from "react";
// import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import {
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   PieChart,
//   Pie,
//   Cell,
//   BarChart,
//   Bar,
// } from "recharts";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";
// import dynamic from "next/dynamic";
// import { Car, Wifi, AlertTriangle, Navigation } from "lucide-react";

// import { listVehicles, dashboardSummary, alerts, listFirmwareUpdates, getVehicleTelementry} from "@/lib/api";
// type TelemetryPoint = {
//   time: number;
//   speed_kph: number;
//   battery_level_percent: number;
//   range_km: number;
//   motor_temp_c: number;
// };

// type AggregatedTelemetry = {
//   average_battery_level_percent?: number;
//   average_estimated_range_km?: number;
//   total_energy_consumed_kwh?: number;
//   average_motor_temp_c?: number;
//   latest?: {
//     speed_kph?: number;
//     battery_level_percent?: number;
//     range_km?: number;
//     motor_temp_c?: number;
//   };
//   series?: Array<{
//     timestamp?: string | number;
//     speed_kph?: number;
//     battery_level_percent?: number;
//     range_km?: number;
//     motor_temp_c?: number;
//   }>;
// };
// const DynamicMap = dynamic(() => import("@/components/MapComponent"), {
//   ssr: false,
//   loading: () => (
//     <div className="h-full flex items-center justify-center">
//       <div className="text-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
//         <p className="text-gray-500">Loading map...</p>
//       </div>
//     </div>
//   ),
// });

// const COLORS = ["#22c55e", "#3b82f6", "#facc15", "#ef4444"];

// export default function Dashboard() {
//   const [mounted, setMounted] = useState(false);

//   const [vehicles, setVehicles] = useState<any[]>([]);
//   const [selectedVin, setSelectedVin] = useState<string>("");
//   const [telemetry, setTelemetry] = useState<any>({
//     speed_kph: 0,
//     battery_level_percent: 0,
//     motor_temp_c: 0,
//     range_km: 0,
//   });
//   const [series, setSeries] = useState<any[]>([]);

//   const [summary, setSummary] = useState<any | null>(null);
//   const [alertsData, setAlertsData] = useState<any[]>([]);
//   const [firmwareUpdates, setFirmwareUpdates] = useState<any[]>([]);
//   const [vehiclesCount, setVehiclesCount] = useState<number>(0);

//   // const telemetryService = useRef<VehicleTelemetryService  | null>(null);

//   useEffect(() => setMounted(true), []);

//   // Initialize VehicleTelemetryService (optional, if you also want WebSocket)
//   // useEffect(() => {
//   //   if (!mounted) return;

//   //   telemetryService.current = new VehicleTelemetryService({
//   //     onTelemetryUpdate: (data) => {
//   //       setTelemetry(data);
//   //       setSeries((prev) => [...prev.slice(-19), { time: Date.now(), ...data }]);
//   //     },
//   //     onConnect: (vin) => console.log("Connected to", vin),
//   //     onDisconnect: () => console.log("Disconnected"),
//   //     onError: (err) => console.error(err),
//   //   });
//   // }, [mounted]);

//   // Fetch vehicles list
//   useEffect(() => {
//     if (!mounted) return;
//     async function fetchVehicles() {
//       try {
//         const data = await listVehicles();
//         setVehicles(data.results || []);
//         setVehiclesCount(data.count ?? data.results?.length ?? 0);
//       } catch (err) {
//         console.error("Failed to load vehicles", err);
//       }
//     }
//     fetchVehicles();
//   }, [mounted]);

//   // Fetch dashboard summary, alerts, firmware
//   useEffect(() => {
//     if (!mounted) return;
//     async function fetchData() {
//       try {
//         setSummary(await dashboardSummary());
//         const a = await alerts();
//         setAlertsData(a.results || []);
//         const f = await listFirmwareUpdates();
//         setFirmwareUpdates(f.results || []);
//       } catch (err) {
//         console.error(err);
//       }
//     }
//     fetchData();
//   }, [mounted]);

//   // Fetch telemetry whenever a vehicle is selected
//   useEffect(() => {
//     if (!selectedVin) return;

//     let interval: NodeJS.Timer;

//     async function fetchTelemetry() {
//       try {

//         const data = await getVehicleTelementry();
//         setTelemetry(data);
//         setSeries((prev) => [...prev.slice(-19), { time: Date.now(), ...data }]);
//       } catch (err) {
//         console.error("Failed to fetch telemetry", err);
//       }
//     }

//     fetchTelemetry();
//     // Poll every 5s
//     interval = setInterval(fetchTelemetry, 5000);

//     return () => clearInterval(interval);
//   }, []);

//   if (!mounted)
//     return (
//       <div className="flex-1 flex items-center justify-center h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading Dashboard...</p>
//         </div>
//       </div>
//     );

//   // Vehicle Status Pie Data
//   const vehicleStatusData = summary
//     ? [
//         { name: "Available", value: summary.vehicle_status_breakdown?.available || 0 },
//         { name: "In Use", value: summary.vehicle_status_breakdown?.in_use || 0 },
//         { name: "Maintenance", value: summary.vehicle_status_breakdown?.maintenance || 0 },
//         { name: "Offline", value: summary.vehicle_status_breakdown?.offline ?? 0 },
//       ]
//     : [];

//   // Alerts Data
//   const severityCounts = alertsData.reduce(
//     (acc: any, alert: any) => {
//       acc[alert.severity] = (acc[alert.severity] || 0) + 1;
//       return acc;
//     },
//     { high: 0, medium: 0, low: 0 }
//   );

//   const alertsChartData = [
//     { name: "Critical", value: severityCounts.high },
//     { name: "Medium", value: severityCounts.medium },
//     { name: "Low", value: severityCounts.low },
//   ];

//   const criticalAlerts = alertsData.filter((a) => a.severity === "high").slice(0, 5);

//   const deviceHealthData = summary?.diagnostics?.device_health
//     ? [
//         {
//           name: "Device Health",
//           Normal: summary.diagnostics.device_health.normal ?? 0,
//           Warning: summary.diagnostics.device_health.warning ?? 0,
//           Critical: summary.diagnostics.device_health.critical ?? 0,
//         },
//       ]
//     : [{ name: "Device Health", Normal: 0, Warning: 0, Critical: 0 }];

//   const simCardData = summary?.diagnostics?.sim_cards
//     ? [
//         {
//           name: "Normal",
//           value:
//             (summary.diagnostics.sim_cards.total ?? 0) -
//             ((summary.diagnostics.sim_cards.high_usage ?? 0) +
//               (summary.diagnostics.sim_cards.inactive ?? 0)),
//         },
//         { name: "High Usage", value: summary.diagnostics.sim_cards.high_usage ?? 0 },
//         { name: "Inactive", value: summary.diagnostics.sim_cards.inactive ?? 0 },
//       ]
//     : [
//         { name: "Normal", value: 0 },
//         { name: "High Usage", value: 0 },
//         { name: "Inactive", value: 0 },
//       ];

//   return (
//     <SidebarProvider>
//       <SidebarInset>
//         <div className="flex-1 space-y-8 p-6 bg-gray-50">
//           <h1 className="text-3xl font-bold text-gray-900">Fleet Dashboard</h1>
//           {/* TOP GRID: Fleet Summary + Vehicle Status */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {/* Fleet Summary */}
//             <Card className="rounded-2xl shadow bg-white">
//               <CardHeader>
//                 <CardTitle className="text-lg font-semibold">
//                   Fleet Summary
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="grid grid-cols-2 md:grid-cols-2 gap-4">
//                 <div className="p-4 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center gap-3">
//                   <Car className="w-6 h-6 text-indigo-600 flex-shrink-0" />
//                   <div className="min-w-0 flex-1">
//                     <p className="text-sm text-gray-600">Total Vehicles</p>
//                     <p className="text-xl font-bold">
//                       {summary?.total_vehicles ?? "—"}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center gap-3">
//                   <Wifi className="w-6 h-6 text-green-600 flex-shrink-0" />
//                   <div className="min-w-0 flex-1">
//                     <p className="text-sm text-gray-600">Online Vehicles</p>
//                     <p className="text-xl font-bold">
//                       {summary?.online_vehicles ?? "—"}
//                     </p>
//                     <p className="text-xs text-gray-500">
//                       {summary &&
//                         summary.total_vehicles > 0 &&
//                         (
//                           (summary.online_vehicles / summary.total_vehicles) *
//                           100
//                         ).toFixed(0)}
//                       % of fleet
//                     </p>
//                   </div>
//                 </div>

//                 <div className="p-4 bg-gradient-to-br from-rose-100 to-rose-200 rounded-xl flex items-center gap-3">
//                   <AlertTriangle className="w-6 h-6 text-rose-600 flex-shrink-0" />
//                   <div className="min-w-0 flex-1">
//                     <p className="text-sm text-gray-600">Critical Alerts</p>
//                     <p className="text-xl font-bold">
//                       {summary?.critical_alerts ?? "—"}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="p-4 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center gap-3">
//                   <Navigation className="w-6 h-6 text-yellow-600 flex-shrink-0" />
//                   <div className="min-w-0 flex-1">
//                     <p className="text-sm text-gray-600">Active Trips</p>
//                     <p className="text-xl font-bold">
//                       {summary?.total_active_trips ?? "—"}
//                     </p>
//                     <p className="text-xs text-gray-500">
//                       {summary?.total_distance_travelled_km ?? "—"} km today
//                     </p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Vehicle Status Donut */}
//             <Card className="rounded-2xl shadow bg-white">
//               <CardHeader>
//                 <CardTitle>Vehicle Status</CardTitle>
//               </CardHeader>
//               <CardContent className="h-72 flex items-center justify-center">
//                 {vehicleStatusData.length > 0 &&
//                 vehicleStatusData.some((item) => item.value > 0) ? (
//                   <ResponsiveContainer width="100%" height="100%">
//                     <PieChart>
//                       <Pie
//                         data={vehicleStatusData}
//                         dataKey="value"
//                         nameKey="name"
//                         innerRadius={60}
//                         outerRadius={90}
//                         paddingAngle={3}
//                       >
//                         {vehicleStatusData.map((_, i) => (
//                           <Cell key={i} fill={COLORS[i % COLORS.length]} />
//                         ))}
//                       </Pie>
//                       <Tooltip />
//                       <Legend />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 ) : (
//                   <p className="text-gray-500">Loading…</p>
//                 )}
//               </CardContent>
//             </Card>
//           </div>
//           {/* TELEMETRY + ALERTS */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {/* Telemetry */}
//             <Card className="rounded-2xl shadow bg-white">
//               <CardHeader>
//                 <CardTitle>Telemetry Overview</CardTitle>
//               </CardHeader>
//               <CardContent className="grid grid-cols-2 gap-4">
//                 <div className="p-4 bg-indigo-50 rounded-xl">
//                   <p className="text-sm">Avg Battery</p>
//                   <p className="text-xl font-bold">
//                     {summary?.average_battery_level ?? "—"}%
//                   </p>
//                 </div>
//                 <div className="p-4 bg-indigo-50 rounded-xl">
//                   <p className="text-sm">Avg Range</p>
//                   <p className="text-xl font-bold">
//                     {summary?.obd_metrics?.average_estimated_range_km ?? "—"} km
//                   </p>
//                 </div>
//                 <div className="p-4 bg-indigo-50 rounded-xl">
//                   <p className="text-sm">Energy Used</p>
//                   <p className="text-xl font-bold">
//                     {summary?.energy_metrics?.total_energy_consumed_kwh ?? "—"}{" "}
//                     kWh
//                   </p>
//                 </div>
//                 <div className="p-4 bg-indigo-50 rounded-xl">
//                   <p className="text-sm">Motor Temp</p>
//                   <p className="text-xl font-bold">
//                     {summary?.obd_metrics?.average_motor_temp_c ?? "—"}°C
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Alerts Panel */}
//             <Card className="rounded-2xl shadow bg-white">
//               <CardHeader>
//                 <CardTitle>Alerts Panel</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 {/* Counts */}
//                 <p className="text-sm text-gray-600">
//                   {severityCounts.high} Critical, {severityCounts.medium}{" "}
//                   Medium, {severityCounts.low} Low
//                 </p>

//                 {/* Pie Chart */}
//                 <div className="h-48 mt-4">
//                   <ResponsiveContainer>
//                     <PieChart>
//                       <Pie
//                         data={alertsChartData}
//                         dataKey="value"
//                         nameKey="name"
//                         outerRadius={70}
//                         label
//                       >
//                         {alertsChartData.map((entry, i) => (
//                           <Cell
//                             key={i}
//                             fill={
//                               entry.name === "Critical"
//                                 ? "#ef4444"
//                                 : entry.name === "Medium"
//                                 ? "#f59e0b"
//                                 : "#10b981"
//                             }
//                           />
//                         ))}
//                       </Pie>
//                       <Tooltip />
//                       <Legend />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 </div>

//                 {/* Recent Critical Alerts */}
//                 <div className="mt-6">
//                   <h3 className="font-semibold text-sm mb-2">
//                     Recent Critical Alerts
//                   </h3>
//                   <ul className="space-y-3 text-sm">
//                     {criticalAlerts.length > 0 ? (
//                       criticalAlerts.map((alert) => (
//                         <li
//                           key={alert.id}
//                           className="border p-3 rounded-lg bg-red-50 border-red-200"
//                         >
//                           <p className="font-medium text-red-700">
//                             {alert.title}
//                           </p>
//                           <p className="text-gray-600">
//                             Vehicle: {alert.vehicle_info?.license_plate}
//                           </p>
//                           <p className="text-gray-500 text-xs">
//                             {new Date(alert.created_at).toLocaleString()}
//                           </p>
//                         </li>
//                       ))
//                     ) : (
//                       <p className="text-gray-500 text-xs">
//                         No critical alerts
//                       </p>
//                     )}
//                   </ul>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//           {/* INTERACTIVE FLEET MAP */}
//           <Card className="rounded-2xl shadow bg-white">
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <CardTitle>Fleet Location Map</CardTitle>
//                 <span className="text-sm text-gray-500">
//                   {vehiclesCount || "—"} vehicles
//                 </span>
//               </div>

//               <div className="flex gap-4 text-sm">
//                 <div className="flex items-center gap-2">
//                   <div className="w-4 h-4 bg-green-500 rounded-full"></div>
//                   <span>Available</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
//                   <span>In Use</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
//                   <span>Warning</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <div className="w-4 h-4 bg-red-500 rounded-full"></div>
//                   <span>Offline/Critical</span>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent className="h-[400px] p-0">
//               <DynamicMap vehicles={vehicles} />
//             </CardContent>
//           </Card>
//           {/* LIVE VEHICLE TELEMETRY */}
//           <Card className="rounded-2xl shadow bg-white p-4">
//             <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//               <CardTitle>Live Vehicle Telemetry</CardTitle>
//               <Select onValueChange={(value) => setSelectedVin(value)}>
//                 <SelectTrigger className="w-[200px]">
//                   <SelectValue placeholder="Select Vehicle" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {vehicles.map((v) => (
//                     <SelectItem key={v.vin} value={v.vin}>
//                       {v?.license_plate || v?.vin || v?.model}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </CardHeader>

//             <CardContent className="space-y-6">
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 <div className="p-3 bg-indigo-50 rounded-lg">
//                   <p className="text-sm">Speed</p>
//                   <p className="text-xl font-bold">{telemetry.speed_kph} km/h</p>
//                 </div>
//                 <div className="p-3 bg-green-50 rounded-lg">
//                   <p className="text-sm">Battery</p>
//                   <p className="text-xl font-bold">{telemetry.battery_level_percent}%</p>
//                 </div>
//                 <div className="p-3 bg-yellow-50 rounded-lg">
//                   <p className="text-sm">Range</p>
//                   <p className="text-xl font-bold">{telemetry.range_km} km</p>
//                 </div>
//                 <div className="p-3 bg-rose-50 rounded-lg">
//                   <p className="text-sm">Motor Temp</p>
//                   <p className="text-xl font-bold">{telemetry.motor_temp_c}°C</p>
//                 </div>
//               </div>

//               <ResponsiveContainer width="100%" height={300}>
//                 <LineChart data={series}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="time" tickFormatter={(t) => new Date(t).toLocaleTimeString()} />
//                   <YAxis yAxisId="left" label={{ value: "Speed (kph)", angle: -90, position: "insideLeft" }} />
//                   <YAxis
//                     yAxisId="right"
//                     orientation="right"
//                     domain={[0, 100]}
//                     label={{ value: "Battery (%)", angle: -90, position: "insideRight" }}
//                   />
//                   <Tooltip labelFormatter={(t) => new Date(t).toLocaleTimeString()} />
//                   <Legend />
//                   <Line yAxisId="left" type="monotone" dataKey="speed_kph" stroke="#6366F1" dot={false} name="Speed (kph)" />
//                   <Line yAxisId="right" type="monotone" dataKey="battery_level_percent" stroke="#10B981" dot={false} name="Battery (%)" />
//                 </LineChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//           {/* FIRMWARE + DIAGNOSTICS */}
//           <div className="flex flex-col lg:flex-row gap-6">
//             {/* Firmware Updates */}
//             <Card className="rounded-2xl shadow bg-white h-[500px] flex-shrink-0 lg:w-[250px] flex flex-col">
//               <CardHeader>
//                 <CardTitle>Firmware Updates</CardTitle>
//               </CardHeader>
//               <CardContent className="flex-1 flex flex-col gap-4">
//                 <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 flex flex-col items-center justify-center">
//                   <p className="font-semibold text-blue-700">
//                     Updates Available
//                   </p>
//                   <p className="text-gray-700 text-lg">
//                     {
//                       firmwareUpdates.filter((u) => u.status === "paused")
//                         .length
//                     }{" "}
//                     pending
//                   </p>
//                 </div>
//                 <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 flex flex-col items-center justify-center">
//                   <p className="font-semibold text-yellow-700">In Progress</p>
//                   <p className="text-gray-700 text-lg">
//                     {
//                       firmwareUpdates.filter((u) => u.status === "rolling_out")
//                         .length
//                     }{" "}
//                     updating
//                   </p>
//                 </div>
//                 <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 flex flex-col items-center justify-center">
//                   <p className="font-semibold text-gray-700">Latest</p>
//                   {firmwareUpdates.length > 0 ? (
//                     <>
//                       <p className="text-gray-600 text-lg">
//                         v{firmwareUpdates[0].version}
//                       </p>
//                       <p className="text-xs text-gray-500">
//                         {new Date(
//                           firmwareUpdates[0].release_date
//                         ).toLocaleDateString()}
//                       </p>
//                     </>
//                   ) : (
//                     <p className="text-gray-400">No data</p>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Diagnostic Stats */}
//             <Card className="rounded-2xl shadow bg-white flex-1 flex flex-col h-[500px]">
//               <CardHeader>
//                 <CardTitle>Diagnostic Stats</CardTitle>
//               </CardHeader>
//               <CardContent className="flex-1 flex flex-col gap-6 p-4">
//                 {/* Device Health - horizontal stacked bar */}
//                 <div className="w-full flex flex-col items-center justify-center">
//                   <p className="text-sm font-medium mb-2">Device Health</p>
//                   <ResponsiveContainer width="70%" height={150}>
//                     <BarChart
//                       data={[
//                         {
//                           name: "Normal",
//                           value: deviceHealthData[0]?.Normal ?? 0,
//                         },
//                         {
//                           name: "Warning",
//                           value: deviceHealthData[0]?.Warning ?? 0,
//                         },
//                         {
//                           name: "Critical",
//                           value: deviceHealthData[0]?.Critical ?? 0,
//                         },
//                       ]}
//                       margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
//                     >
//                       <XAxis
//                         dataKey="name"
//                         tick={{ fontSize: 12 }}
//                         interval={0}
//                       />
//                       <YAxis tick={{ fontSize: 12 }} />
//                       <Tooltip
//                         formatter={(value: number) => [
//                           `${value} devices`,
//                           "Count",
//                         ]}
//                       />
//                       <Bar dataKey="value" radius={[4, 4, 0, 0]}>
//                         <Cell fill="#22c55e" />
//                         <Cell fill="#facc15" />
//                         <Cell fill="#ef4444" />
//                       </Bar>
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>

//                 {/* SIM Card Status - full width below */}
//                 <div className="w-full flex flex-col items-center justify-center">
//                   <p className="text-sm font-medium mb-2">SIM Card Status</p>
//                   <ResponsiveContainer width="100%" height={120}>
//                     <PieChart>
//                       <Pie
//                         data={simCardData}
//                         dataKey="value"
//                         nameKey="name"
//                         outerRadius={50}
//                         label
//                       >
//                         {simCardData.map((_, i) => (
//                           <Cell key={i} fill={COLORS[i % COLORS.length]} />
//                         ))}
//                       </Pie>
//                       <Tooltip />
//                       <Legend />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </SidebarInset>
//     </SidebarProvider>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Car, Wifi, AlertTriangle, Navigation } from "lucide-react";

import {
  listVehicles,
  dashboardSummary,
  alerts,
  listFirmwareUpdates,
  getVehicleTelementry,
} from "@/lib/api";

type TelemetryPoint = {
  time: number;
  speed_kph: number;
  battery_level_percent: number;
  range_km: number;
  motor_temp_c: number;
  tire_pressure_kpa: number;
  record_count: number;
  vehicle_count: number;
  error_record_count: number;
};

type AggregatedTelemetryResponse = {
  record_count: number;
  vehicle_count: number;
  error_record_count: number;
  averages: {
    speed_kph?: number;
    battery_percent?: number;
    motor_temp_c?: number;
    tire_pressure_kpa?: number;
    range_km?: number;
  };
};

const DynamicMap = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-500">Loading map...</p>
      </div>
    </div>
  ),
});

const COLORS = ["#22c55e", "#3b82f6", "#facc15", "#ef4444"];

export default function Dashboard() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVin, setSelectedVin] = useState<string>("");

  const [telemetry, setTelemetry] = useState({
    speed_kph: 0,
    battery_level_percent: 0,
    motor_temp_c: 0,
    range_km: 0,
    record_count: 0,
    vehicle_count: 0,
    error_record_count: 0,
    tire_pressure_kpa: 0,
  });

  const [series, setSeries] = useState<TelemetryPoint[]>([]);

  const [agg, setAgg] = useState<AggregatedTelemetryResponse | null>(null);

  const [summary, setSummary] = useState<any | null>(null);
  const [alertsData, setAlertsData] = useState<any[]>([]);
  const [firmwareUpdates, setFirmwareUpdates] = useState<any[]>([]);
  const [vehiclesCount, setVehiclesCount] = useState<number>(0);

  useEffect(() => setMounted(true), []);

  // Vehicles
  useEffect(() => {
    if (!mounted) return;
    async function fetchVehicles() {
      try {
        const data = await listVehicles();
        setVehicles(data.results || []);
        setVehiclesCount(data.count ?? data.results?.length ?? 0);
      } catch (err) {
        console.error("Failed to load vehicles", err);
      }
    }
    fetchVehicles();
  }, [mounted]);

  // Summary, alerts, firmware
  useEffect(() => {
    if (!mounted) return;
    async function fetchData() {
      try {
        setSummary(await dashboardSummary());
        const a = await alerts();
        setAlertsData(a.results || []);
        const f = await listFirmwareUpdates();
        setFirmwareUpdates(f.results || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, [mounted]);

  // Fleet-aggregated telemetry polling (build time-series from averages)
  const fetchTelemetry = async () => {
    try {
      const data: AggregatedTelemetryResponse = await getVehicleTelementry();
      setAgg(data);

      const point: TelemetryPoint = {
        time: Date.now(),
        speed_kph: data.averages?.speed_kph ?? 0,
        battery_level_percent: data.averages?.battery_percent ?? 0,
        range_km: data.averages?.range_km ?? 0,
        motor_temp_c: data.averages?.motor_temp_c ?? 0,
        tire_pressure_kpa: data.averages?.tire_pressure_kpa ?? 0,
        record_count: data.record_count ?? 0,
        vehicle_count: data.vehicle_count ?? 0,
        error_record_count: data.error_record_count ?? 0,
      };

      // ✅ KPIs update
      setTelemetry({
        speed_kph: point.speed_kph,
        battery_level_percent: point.battery_level_percent,
        range_km: point.range_km,
        motor_temp_c: point.motor_temp_c,
        tire_pressure_kpa: point.tire_pressure_kpa,
        record_count: point.record_count,
        vehicle_count: point.vehicle_count,
        error_record_count: point.error_record_count,
      });

      // ✅ Time-series update (keep last 100 points)
      setSeries((prev) => [...prev.slice(-99), point]);
    } catch (err) {
      console.error("Failed to fetch aggregated telemetry", err);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 50000);
    return () => clearInterval(interval);
  }, [mounted]);

  if (!mounted)
    return (
      <div className="flex-1 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );

  // Vehicle Status Pie Data (from summary)
  const vehicleStatusData = summary
    ? [
        {
          name: "Available",
          value: summary.vehicle_status_breakdown?.available || 0,
        },
        {
          name: "In Use",
          value: summary.vehicle_status_breakdown?.in_use || 0,
        },
        {
          name: "Maintenance",
          value: summary.vehicle_status_breakdown?.maintenance || 0,
        },
        {
          name: "Offline",
          value: summary.vehicle_status_breakdown?.offline ?? 0,
        },
      ]
    : [];

  // Alerts Data
  const severityCounts = alertsData.reduce(
    (acc: any, alert: any) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    },
    { high: 0, medium: 0, low: 0 }
  );

  const alertsChartData = [
    { name: "Critical", value: severityCounts.high },
    { name: "Medium", value: severityCounts.medium },
    { name: "Low", value: severityCounts.low },
  ];

  const criticalAlerts = alertsData.filter((a) => a.severity === "high").slice(0, 5);

  const deviceHealthData = summary?.diagnostics?.device_health
    ? [
        {
          name: "Device Health",
          Normal: summary.diagnostics.device_health.normal ?? 0,
          Warning: summary.diagnostics.device_health.warning ?? 0,
          Critical: summary.diagnostics.device_health.critical ?? 0,
        },
      ]
    : [{ name: "Device Health", Normal: 0, Warning: 0, Critical: 0 }];

  const simCardData = summary?.diagnostics?.sim_cards
    ? [
        {
          name: "Normal",
          value:
            (summary.diagnostics.sim_cards.total ?? 0) -
            ((summary.diagnostics.sim_cards.high_usage ?? 0) +
              (summary.diagnostics.sim_cards.inactive ?? 0)),
        },
        {
          name: "High Usage",
          value: summary.diagnostics.sim_cards.high_usage ?? 0,
        },
        {
          name: "Inactive",
          value: summary.diagnostics.sim_cards.inactive ?? 0,
        },
      ]
    : [
        { name: "Normal", value: 0 },
        { name: "High Usage", value: 0 },
        { name: "Inactive", value: 0 },
      ];

  return (
    <SidebarProvider>
      <SidebarInset>
        <div className="flex-1 space-y-8 p-6 bg-gray-50">
          <h1 className="text-3xl font-bold text-gray-900">Fleet Dashboard</h1>

          {/* TOP GRID: Fleet Summary + Vehicle Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fleet Summary */}
            <Card className="rounded-2xl shadow bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Fleet Summary</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center gap-3">
                  <Car className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-600">Total Vehicles</p>
                    <p className="text-xl font-bold">{summary?.total_vehicles ?? "—"}</p>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center gap-3">
                  <Wifi className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-600">Online Vehicles</p>
                    <p className="text-xl font-bold">{summary?.online_vehicles ?? "—"}</p>
                    <p className="text-xs text-gray-500">
                      {summary &&
                        summary.total_vehicles > 0 &&
                        ((summary.online_vehicles / summary.total_vehicles) * 100).toFixed(0)}
                      % of fleet
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-rose-100 to-rose-200 rounded-xl flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-rose-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-600">Critical Alerts</p>
                    <p className="text-xl font-bold">{summary?.critical_alerts ?? "—"}</p>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center gap-3">
                  <Navigation className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-600">Active Trips</p>
                    <p className="text-xl font-bold">{summary?.total_active_trips ?? "—"}</p>
                    <p className="text-xs text-gray-500">{summary?.total_distance_travelled_km ?? "—"} km today</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Status Donut */}
            <Card className="rounded-2xl shadow bg-white">
              <CardHeader>
                <CardTitle>Vehicle Status</CardTitle>
              </CardHeader>
              <CardContent className="h-72 flex items-center justify-center">
                {vehicleStatusData.length > 0 && vehicleStatusData.some((item) => item.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={vehicleStatusData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                      >
                        {vehicleStatusData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500">Loading…</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* TELEMETRY + ALERTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Telemetry Overview (from aggregated averages) */}
            <Card className="rounded-2xl shadow bg-white">
              <CardHeader>
                <CardTitle>Telemetry Overview</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-50 rounded-xl">
                  <p className="text-sm">Avg Battery</p>
                  <p className="text-xl font-bold">{agg?.averages?.battery_percent ?? "—"}%</p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-xl">
                  <p className="text-sm">Avg Range</p>
                  <p className="text-xl font-bold">{agg?.averages?.range_km ?? "—"} km</p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-xl">
                  <p className="text-sm">Avg Speed</p>
                  <p className="text-xl font-bold">{agg?.averages?.speed_kph ?? "—"} km/h</p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-xl">
                  <p className="text-sm">Motor Temp</p>
                  <p className="text-xl font-bold">{agg?.averages?.motor_temp_c ?? "—"}°C</p>
                </div>
              </CardContent>
            </Card>

            {/* Alerts Panel */}
            <Card className="rounded-2xl shadow bg-white">
              <CardHeader>
                <CardTitle>Alerts Panel</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {severityCounts.high} Critical, {severityCounts.medium} Medium, {severityCounts.low} Low
                </p>

                <div className="h-48 mt-4">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={alertsChartData} dataKey="value" nameKey="name" outerRadius={70} label>
                        {alertsChartData.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={
                              entry.name === "Critical"
                                ? "#ef4444"
                                : entry.name === "Medium"
                                ? "#f59e0b"
                                : "#10b981"
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Recent Critical Alerts with navigation */}
                <div className="mt-6">
                  <h3 className="font-semibold text-sm mb-2">Recent Critical Alerts</h3>
                  <ul className="space-y-3 text-sm">
                    {criticalAlerts.length > 0 ? (
                      criticalAlerts.map((alert) => (
                        <li
                          key={alert.id}
                          onClick={() => router.push(`/all-alerts/${alert.id}`)}
                          className="border p-3 rounded-lg bg-red-50 border-red-200 cursor-pointer hover:bg-red-100 transition"
                        >
                          <p className="font-medium text-red-700">{alert.title}</p>
                          <p className="text-gray-600">Vehicle: {alert.vehicle_info?.license_plate}</p>
                          <p className="text-gray-500 text-xs">{new Date(alert.created_at).toLocaleString()}</p>
                        </li>
                      ))
                    ) : (
                      <p className="text-gray-500 text-xs">No critical alerts</p>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* INTERACTIVE FLEET MAP */}
          <Card className="rounded-2xl shadow bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Fleet Location Map</CardTitle>
                <span className="text-sm text-gray-500">{vehiclesCount || "—"} vehicles</span>
              </div>

              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span>In Use</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span>Warning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span>Offline/Critical</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[400px] p-0">
              <DynamicMap vehicles={vehicles} />
            </CardContent>
          </Card>

          {/* LIVE VEHICLE TELEMETRY */}
          <Card className="rounded-2xl shadow bg-white p-4">
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <CardTitle> Vehicle Telemetry</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <p className="text-sm">Record Count</p>
                  <p className="text-xl font-bold">{telemetry?.record_count}</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <p className="text-sm">Vehicle Count</p>
                  <p className="text-xl font-bold">{telemetry?.vehicle_count}</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <p className="text-sm">Speed</p>
                  <p className="text-xl font-bold">{telemetry.speed_kph} km/h</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm">Battery</p>
                  <p className="text-xl font-bold">{telemetry.battery_level_percent}%</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm">Range</p>
                  <p className="text-xl font-bold">{telemetry.range_km} km</p>
                </div>
                <div className="p-3 bg-rose-50 rounded-lg">
                  <p className="text-sm">Motor Temp</p>
                  <p className="text-xl font-bold">{telemetry.motor_temp_c}°C</p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    tickFormatter={(t) => new Date(t).toLocaleTimeString()}
                    tick={{ fontSize: 10 }}  // ↓ Decreased X-axis font size
                  />
                  <YAxis
                    yAxisId="left"
                    label={{ value: "Speed (kph)", angle: -90, position: "insideLeft" }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 100]}
                    label={{ value: "Battery (%)", angle: -90, position: "insideRight" }}
                  />
                  <Tooltip labelFormatter={(t) => new Date(t).toLocaleTimeString()} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="speed_kph"
                    stroke="#6366F1"
                    dot={false}
                    name="Speed (kph)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="battery_level_percent"
                    stroke="#10B981"
                    dot={false}
                    name="Battery (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* FIRMWARE + DIAGNOSTICS */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Firmware Updates */}
            <Card className="rounded-2xl shadow bg-white h-[500px] flex-shrink-0 lg:w-[250px] flex flex-col">
              <CardHeader>
                <CardTitle>Firmware Updates</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 flex flex-col items-center justify-center">
                  <p className="font-semibold text-blue-700">Updates Available</p>
                  <p className="text-gray-700 text-lg">
                    {firmwareUpdates.filter((u) => u.status === "paused").length} pending
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 flex flex-col items-center justify-center">
                  <p className="font-semibold text-yellow-700">In Progress</p>
                  <p className="text-gray-700 text-lg">
                    {firmwareUpdates.filter((u) => u.status === "rolling_out").length} updating
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 flex flex-col items-center justify-center">
                  <p className="font-semibold text-gray-700">Latest</p>
                  {firmwareUpdates.length > 0 ? (
                    <>
                      <p className="text-gray-600 text-lg">v{firmwareUpdates[0].version}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(firmwareUpdates[0].release_date).toLocaleDateString()}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-400">No data</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Diagnostic Stats */}
            <Card className="rounded-2xl shadow bg-white flex-1 flex flex-col h[500px]">
              <CardHeader>
                <CardTitle>Diagnostic Stats</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-6 p-4">
                {/* Device Health */}
                <div className="w-full flex flex-col items-center justify-center">
                  <p className="text-sm font-medium mb-2">Device Health</p>
                  <ResponsiveContainer width="70%" height={150}>
                    <BarChart
                      data={[
                        { name: "Normal", value: deviceHealthData[0]?.Normal ?? 0 },
                        { name: "Warning", value: deviceHealthData[0]?.Warning ?? 0 },
                        { name: "Critical", value: deviceHealthData[0]?.Critical ?? 0 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} /> {/* ↓ Decreased font */}
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value: number) => [`${value} devices`, "Count"]} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        <Cell fill="#22c55e" />
                        <Cell fill="#facc15" />
                        <Cell fill="#ef4444" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* SIM Card Status */}
                <div className="w-full flex flex-col items-center justify-center">
                  <p className="text-sm font-medium mb-2">SIM Card Status</p>
                  <ResponsiveContainer width="100%" height={120}>
                    <PieChart>
                      <Pie data={simCardData} dataKey="value" nameKey="name" outerRadius={50} label>
                        {simCardData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

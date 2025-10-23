// "use client";

// import { useEffect, useMemo, useState } from "react";
// import AuthGuard from "@/components/AuthGuard";

// // shadcn/ui primitives
// import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
// import { Separator } from "@/components/ui/separator";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// // icons
// import { Bell, Settings, LogOut, User as UserIcon } from "lucide-react";

// // zip components
// import { FleetKPIBar } from "@/components/fleet-kpi-bar";
// import { TelemetryWidget } from "@/components/telemetry-widget";
// import { AlertsTimeline } from "@/components/alerts-timeline";
// import { VehiclesTable } from "@/components/vehicles-table";

// // live API helpers
// import { listOBDDevices, getDeviceMetrics } from "@/lib/api";

// // ----- Types -----
// type SimCard = {
//   id: number;
//   sim_id: string;
//   iccid: string;
//   status: string;
//   plan_name?: string | null;
//   plan_data_limit_gb?: number | null;
//   plan_cost?: string | null;
//   current_data_used_gb?: number | null;
//   current_cycle_start?: string | null;
//   overage_threshold?: number | null;
//   device?: number | null;
//   last_activity?: string | null;
//   signal_strength?: string | null;
// };

// type OBDDevice = {
//   id: number;
//   device_id: string;
//   model?: string | null;
//   serial_number?: string | null;
//   can_baud_rate?: number | null;
//   report_interval_sec?: number | null;
//   vehicle: number | null;
//   sim_card?: SimCard | null;
//   installed_at?: string | null;
//   is_active?: boolean;
//   last_communication_at?: string | null;
//   firmware_version?: string | null;
// };

// type AlertItem = {
//   id: string;
//   severity: "critical" | "warning" | "info" | "resolved";
//   title: string;
//   description: string;
//   vehicleLabel: string;
//   system: string;
//   ago: string;
// };

// type User = {
//   id: number;
//   name: string;
//   email: string;
//   avatarUrl?: string | null;
// };

// function fmtAgo(iso?: string | null): string {
//   if (!iso) return "—";
//   const ts = Date.parse(iso);
//   if (Number.isNaN(ts)) return "—";
//   const diff = Date.now() - ts;
//   const m = Math.floor(diff / 60000);
//   if (m < 60) return `${m}m ago`;
//   const h = Math.floor(m / 60);
//   if (h < 24) return `${h}h ago`;
//   const d = Math.floor(h / 24);
//   return `${d}d ago`;
// }

// export default function Dashboard() {
//   const [devices, setDevices] = useState<OBDDevice[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");

//   const [socByDeviceId, setSocByDeviceId] = useState<Record<number, number | null>>({});

//   // ---- User state ----
//   const [user, setUser] = useState<User | null>(null);

//   // fetch profile from login API
//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await fetch("/api/auth/me", { credentials: "include" });
//         if (!res.ok) throw new Error("Failed to load profile");
//         const data = await res.json();
//         setUser(data);
//       } catch {
//         setUser(null);
//       }
//     })();
//   }, []);

//   // logout handler
//   const handleLogout = async () => {
//     try {
//       await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
//     } finally {
//       setUser(null);
//       window.location.href = "/login"; // redirect to login page
//     }
//   };

//   // 1) Load devices
//   useEffect(() => {
//     (async () => {
//       try {
//         const data = await listOBDDevices();
//         const results: OBDDevice[] = Array.isArray(data?.results) ? data.results : (data ?? []);
//         setDevices(results);
//       } catch (e: any) {
//         setErr(
//           e?.response?.data?.message ||
//             e?.response?.data?.detail ||
//             e?.message ||
//             "Failed to load OBD devices"
//         );
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   // 2) Load SoC
//   useEffect(() => {
//     (async () => {
//       if (!devices.length) return;
//       const subset = devices.slice(0, 10);
//       const updates: Record<number, number | null> = {};
//       await Promise.all(
//         subset.map(async (d) => {
//           try {
//             const m = await getDeviceMetrics(d.id);
//             updates[d.id] = typeof m?.soc_percent === "number" ? m.soc_percent : null;
//           } catch {
//             updates[d.id] = null;
//           }
//         })
//       );
//       if (Object.keys(updates).length) {
//         setSocByDeviceId((prev) => ({ ...prev, ...updates }));
//       }
//     })();
//   }, [devices]);

//   // 3) Derive UI numbers
//   const {
//     totalDevices,
//     activeDevices,
//     withSim,
//     reportingRecently,
//     alerts,
//     alertsCount,
//     selectedDevice,
//     averageSocPercent,
//   } = useMemo(() => {
//     const now = Date.now();
//     const RECENT_MS = 24 * 60 * 60 * 1000;
//     const STALE_MS = 72 * 60 * 60 * 1000;

//     const total = devices.length;
//     const active = devices.filter((d) => d.is_active).length;
//     const sims = devices.filter((d) => !!d.sim_card).length;

//     const recent = devices.filter((d) => {
//       const ts = d.last_communication_at ? Date.parse(d.last_communication_at) : NaN;
//       return !Number.isNaN(ts) && now - ts <= RECENT_MS;
//     }).length;

//     const built: AlertItem[] = [];
//     devices.forEach((d) => {
//       const vehicleLabel = d.device_id || `Device-${d.id}`;
//       const ts = d.last_communication_at ? Date.parse(d.last_communication_at) : NaN;
//       const isStale = Number.isNaN(ts) || now - ts > STALE_MS;

//       if (isStale) {
//         built.push({
//           id: `stale-${d.id}`,
//           severity: "critical",
//           title: "Device Communication Stale",
//           description: "No recent telemetry (>72h). Check power/connectivity.",
//           vehicleLabel,
//           system: "Telematics",
//           ago: fmtAgo(d.last_communication_at),
//         });
//       }

//       if (!d.sim_card) {
//         built.push({
//           id: `nosim-${d.id}`,
//           severity: "warning",
//           title: "No SIM Assigned",
//           description: "Device has no SIM; data upload may fail.",
//           vehicleLabel,
//           system: "Connectivity",
//           ago: fmtAgo(d.last_communication_at),
//         });
//       } else {
//         const used = d.sim_card.current_data_used_gb ?? 0;
//         const limit = d.sim_card.plan_data_limit_gb ?? 0;
//         const pct = limit > 0 ? used / limit : 0;
//         const thresh = d.sim_card.overage_threshold ?? 0.9;
//         if (limit > 0 && pct >= thresh) {
//           built.push({
//             id: `data-${d.id}`,
//             severity: "warning",
//             title: "High SIM Data Usage",
//             description: `Usage at ${(pct * 100).toFixed(0)}% of plan.`,
//             vehicleLabel,
//             system: "Connectivity",
//             ago: fmtAgo(d.sim_card.last_activity ?? d.last_communication_at),
//           });
//         }
//       }
//     });

//     const pick = devices.find((d) => d.is_active) || devices[0];

//     const socValues = devices
//       .map((d) => socByDeviceId[d.id])
//       .filter((v): v is number => typeof v === "number");
//     const avgSoc = socValues.length
//       ? Math.round(socValues.reduce((a, b) => a + b, 0) / socValues.length)
//       : null;

//     return {
//       totalDevices: total,
//       activeDevices: active,
//       withSim: sims,
//       reportingRecently: recent,
//       alerts: built,
//       alertsCount: built.length,
//       selectedDevice: pick,
//       averageSocPercent: avgSoc,
//     };
//   }, [devices, socByDeviceId]);

//   return (
//     <AuthGuard>
//       <SidebarProvider>
//         <SidebarInset>
//           {/* ===== Header ===== */}
//           <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white">
//             <SidebarTrigger className="-ml-1" />
//             <Separator orientation="vertical" className="mr-2 h-4" />
//             <div className="flex-1">
//               <h1 className="font-semibold text-gray-900">Fleet Dashboard</h1>
//               <p className="text-sm text-gray-500">Real-time diagnostics and fleet management</p>
//             </div>
//             <div className="flex items-center gap-2">
//               <Button variant="ghost" size="sm" className="relative" title="Alerts">
//                 <Bell className="w-4 h-4" />
//                 <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center">
//                   {alertsCount}
//                 </Badge>
//               </Button>
//               <Button variant="ghost" size="sm" title="Settings">
//                 <Settings className="w-4 h-4" />
//               </Button>

//               {/* ---- User Dropdown ---- */}
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Avatar className="h-8 w-8 cursor-pointer">
//                     {user?.avatarUrl ? (
//                       <AvatarImage src={user.avatarUrl} alt={user.name} />
//                     ) : (
//                       <AvatarFallback>
//                         {user?.name?.[0] ?? <UserIcon className="h-4 w-4" />}
//                       </AvatarFallback>
//                     )}
//                   </Avatar>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end" className="w-56">
//                   <DropdownMenuLabel>
//                     {user ? (
//                       <div>
//                         <p className="font-medium">{user.name}</p>
//                         <p className="text-xs text-gray-500">{user.email}</p>
//                       </div>
//                     ) : (
//                       "Not logged in"
//                     )}
//                   </DropdownMenuLabel>
//                   <DropdownMenuSeparator />
//                   {user ? (
//                     <DropdownMenuItem onClick={handleLogout}>
//                       <LogOut className="mr-2 h-4 w-4" /> Logout
//                     </DropdownMenuItem>
//                   ) : (
//                     <DropdownMenuItem asChild>
//                       <a href="/login">
//                         <UserIcon className="mr-2 h-4 w-4" /> Login
//                       </a>
//                     </DropdownMenuItem>
//                   )}
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>
//           </header>

//           {/* ===== Main Content ===== */}
//           <div className="flex-1 space-y-6 p-6 bg-gray-50">
//             <section>
//               <h2 className="text-lg font-semibold text-gray-900 mb-4">Fleet Overview</h2>
//               <FleetKPIBar
//                 loading={loading}
//                 vehiclesOnline={reportingRecently}
//                 totalVehicles={totalDevices}
//                 criticalAlerts={alertsCount}
//                 averageSocPercent={averageSocPercent}
//                 maintenanceTickets={null}
//                 trendOnline="up"
//                 changeOnline="+2.3%"
//                 trendCritical="down"
//                 changeCritical="-1"
//                 trendSoc={averageSocPercent !== null ? "up" : "stable"}
//                 changeSoc={averageSocPercent !== null ? "+5.2%" : ""}
//                 trendMaint="stable"
//                 changeMaint="0"
//               />
//             </section>

//             <section>
//               <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                 Live Telemetry – {selectedDevice?.device_id ?? "Select a Device"}
//               </h2>
//               <TelemetryWidget selectedDeviceId={selectedDevice?.device_id} devices={devices} loading={loading} error={err} />
//             </section>

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//               <div className="lg:col-span-1">
//                 <AlertsTimeline loading={loading} error={err} alerts={alerts} />
//               </div>
//               <div className="lg:col-span-2">
//                 <VehiclesTable loading={loading} error={err} rows={devices} />
//               </div>
//             </div>

//             {!loading && !err && (
//               <details className="mt-2">
//                 <summary className="cursor-pointer text-sm text-gray-500">
//                   Debug: {devices.length} device(s) loaded
//                 </summary>
//                 <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-white p-3 text-xs">
//                   {JSON.stringify(devices, null, 2)}
//                 </pre>
//               </details>
//             )}
//           </div>
//         </SidebarInset>
//       </SidebarProvider>
//     </AuthGuard>
//   );
// }
// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only run after component is mounted and auth is loaded
    if (!mounted || loading) return;
    
    // Check if user is authenticated
    if (user && user.token) {
      // User is authenticated, redirect to dashboard
      router.push("/dashboard");
    } else {
      // User is not authenticated, redirect to login
      router.push("/login");
    }
  }, [user, loading, router, mounted]);

  // Show loading while checking authentication or not mounted
  if (!mounted || loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    );
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen grid place-items-center">
      <div className="animate-pulse text-gray-600">Redirecting...</div>
    </div>
  );
}

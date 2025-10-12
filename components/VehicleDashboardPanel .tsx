// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
//   Area,
// } from "recharts";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";
// import { getVehicleHistory } from "@/lib/api";

// type TelemetryKey =
//   | "motor_temp_c"
//   | "battery_level_percent"
//   | "speed_kph"
//   | "range_km"
//   | "battery_power_kw"
//   | "tire_pressure_kpa"
//   | "torque_nm";

// const chartDefinitions: { key: TelemetryKey; title: string; color: string }[] = [
//   { key: "motor_temp_c", title: "Motor Temp (°C)", color: "#3b82f6" },
//   { key: "battery_level_percent", title: "Battery %", color: "#16a34a" },
//   { key: "speed_kph", title: "Speed (km/h)", color: "#f97316" },
//   { key: "range_km", title: "Range (km)", color: "#8b5cf6" },
//   { key: "battery_power_kw", title: "Battery Power (kW)", color: "#06b6d4" },
//   { key: "tire_pressure_kpa", title: "Tire Pressure (kPa)", color: "#ef4444" },
//   { key: "torque_nm", title: "Torque (Nm)", color: "#eab308" },
// ];

// type Filters = {
//   date_range: "today" | "10days" | "30days" | "90days";
//   start_date?: string;
//   end_date?: string;
//   visualization: TelemetryKey[];
//   category?: TelemetryKey | "all";
//   chart_points: number;
//   max_points: number;
//   include_details: boolean;
//   include_raw: boolean;
// };

// export default function VehicleDashboardPanel({ vehicleId }: { vehicleId: number }) {
//   const [filters, setFilters] = useState<Filters>({
//     date_range: "30days",
//     start_date: undefined,
//     end_date: undefined,
//     visualization: chartDefinitions.map((c) => c.key),
//     category: "all",
//     chart_points: 7,
//     max_points: 100,
//     include_details: true,
//     include_raw: false,
//   });
//   const [loading, setLoading] = useState(false);
//   const [data, setData] = useState<any | null>(null);

//   const selectedKeys = useMemo(() => {
//     if (filters.category && filters.category !== "all") return [filters.category as TelemetryKey];
//     return filters.visualization;
//   }, [filters.category, filters.visualization]);

//   useEffect(() => {
//     let cancelled = false;
//     async function run() {
//       if (!vehicleId) return;
//       setLoading(true);
//       try {
//         const resp = await getVehicleHistory(vehicleId, {
//           date_range: filters.date_range,
//           start_date: filters.start_date,
//           end_date: filters.end_date,
//           visualization: selectedKeys,
//           category: filters.category && filters.category !== "all" ? filters.category : undefined,
//           chart_points: filters.chart_points,
//           max_points: filters.max_points,
//           include_details: filters.include_details,
//           include_raw: filters.include_raw,
//         });
//         if (!cancelled) setData(resp);
//       } catch (e) {
//         console.error(e);
//         if (!cancelled) setData(null);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     }
//     run();
//     return () => {
//       cancelled = true;
//     };
//   }, [
//     vehicleId,
//     filters.date_range,
//     filters.start_date,
//     filters.end_date,
//     filters.chart_points,
//     filters.max_points,
//     filters.include_details,
//     filters.include_raw,
//     selectedKeys.join("|"),
//   ]);

//   function toggleKey(k: TelemetryKey) {
//     setFilters((f) => {
//       if (f.category && f.category !== "all") return f;
//       const has = f.visualization.includes(k);
//       const next = has ? f.visualization.filter((x) => x !== k) : [...f.visualization, k];
//       return { ...f, visualization: next };
//     });
//   }

//   function showAll() {
//     setFilters((f) => ({ ...f, category: "all", visualization: chartDefinitions.map((c) => c.key) }));
//   }

//   // Merge series by time_label
//   const mergedSeries = useMemo(() => {
//     const ts = data?.time_series_charts ?? {};
//     const keys = selectedKeys;
//     const times = new Set<string>();
//     keys.forEach((k) => {
//       (ts[k] ?? []).forEach((pt: any) => times.add(pt.time_label));
//     });
//     const timeline = Array.from(times).sort();
//     return timeline.map((t) => {
//       const row: any = { time: t };
//       keys.forEach((k) => {
//         const arr = ts[k] ?? [];
//         const found = arr.find((pt: any) => pt.time_label === t);
//         row[k] = found ? found.value : null;
//       });
//       return row;
//     });
//   }, [data, selectedKeys]);

//   const vehicle = data?.vehicle;
//   const stats = data?.stats;

//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle>Vehicle Dashboard</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {/* Filters */}
//           <div className="flex flex-wrap items-end gap-3">
//             <div className="flex items-center gap-2">
//               <Label className="text-sm">Date Range</Label>
//               <Select
//                 value={filters.date_range}
//                 onValueChange={(val: Filters["date_range"]) =>
//                   setFilters((f) => ({ ...f, date_range: val, start_date: undefined, end_date: undefined }))
//                 }
//               >
//                 <SelectTrigger className="w-36">
//                   <SelectValue placeholder="Date Range" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="today">Today</SelectItem>
//                   <SelectItem value="10days">10 days</SelectItem>
//                   <SelectItem value="30days">30 days</SelectItem>
//                   <SelectItem value="90days">90 days</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="flex items-center gap-2">
//               <div>
//                 <Label className="text-sm">Start (ISO)</Label>
//                 <Input
//                   placeholder="2025-09-01T00:00:00Z"
//                   value={filters.start_date ?? ""}
//                   onChange={(e) =>
//                     setFilters((f) => ({ ...f, start_date: e.target.value || undefined }))
//                   }
//                   className="w-56"
//                 />
//               </div>
//               <div>
//                 <Label className="text-sm">End (ISO)</Label>
//                 <Input
//                   placeholder="2025-09-10T23:59:59Z"
//                   value={filters.end_date ?? ""}
//                   onChange={(e) =>
//                     setFilters((f) => ({ ...f, end_date: e.target.value || undefined }))
//                   }
//                   className="w-56"
//                 />
//               </div>
//             </div>

//             <div className="flex items-center gap-2">
//               <Label className="text-sm">Category</Label>
//               <Select
//                 value={filters.category ?? "all"}
//                 onValueChange={(val: any) =>
//                   setFilters((f) => ({ ...f, category: val as any }))
//                 }
//               >
//                 <SelectTrigger className="w-48">
//                   <SelectValue placeholder="Metric category" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All</SelectItem>
//                   {chartDefinitions.map((c) => (
//                     <SelectItem key={c.key} value={c.key}>
//                       {c.title}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="flex items-center gap-2">
//               <div>
//                 <Label className="text-sm">Chart points</Label>
//                 <Input
//                   type="number"
//                   min={1}
//                   max={200}
//                   value={filters.chart_points}
//                   onChange={(e) =>
//                     setFilters((f) => ({ ...f, chart_points: Number(e.target.value || 7) }))
//                   }
//                   className="w-28"
//                 />
//               </div>
//               <div>
//                 <Label className="text-sm">Max points</Label>
//                 <Input
//                   type="number"
//                   min={10}
//                   max={1000}
//                   value={filters.max_points}
//                   onChange={(e) =>
//                     setFilters((f) => ({ ...f, max_points: Number(e.target.value || 100) }))
//                   }
//                   className="w-28"
//                 />
//               </div>
//             </div>

//             <div className="flex items-center gap-4">
//               <label className="flex items-center gap-2">
//                 <Checkbox
//                   checked={filters.include_details}
//                   onCheckedChange={(v) =>
//                     setFilters((f) => ({ ...f, include_details: Boolean(v) }))
//                   }
//                 />
//                 <span className="text-sm">Include details</span>
//               </label>
//               <label className="flex items-center gap-2">
//                 <Checkbox
//                   checked={filters.include_raw}
//                   onCheckedChange={(v) =>
//                     setFilters((f) => ({ ...f, include_raw: Boolean(v) }))
//                   }
//                 />
//                 <span className="text-sm">Include raw</span>
//               </label>
//             </div>

//             <div className="ml-auto flex items-center gap-2">
//               <Button
//                 variant="outline"
//                 onClick={() =>
//                   setFilters({
//                     date_range: "30days",
//                     start_date: undefined,
//                     end_date: undefined,
//                     visualization: chartDefinitions.map((c) => c.key),
//                     category: "all",
//                     chart_points: 7,
//                     max_points: 100,
//                     include_details: true,
//                     include_raw: false,
//                   })
//                 }
//               >
//                 Reset
//               </Button>
//               <Button onClick={() => setFilters((f) => ({ ...f }))}>Apply</Button>
//             </div>
//           </div>

//           {/* Telemetry toggles */}
//           <div className="flex flex-wrap items-center gap-3">
//             <Button variant="secondary" onClick={showAll}>
//               Show All
//             </Button>
//             {chartDefinitions.map((c) => {
//               const locked = filters.category && filters.category !== "all";
//               const checked = locked ? (filters.category === c.key) : filters.visualization.includes(c.key);
//               return (
//                 <label key={c.key} className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200">
//                   <Checkbox
//                     disabled={locked}
//                     checked={checked}
//                     onCheckedChange={() => toggleKey(c.key)}
//                   />
//                   <span className="text-sm" style={{ color: c.color }}>{c.title}</span>
//                 </label>
//               );
//             })}
//           </div>

//           {/* Header */}
//           <div className="flex items-center justify-between">
//             <div>
//               <div className="text-sm text-gray-600">VIN</div>
//               <div className="text-lg font-semibold">{vehicle?.vin ?? "—"}</div>
//               {data?.date_filter && (
//                 <div className="text-xs text-gray-500">
//                   {data?.date_filter?.start_date?.split("T")[0]} → {data?.date_filter?.end_date?.split("T")[0]}
//                 </div>
//               )}
//             </div>
//             <div className="text-right">
//               <div className="text-sm text-gray-600">Battery Level</div>
//               <div className="text-2xl font-bold text-blue-700">{stats?.battery_level ?? "—"}%</div>
//             </div>
//           </div>

//           {/* Stats */}
//           {filters.include_details && (
//             <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
//               <StatCard color="from-green-50 to-green-100" label="Max Speed" value={`${stats?.max_speed_kph ?? "—"} km/h`} />
//               <StatCard color="from-blue-50 to-blue-100" label="Avg Range" value={`${stats?.avg_range_km?.toFixed?.(2) ?? "—"} km`} />
//               <StatCard color="from-red-50 to-pink-100" label="Error Count" value={stats?.error_count ?? "—"} />
//               <StatCard color="from-purple-50 to-fuchsia-100" label="Trip Count" value={stats?.trip_count ?? "—"} />
//               <StatCard color="from-orange-50 to-amber-100" label="Distance" value={`${stats?.distance_km ?? "—"} km`} />
//               <StatCard color="from-teal-50 to-cyan-100" label="Battery" value={`${stats?.battery_level ?? "—"}%`} />
//             </div>
//           )}

//           {/* Multi-series chart */}
//           <div className="bg-white p-4 rounded-xl border border-gray-200">
//             <ResponsiveContainer width="100%" height={380}>
//               <LineChart data={mergedSeries}>
//                 <defs>
//                   {selectedKeys.map((k) => {
//                     const color = chartDefinitions.find((c) => c.key === k)?.color ?? "#3b82f6";
//                     return (
//                       <linearGradient key={k} id={`color-${k}`} x1="0" y1="0" x2="0" y2="1">
//                         <stop offset="5%" stopColor={color} stopOpacity={0.35} />
//                         <stop offset="95%" stopColor={color} stopOpacity={0} />
//                       </linearGradient>
//                     );
//                   })}
//                 </defs>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                 <XAxis dataKey="time" stroke="#6b7280" />
//                 <YAxis stroke="#6b7280" />
//                 <Tooltip
//                   contentStyle={{
//                     backgroundColor: "white",
//                     borderRadius: "8px",
//                     border: "1px solid #e5e7eb",
//                   }}
//                 />
//                 {selectedKeys.map((k) => {
//                   const color = chartDefinitions.find((c) => c.key === k)?.color ?? "#3b82f6";
//                   return (
//                     <React.Fragment key={k}>
//                       <Line
//                         type="monotone"
//                         dataKey={k}
//                         stroke={color}
//                         strokeWidth={2.5}
//                         dot={false}
//                         connectNulls
//                         activeDot={{ r: 5, stroke: "#1e40af", strokeWidth: 2 }}
//                       />
//                       <Area dataKey={k} stroke="none" fill={`url(#color-${k})`} />
//                     </React.Fragment>
//                   );
//                 })}
//               </LineChart>
//             </ResponsiveContainer>
//           </div>

//           {/* Raw telemetry */}
//           {filters.include_raw && Array.isArray(data?.raw) && data.raw.length > 0 && (
//             <div className="space-y-2">
//               <div className="text-sm font-semibold">Raw Telemetry (first {Math.min(100, data.raw.length)})</div>
//               <div className="overflow-auto border rounded-md">
//                 <table className="w-full text-sm">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-3 py-2 text-left">Time</th>
//                       {chartDefinitions.map((c) => (
//                         <th key={c.key} className="px-3 py-2 text-left">{c.title}</th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {data.raw.slice(0, 100).map((r: any, idx: number) => (
//                       <tr key={idx} className="border-t">
//                         <td className="px-3 py-2">{r.time_label ?? r.timestamp ?? "—"}</td>
//                         {chartDefinitions.map((c) => (
//                           <td key={c.key} className="px-3 py-2">{r[c.key] ?? "—"}</td>
//                         ))}
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
//   return (
//     <div className={`bg-gradient-to-br ${color} text-gray-800 p-4 rounded-xl border border-gray-200 flex flex-col items-center`}>
//       <p className="text-sm text-gray-600">{label}</p>
//       <p className="text-lg font-bold">{value}</p>
//     </div>
//   );
// }
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { getVehicleHistory } from "@/lib/api";

type TelemetryKey =
  | "motor_temp_c"
  | "battery_level_percent"
  | "speed_kph"
  | "range_km"
  | "battery_power_kw"
  | "tire_pressure_kpa"
  | "torque_nm";

const chartDefinitions: { key: TelemetryKey; title: string; color: string }[] = [
  { key: "motor_temp_c", title: "Motor Temp (°C)", color: "#3b82f6" },
  { key: "battery_level_percent", title: "Battery %", color: "#16a34a" },
  { key: "speed_kph", title: "Speed (km/h)", color: "#f97316" },
  { key: "range_km", title: "Range (km)", color: "#8b5cf6" },
  { key: "battery_power_kw", title: "Battery Power (kW)", color: "#06b6d4" },
  { key: "tire_pressure_kpa", title: "Tire Pressure (kPa)", color: "#ef4444" },
  { key: "torque_nm", title: "Torque (Nm)", color: "#eab308" },
];

type Filters = {
  date_range: "today" | "10days" | "30days" | "90days";
  start_date?: string;
  end_date?: string;
  visualization: TelemetryKey[];
  category?: TelemetryKey | "all";
  chart_points: number;
  max_points: number;
  include_details: boolean;
  include_raw: boolean;
};

const INITIAL_FILTERS: Filters = {
  date_range: "30days",
  start_date: undefined,
  end_date: undefined,
  visualization: chartDefinitions.map((c) => c.key),
  category: "all",
  chart_points: 7,
  max_points: 100,
  include_details: true,
  include_raw: false,
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function toISODate(d: Date) {
  return new Date(d.getTime()).toISOString();
}

function startOfTodayUTC(now = (typeof window !== 'undefined' ? new Date() : new Date(0))) {
  const d = new Date(now);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function normalizeByDateRange(filters: Filters, now = (typeof window !== 'undefined' ? new Date() : new Date(0))): Filters {
  // If explicit start/end provided, honor them; else compute from preset
  if (filters.start_date || filters.end_date) {
    return {
      ...filters,
      chart_points: clamp(filters.chart_points, 1, 200),
      max_points: clamp(filters.max_points, 10, 1000),
    };
  }

  const range = filters.date_range;
  let start: Date;
  let end: Date = now;

  if (range === "today") {
    start = startOfTodayUTC(now);
  } else {
    const days = range === "10days" ? 10 : range === "30days" ? 30 : 90;
    start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  }

  return {
    ...filters,
    start_date: toISODate(start),
    end_date: toISODate(end),
    chart_points: clamp(filters.chart_points, 1, 200),
    max_points: clamp(filters.max_points, 10, 1000),
  };
}

export default function VehicleDashboardPanel({ vehicleId }: { vehicleId: number }) {
  // Draft filters for UI
  const [draft, setDraft] = useState<Filters>(INITIAL_FILTERS);

  // Applied filters for fetching/rendering
  const [applied, setApplied] = useState<Filters>(INITIAL_FILTERS);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any | null>(null);

  // Selected keys come from APPLIED filters to ensure charts reflect last Apply
  const selectedKeys = useMemo(() => {
    if (applied.category && applied.category !== "all") return [applied.category as TelemetryKey];
    return applied.visualization;
  }, [applied.category, applied.visualization]);

  // Fetch when applied filters change
  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!vehicleId) return;
      setLoading(true);
      try {
        const normalized = normalizeByDateRange(applied);
        const resp = await getVehicleHistory(vehicleId, {
          date_range: normalized.date_range,
          start_date: normalized.start_date,
          end_date: normalized.end_date,
          visualization: selectedKeys,
          category:
            normalized.category && normalized.category !== "all" ? normalized.category : undefined,
          chart_points: normalized.chart_points,
          max_points: normalized.max_points,
          include_details: normalized.include_details,
          include_raw: normalized.include_raw,
        });
        if (!cancelled) setData(resp);
      } catch (e) {
        console.error(e);
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [vehicleId, applied, selectedKeys]);

  // Toggle a metric in DRAFT only; Apply will commit
  const toggleKey = useCallback((k: TelemetryKey) => {
    setDraft((f) => {
      if (f.category && f.category !== "all") return f;
      const has = f.visualization.includes(k);
      const next = has ? f.visualization.filter((x) => x !== k) : [...f.visualization, k];
      return { ...f, visualization: next };
    });
  }, []);

  const showAll = useCallback(() => {
    setDraft((f) => ({ ...f, category: "all", visualization: chartDefinitions.map((c) => c.key) }));
  }, []);

  const apply = useCallback(() => {
    setApplied((prev) => {
      // Prevent unnecessary fetch if nothing changed
      const next = normalizeByDateRange(draft);
      return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
    });
  }, [draft]);

  const reset = useCallback(() => {
    setDraft(INITIAL_FILTERS);
    setApplied(INITIAL_FILTERS);
  }, []);

  // Merge series by time_label with chronological sort
  const mergedSeries = useMemo(() => {
    const ts = data?.time_series_charts ?? {};
    const keys = selectedKeys;

    // Build index map for each key: time_label -> value
    const perKeyIndex: Record<string, Map<string, number>> = {};
    const allTimes = new Set<string>();

    keys.forEach((k) => {
      const arr = (ts[k] ?? []) as Array<{ time_label: string; value: number }>;
      const map = new Map<string, number>();
      arr.forEach((pt) => {
        map.set(pt.time_label, pt.value);
        allTimes.add(pt.time_label);
      });
      perKeyIndex[k] = map;
    });

    // Sort by chronological order if ISO date strings; fallback to lexicographic
    const timeline = Array.from(allTimes).sort((a, b) => {
      const da = Date.parse(a);
      const db = Date.parse(b);
      if (Number.isFinite(da) && Number.isFinite(db)) return da - db;
      return a.localeCompare(b);
    });

    return timeline.map((t) => {
      const row: any = { time: t };
      keys.forEach((k) => {
        const v = perKeyIndex[k]?.get(t);
        row[k] = typeof v === "number" ? v : null;
      });
      return row;
    });
  }, [data, selectedKeys]);

  const vehicle = data?.vehicle;
  const stats = data?.stats;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Date Range</Label>
              <Select
                value={draft.date_range}
                onValueChange={(val: Filters["date_range"]) =>
                  setDraft((f) => ({ ...f, date_range: val, start_date: undefined, end_date: undefined }))
                }
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="10days">10 days</SelectItem>
                  <SelectItem value="30days">30 days</SelectItem>
                  <SelectItem value="90days">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <div>
                <Label className="text-sm">Start (ISO)</Label>
                <Input
                  placeholder="2025-09-01T00:00:00Z"
                  value={draft.start_date ?? ""}
                  onChange={(e) =>
                    setDraft((f) => ({ ...f, start_date: e.target.value || undefined }))
                  }
                  className="w-56"
                />
              </div>
              <div>
                <Label className="text-sm">End (ISO)</Label>
                <Input
                  placeholder="2025-09-10T23:59:59Z"
                  value={draft.end_date ?? ""}
                  onChange={(e) =>
                    setDraft((f) => ({ ...f, end_date: e.target.value || undefined }))
                  }
                  className="w-56"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-sm">Category</Label>
              <Select
                value={draft.category ?? "all"}
                onValueChange={(val: any) => setDraft((f) => ({ ...f, category: val as any }))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Metric category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {chartDefinitions.map((c) => (
                    <SelectItem key={c.key} value={c.key}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <div>
                <Label className="text-sm">Chart points</Label>
                <Input
                  type="number"
                  min={1}
                  max={200}
                  value={draft.chart_points}
                  onChange={(e) =>
                    setDraft((f) => ({ ...f, chart_points: Number(e.target.value || 7) }))
                  }
                  className="w-28"
                />
              </div>
              <div>
                <Label className="text-sm">Max points</Label>
                <Input
                  type="number"
                  min={10}
                  max={1000}
                  value={draft.max_points}
                  onChange={(e) =>
                    setDraft((f) => ({ ...f, max_points: Number(e.target.value || 100) }))
                  }
                  className="w-28"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={draft.include_details}
                  onCheckedChange={(v) => setDraft((f) => ({ ...f, include_details: Boolean(v) }))}
                />
                <span className="text-sm">Include details</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={draft.include_raw}
                  onCheckedChange={(v) => setDraft((f) => ({ ...f, include_raw: Boolean(v) }))}
                />
                <span className="text-sm">Include raw</span>
              </label>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" onClick={reset}>
                Reset
              </Button>
              <Button onClick={apply} disabled={loading}>
                Apply
              </Button>
            </div>
          </div>

          {/* Telemetry toggles */}
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={showAll}>
              Show All
            </Button>
            {chartDefinitions.map((c) => {
              const locked = draft.category && draft.category !== "all";
              const checked = locked ? draft.category === c.key : draft.visualization.includes(c.key);
              return (
                <label
                  key={c.key}
                  className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200"
                >
                  <Checkbox disabled={locked} checked={checked} onCheckedChange={() => toggleKey(c.key)} />
                  <span className="text-sm" style={{ color: c.color }}>
                    {c.title}
                  </span>
                </label>
              );
            })}
          </div>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">VIN</div>
              <div className="text-lg font-semibold">{vehicle?.vin ?? "—"}</div>
              {data?.date_filter && (
                <div className="text-xs text-gray-500">
                  {data?.date_filter?.start_date?.split("T")[0]} → {data?.date_filter?.end_date?.split("T")[0]}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Battery Level</div>
              <div className="text-2xl font-bold text-blue-700">{stats?.battery_level ?? "—"}%</div>
            </div>
          </div>

          {/* Stats */}
          {applied.include_details && (
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard color="from-green-50 to-green-100" label="Max Speed" value={`${stats?.max_speed_kph ?? "—"} km/h`} />
              <StatCard color="from-blue-50 to-blue-100" label="Avg Range" value={`${stats?.avg_range_km?.toFixed?.(2) ?? "—"} km`} />
              <StatCard color="from-red-50 to-pink-100" label="Error Count" value={stats?.error_count ?? "—"} />
              <StatCard color="from-purple-50 to-fuchsia-100" label="Trip Count" value={stats?.trip_count ?? "—"} />
              <StatCard color="from-orange-50 to-amber-100" label="Distance" value={`${stats?.distance_km ?? "—"} km`} />
              <StatCard color="from-teal-50 to-cyan-100" label="Battery" value={`${stats?.battery_level ?? "—"}%`} />
            </div>
          )}

          {/* Multi-series chart */}
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={mergedSeries}>
                <defs>
                  {selectedKeys.map((k) => {
                    const color = chartDefinitions.find((c) => c.key === k)?.color ?? "#3b82f6";
                    return (
                      <linearGradient key={k} id={`color-${k}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    );
                  })}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                />
                {selectedKeys.map((k) => {
                  const color = chartDefinitions.find((c) => c.key === k)?.color ?? "#3b82f6";
                  return (
                    <React.Fragment key={k}>
                      <Line
                        type="monotone"
                        dataKey={k}
                        stroke={color}
                        strokeWidth={2.5}
                        dot={false}
                        connectNulls
                        activeDot={{ r: 5, stroke: "#1e40af", strokeWidth: 2 }}
                      />
                      <Area dataKey={k} stroke="none" fill={`url(#color-${k})`} />
                    </React.Fragment>
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
            {loading && <div className="text-sm text-gray-500 mt-2">Loading…</div>}
            {!loading && mergedSeries.length === 0 && (
              <div className="text-sm text-gray-500 mt-2">No data for the selected filters</div>
            )}
          </div>

          {/* Raw telemetry */}
          {applied.include_raw && Array.isArray(data?.raw) && data.raw.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-semibold">
                Raw Telemetry (first {Math.min(100, data.raw.length)})
              </div>
              <div className="overflow-auto border rounded-md">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Time</th>
                      {chartDefinitions.map((c) => (
                        <th key={c.key} className="px-3 py-2 text-left">
                          {c.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.raw.slice(0, 100).map((r: any, idx: number) => (
                      <tr key={idx} className="border-t">
                        <td className="px-3 py-2">{r.time_label ?? r.timestamp ?? "—"}</td>
                        {chartDefinitions.map((c) => (
                          <td key={c.key} className="px-3 py-2">
                            {r[c.key] ?? "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div
      className={`bg-gradient-to-br ${color} text-gray-800 p-4 rounded-xl border border-gray-200 flex flex-col items-center`}
    >
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

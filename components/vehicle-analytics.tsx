// components/vehicle-analytics.tsx
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
  Legend,
} from "recharts";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getVehicleHistory } from "@/lib/api";

// UI keys -> API series keys
const SERIES: Record<string, { key: string; label: string; color: string }> = {
  motor_temperature: { key: "motor_temp_c", label: "Motor Temp", color: "#3b82f6" },
  battery_level: { key: "battery_level_percent", label: "Battery %", color: "#16a34a" },
  speed: { key: "speed_kph", label: "Speed", color: "#f97316" },
  range: { key: "range_km", label: "Range", color: "#8b5cf6" },
  power: { key: "battery_power_kw", label: "Power", color: "#06b6d4" },
  tire_pressure: { key: "tire_pressure_kpa", label: "Tire Pressure", color: "#ef4444" },
  torque: { key: "torque_nm", label: "Torque", color: "#eab308" },
};

type HistoryResponse = {
  vehicle?: { id: number; vin: string };
  date_filter?: { start_date: string; end_date: string };
  stats?: Record<string, number>;
  time_series_charts?: Record<string, Array<{ time_label: string; value: number }>>;
  details?: any;
  raw?: Array<any>;
};

export default function VehicleDashboardEmbedded({ vehicleId }: { vehicleId: number }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Guard: require a valid numeric id
  if (!Number.isFinite(vehicleId) || vehicleId <= 0) {
    return <p className="text-sm text-gray-500">No vehicle selected</p>;
  }

  // Filters with defaults
  const [dateRange, setDateRange] = useState<"today" | "10days" | "30days" | "90days">("30days");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [chartPoints, setChartPoints] = useState<number>(7);
  const [maxPoints, setMaxPoints] = useState<number>(100);
  const [includeDetails, setIncludeDetails] = useState<boolean>(false);
  const [includeRaw, setIncludeRaw] = useState<boolean>(false);
  const [category, setCategory] = useState<string>("");
  const [visualization, setVisualization] = useState<string[]>([]);

  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Hydrate filters from URL
  useEffect(() => {
    const get = (k: string) => searchParams.get(k) ?? "";
    const dr = get("date_range");
    setDateRange(dr === "today" || dr === "10days" || dr === "30days" || dr === "90days" ? (dr as any) : "30days");
    setStartDate(get("start_date"));
    setEndDate(get("end_date"));
    const cp = Number(get("chart_points"));
    setChartPoints(Number.isFinite(cp) && cp > 0 ? cp : 7);
    const mp = Number(get("max_points"));
    setMaxPoints(Number.isFinite(mp) && mp > 0 ? mp : 100);
    setIncludeDetails(get("include_details") === "true");
    setIncludeRaw(get("include_raw") === "true");
    const cat = get("category");
    setCategory(cat || "");
    const vis = searchParams.getAll("visualization");
    setVisualization(vis && vis.length ? vis.filter((k) => Object.keys(SERIES).includes(k)) : []);
  }, [searchParams]); // useSearchParams per App Router docs

  // Set default selection if none is selected
  useEffect(() => {
    if (visualization.length === 0 && !category) {
      setVisualization(["battery_level"]);
    }
  }, [visualization, category]);

  // Compose API params
  const currentParams = useMemo(() => {
    const p: any = {
      date_range: dateRange,
      chart_points: chartPoints,
      max_points: maxPoints,
      include_details: includeDetails || undefined,
      include_raw: includeRaw || undefined,
      category: category || undefined,
    };
    if (startDate) p.start_date = startDate;
    if (endDate) p.end_date = endDate;
    if (!category && visualization.length) p.visualization = visualization;
    return p;
  }, [dateRange, startDate, endDate, chartPoints, maxPoints, includeDetails, includeRaw, category, visualization]);

  // Push filters into URL
  const applyFiltersToUrl = useCallback(() => {
    const qp = new URLSearchParams();
    Object.entries(currentParams).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      if (Array.isArray(v)) v.forEach((val) => qp.append(k, String(val)));
      else qp.set(k, String(v));
    });
    router.push(`${pathname}?${qp.toString()}`);
  }, [router, pathname, currentParams]);

  // Fetch data on change
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await getVehicleHistory(vehicleId, currentParams);
      setData(resp);
    } catch (e) {
      console.error("Failed to load vehicle history", e);
    } finally {
      setLoading(false);
    }
  }, [vehicleId, currentParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Active series (category overrides)
  const seriesKeys = useMemo(() => (category && SERIES[category] ? [category] : visualization), [category, visualization]);

  const onToggleSeries = (k: string) => {
    if (category) return;
    // Only allow one selection at a time
    setVisualization([k]);
  };
  const onShowAll = () => {
    setCategory("");
    setVisualization([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(["today", "10days", "30days", "90days"] as const).map((p) => (
              <Button key={p} variant={dateRange === p ? "default" : "outline"} size="sm" onClick={() => setDateRange(p)}>
                {p}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="start_date (ISO)" />
            <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="end_date (ISO)" />
            <Input type="number" value={chartPoints} onChange={(e) => setChartPoints(Number(e.target.value))} placeholder="chart_points (default 7)" />
            <Input type="number" value={maxPoints} onChange={(e) => setMaxPoints(Number(e.target.value))} placeholder="max_points (default 100)" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={includeDetails} onChange={(e) => setIncludeDetails(e.target.checked)} />
              include_details
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={includeRaw} onChange={(e) => setIncludeRaw(e.target.checked)} />
              include_raw
            </label>
            <select className="border rounded px-2 py-1 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">category (none)</option>
              {Object.entries(SERIES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
            <Button variant="outline" onClick={applyFiltersToUrl}>
              Apply & Update URL
            </Button>
            <Button onClick={onShowAll}>Clear Selection</Button>
          </div>
          <div className="flex flex-wrap gap-1 max-w-full overflow-hidden">
            {Object.entries(SERIES).map(([k, v]) => (
              <Button
                key={k}
                variant={seriesKeys.includes(k) ? "default" : "outline"}
                size="sm"
                onClick={() => onToggleSeries(k)}
                disabled={!!category}
                className={`text-xs px-2 py-1 h-6 min-w-0 flex-shrink-0 ${category ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span className="truncate">{v.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Telemetry</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-gray-500">Loading…</p>}
          {!loading && (!data?.time_series_charts || seriesKeys.length === 0) && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 mb-2">No telemetry to display</p>
              <p className="text-xs text-gray-400">Select a metric above to view its analytics</p>
            </div>
          )}
          {!loading && data?.time_series_charts && seriesKeys.length > 0 && (
            <div className="w-full h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mergeSeries(data.time_series_charts, seriesKeys)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {seriesKeys.map((visKey) => {
                    const meta = SERIES[visKey];
                    return <Line key={visKey} type="monotone" dataKey={meta.key} name={meta.label} stroke={meta.color} dot={false} />;
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {data?.details && (
        <Card>
          <CardHeader>
            <CardTitle>Summary Details</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto">{JSON.stringify(data.details, null, 2)}</pre>
          </CardContent>
        </Card>
      )}

      {data?.raw && data.raw.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Raw Telemetry (up to 100)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="p-2">Timestamp</th>
                    <th className="p-2">Speed</th>
                    <th className="p-2">Battery %</th>
                    <th className="p-2">Range</th>
                    <th className="p-2">Motor Temp</th>
                    <th className="p-2">Power</th>
                    <th className="p-2">Tire Pressure</th>
                    <th className="p-2">Torque</th>
                  </tr>
                </thead>
                <tbody>
                  {data.raw.slice(0, 100).map((r: any, i: number) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{r.timestamp}</td>
                      <td className="p-2">{r.speed_kph ?? "—"}</td>
                      <td className="p-2">{r.battery_level_percent ?? "—"}</td>
                      <td className="p-2">{r.range_km ?? "—"}</td>
                      <td className="p-2">{r.motor_temp_c ?? "—"}</td>
                      <td className="p-2">{r.battery_power_kw ?? "—"}</td>
                      <td className="p-2">{r.tire_pressure_kpa ?? "—"}</td>
                      <td className="p-2">{r.torque_nm ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Merge series into a single dataset for Recharts
function mergeSeries(
  timeSeriesCharts: Record<string, Array<{ time_label: string; value: number }>>,
  visKeys: string[]
) {
  const timeMap = new Map<string, any>();
  visKeys.forEach((vk) => {
    const sKey = SERIES[vk].key;
    const arr = timeSeriesCharts[sKey] || [];
    arr.forEach((pt) => {
      const t = pt.time_label;
      const row = timeMap.get(t) || { time: t };
      row[sKey] = pt.value;
      timeMap.set(t, row);
    });
  });
  const rows = Array.from(timeMap.values());
  rows.sort((a, b) => (a.time > b.time ? 1 : a.time < b.time ? -1 : 0));
  return rows;
}

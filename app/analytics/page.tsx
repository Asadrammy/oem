"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts"

type FleetSummary = {
  total_distance_travelled_km?: number
  average_battery_level?: number
  online_vehicles?: number
  total_vehicles?: number
  obd_metrics?: { average_speed_kph?: number; vehicles_reporting_errors?: number }
}
type Vehicle = { id: number; make?: string; model?: string; license_plate?: string; efficiency_km_per_kwh?: number | null }
type VehiclesResponse = { results?: Vehicle[] }
type AlertItem = { id: number; alert_type?: string | null; system?: string | null; title?: string | null }
type AlertsResponse = { results?: AlertItem[] }
type TelemetryRow = { timestamp: string; battery_level_percent?: number | null; speed_kph?: number | null }
type TelemetryResponse = { results?: TelemetryRow[] }

type DebugEntry<T = unknown> = {
  url: string
  status: number
  ok: boolean
  json?: T | null
  text?: string | null
}

const rawBase = process.env.NEXT_PUBLIC_API_BASE || ""
const API_BASE = rawBase.replace(/\/+$/, "")

function getAuthHeader() {
  const envToken = process.env.NEXT_PUBLIC_API_TOKEN
  const lsToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
  const token = envToken || lsToken
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function fetchDebug<T>(url: string): Promise<DebugEntry<T>> {
  const res = await fetch(url, { headers: { ...getAuthHeader() } })
  const status = res.status
  const text = await res.text()
  let json: any = null
  try { json = text ? JSON.parse(text) : null } catch { /* keep raw text */ }
  return { url, status, ok: res.ok, json, text: json ? null : text }
}

function toKwhPer100km(kmPerKwh?: number | null) {
  if (!kmPerKwh || kmPerKwh <= 0) return 0
  return +(100 / kmPerKwh).toFixed(1)
}
function hourKey(ts: string) {
  const d = new Date(ts); return `${d.getHours().toString().padStart(2,"0")}:00`
}

export default function AnalyticsPage() {
  const [summaryDebug, setSummaryDebug] = useState<DebugEntry<FleetSummary> | null>(null)
  const [vehiclesDebug, setVehiclesDebug] = useState<DebugEntry<VehiclesResponse> | null>(null)
  const [alertsDebug, setAlertsDebug] = useState<DebugEntry<AlertsResponse> | null>(null)
  const [telemetryDebug, setTelemetryDebug] = useState<DebugEntry<TelemetryResponse> | null>(null)

  const [summary, setSummary] = useState<FleetSummary | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [telemetry, setTelemetry] = useState<TelemetryRow[]>([])

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true); setError(null)

      if (!API_BASE) {
        setError("Missing NEXT_PUBLIC_API_BASE. Set it to your platform base URL and restart.")
        setLoading(false); return
      }

      const now = new Date()
      const dayAgo = new Date(now.getTime() - 24*60*60*1000)
      const start = dayAgo.toISOString().slice(0,10)
      const end = now.toISOString().slice(0,10)

      const urls = {
        summary: `${API_BASE}/api/fleet/dashboard/summary/`,
        vehicles: `${API_BASE}/api/fleet/vehicles/`,
        alerts: `${API_BASE}/api/fleet/alerts/`,
        telemetry: `${API_BASE}/api/fleet/obd-telemetry/?start_date=${encodeURIComponent(start)}&end_date=${encodeURIComponent(end)}&metric_type=battery_level`,
      }

      try {
        const [s, v, a, t] = await Promise.all([
          fetchDebug<FleetSummary>(urls.summary),
          fetchDebug<VehiclesResponse>(urls.vehicles),
          fetchDebug<AlertsResponse>(urls.alerts),
          fetchDebug<TelemetryResponse>(urls.telemetry),
        ])
        if (cancelled) return

        // Save raw debug for on-page visibility
        setSummaryDebug(s); setVehiclesDebug(v); setAlertsDebug(a); setTelemetryDebug(t)

        // Derive UI data (fill missing with defaults/0)
        setSummary(s.ok ? (s.json ?? {}) : {})
        setVehicles(v.ok ? (v.json?.results ?? []) : [])
        setAlerts(a.ok ? (a.json?.results ?? []) : [])
        setTelemetry(t.ok ? (t.json?.results ?? []) : [])

        if (!s.ok && !v.ok && !a.ok && !t.ok) {
          setError("Failed to load analytics (all endpoints failed).")
        }
      } catch (e: any) {
        if (!cancelled) setError(String(e?.message || e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  // KPIs
  const totalDistance = summary?.total_distance_travelled_km ?? 0
  const energyConsumed = 0 // not available → 0
  const avgEfficiency = useMemo(() => {
    const vals = vehicles.map(v => toKwhPer100km(v.efficiency_km_per_kwh ?? null)).filter(n => n>0)
    return vals.length ? +(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : 0
  }, [vehicles])
  const uptime = useMemo(() => {
    if (summary?.online_vehicles != null && summary?.total_vehicles) {
      return +((summary.online_vehicles / summary.total_vehicles) * 100).toFixed(1)
    }
    return 0
  }, [summary])

  // SoC trend (hourly over last 24h)
  const socData = useMemo(() => {
    if (!telemetry.length) {
      const now = new Date()
      return Array.from({length:24}).map((_,i)=> {
        const d = new Date(now.getTime() - (23-i)*60*60*1000)
        return { time: `${d.getHours().toString().padStart(2,"0")}:00`, soc: 0 }
      })
    }
    const byHour = new Map<string, TelemetryRow>()
    telemetry.forEach(row => {
      const key = hourKey(row.timestamp)
      const prev = byHour.get(key)
      if (!prev || new Date(row.timestamp) > new Date(prev.timestamp)) byHour.set(key, row)
    })
    const now = new Date(); const pts: {time:string;soc:number}[] = []
    for (let i=23;i>=0;i--) {
      const d = new Date(now.getTime() - i*60*60*1000)
      const key = `${d.getHours().toString().padStart(2,"0")}:00`
      const val = byHour.get(key)?.battery_level_percent ?? 0
      pts.push({ time: key, soc: Math.max(0, Math.min(100, Math.round(val))) })
    }
    return pts
  }, [telemetry])

  // Efficiency bar chart
  const efficiencyData = useMemo(() => (
    vehicles.map(v => ({
      vehicle: v.make && v.model ? `${v.make} ${v.model}` : v.license_plate || `Vehicle ${v.id}`,
      efficiency: toKwhPer100km(v.efficiency_km_per_kwh ?? null),
    }))
  ), [vehicles])

  // Alerts pie chart
  const alertsData = useMemo(() => {
    const buckets = { Battery:0, TPMS:0, Charging:0, Motor:0, Other:0 }
    const contains = (s: string, needles: string[]) => needles.some(n => s.includes(n))
    alerts.forEach(a => {
      const hay = `${a.alert_type||""} ${a.system||""} ${a.title||""}`.toLowerCase()
      if (contains(hay, ["battery"])) buckets.Battery++
      else if (contains(hay, ["tpms","tire","tyre","pressure"])) buckets.TPMS++
      else if (contains(hay, ["charge","charging","bms"])) buckets.Charging++
      else if (contains(hay, ["motor","engine","drivetrain"])) buckets.Motor++
      else buckets.Other++
    })
    return [
      { name:"Battery", value:buckets.Battery, color:"#ef4444" },
      { name:"TPMS", value:buckets.TPMS, color:"#f97316" },
      { name:"Charging", value:buckets.Charging, color:"#eab308" },
      { name:"Motor", value:buckets.Motor, color:"#22c55e" },
      { name:"Other", value:buckets.Other, color:"#6b7280" },
    ]
  }, [alerts])

  const avgSpeed = summary?.obd_metrics?.average_speed_kph ?? 0
  const maxSpeed = useMemo(() => telemetry.reduce((m,r)=>Math.max(m, r.speed_kph ?? 0), 0) | 0, [telemetry])

  // Debug rendering helper
  function DebugBlock<T>({ title, entry }: { title: string; entry: DebugEntry<T> | null }) {
    if (!entry) return null
    const body = entry.json ?? entry.text ?? ""
    return (
      <div className="border rounded-md">
        <div className="px-3 py-2 bg-gray-50 text-xs flex items-center justify-between">
          <div className="font-medium">{title}</div>
          <div className="ml-2 text-[11px] text-gray-600 break-all">
            <span className={entry.ok ? "text-green-600" : "text-red-600"}>HTTP {entry.status}</span>
            {" · "}
            <code>{entry.url}</code>
          </div>
        </div>
        <pre className="p-3 text-xs overflow-auto max-h-80 bg-white">
{typeof body === "string" ? body : JSON.stringify(body, null, 2)}
        </pre>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive fleet performance analytics</p>
        </div>
        <button
          onClick={() => setShowDebug(s => !s)}
          className="text-xs px-3 py-1.5 rounded-md border hover:bg-gray-50"
          title="Toggle API debug section"
        >
          {showDebug ? "Hide debug" : "Show debug"}
        </button>
      </div>

      {loading && <div className="text-sm text-gray-500">Loading…</div>}
      {error && (
        <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600">Total Distance</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDistance.toLocaleString(undefined,{maximumFractionDigits:1})} km</div>
            <p className="text-xs text-green-600">+0% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600">Energy Consumed</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(0).toLocaleString()} kWh</div>
            <p className="text-xs text-green-600">0% change</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600">Avg Efficiency</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEfficiency.toLocaleString(undefined,{maximumFractionDigits:1})} kWh/100km</div>
            <p className="text-xs text-green-600">+0% improvement</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600">Uptime</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uptime.toFixed(1)}%</div>
            <p className="text-xs text-green-600">+0% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Fleet SoC Trend (24h)</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{ soc: { label: "State of Charge", color: "hsl(var(--chart-1))" } }} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={socData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" /><YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="soc" stroke="var(--color-soc)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Energy Efficiency by Vehicle</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{ efficiency: { label: "Efficiency (kWh/100km)", color: "hsl(var(--chart-2))" } }} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={efficiencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="vehicle" /><YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="efficiency" fill="var(--color-efficiency)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Alert Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={alertsData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                    {alertsData.map((e,i)=> <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Fleet Performance Metrics</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center"><span className="text-sm font-medium">Average Speed</span><span className="text-lg font-bold">{(summary?.obd_metrics?.average_speed_kph ?? 0).toFixed(1)} km/h</span></div>
              <div className="flex justify-between items-center"><span className="text-sm font-medium">Max Speed Recorded</span><span className="text-lg font-bold">{maxSpeed} km/h</span></div>
              <div className="flex justify-between items-center"><span className="text-sm font-medium">Total Charging Sessions</span><span className="text-lg font-bold">0</span></div>
              <div className="flex justify-between items-center"><span className="text-sm font-medium">Regenerative Energy</span><span className="text-lg font-bold">0 kWh</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debug section */}
      {showDebug && (
        <Card>
          <CardHeader><CardTitle>Debug: API Responses</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <DebugBlock title="Dashboard Summary" entry={summaryDebug} />
            <DebugBlock title="Vehicles" entry={vehiclesDebug} />
            <DebugBlock title="Alerts" entry={alertsDebug} />
            <DebugBlock title="OBD Telemetry (battery_level)" entry={telemetryDebug} />
            <div className="text-[11px] text-gray-500">
              Tip: Make sure <code>NEXT_PUBLIC_API_BASE</code> is set and you’re sending <code>Authorization: Bearer …</code>.
              If any call shows 401/403/404, the JSON above will show the backend error payload.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// components/vehicles-table.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, Eye } from "lucide-react"

export type SimCard = {
  id: number
  sim_id: string
  iccid: string
  status: string
  plan_name?: string | null
  plan_data_limit_gb?: number | null
  plan_cost?: string | null
  current_data_used_gb?: number | null
  current_cycle_start?: string | null
  overage_threshold?: number | null
  device?: number | null
  last_activity?: string | null
  signal_strength?: string | null
}

export type OBDDevice = {
  id: number
  device_id: string
  model?: string | null
  serial_number?: string | null
  can_baud_rate?: number | null
  report_interval_sec?: number | null
  vehicle: number | null
  sim_card?: SimCard | null
  installed_at?: string | null
  is_active?: boolean
  last_communication_at?: string | null
  firmware_version?: string | null
}

export function VehiclesTable({
  rows,
  loading,
  error,
}: {
  rows: OBDDevice[]
  loading?: boolean
  error?: string
}) {
  if (loading) return <div className="text-sm text-gray-500 animate-pulse">Loading vehicles…</div>
  if (error) return <div className="text-sm text-red-600">Failed to load vehicles: {error}</div>

  const data = Array.isArray(rows) ? rows : []

  const health = (d: OBDDevice): "good" | "warning" | "critical" => {
    const ts = d.last_communication_at ? Date.parse(d.last_communication_at) : NaN
    if (!ts || Number.isNaN(ts)) return "critical"
    const diff = Date.now() - ts
    if (diff > 72 * 60 * 60 * 1000) return "critical"
    if (diff > 24 * 60 * 60 * 1000) return "warning"
    return "good"
  }

  const healthBadge = (h: "good" | "warning" | "critical") =>
    h === "critical"
      ? "text-red-700 bg-red-50 border-red-200"
      : h === "warning"
      ? "text-amber-700 bg-amber-50 border-amber-200"
      : "text-emerald-700 bg-emerald-50 border-emerald-200"

  const fmtAgo = (iso?: string | null) => {
    if (!iso) return "—"
    const ts = Date.parse(iso)
    if (Number.isNaN(ts)) return "—"
    const diff = Date.now() - ts
    const m = Math.floor(diff / 60000)
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24)
    return `${d}d ago`
  }

  const simUsagePct = (d: OBDDevice) => {
    const used = d.sim_card?.current_data_used_gb ?? 0
    const limit = d.sim_card?.plan_data_limit_gb ?? 0
    if (!limit) return 0
    return Math.max(0, Math.min(100, Math.round((used / limit) * 100)))
  }

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <CardTitle className="text-base">Fleet Vehicles</CardTitle>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Filter by Device ID…"
              className="pl-8"
              onChange={(e) => {
                const q = e.target.value.toLowerCase()
                document.querySelectorAll("tbody tr[data-row]").forEach((el) => {
                  const id = (el.getAttribute("data-id") || "").toLowerCase()
                  ;(el as HTMLElement).style.display = id.includes(q) ? "" : "none"
                })
              }}
            />
          </div>
          <Button variant="outline" className="gap-2"><Filter className="w-4 h-4" /> Filter</Button>
        </div>
      </CardHeader>
      <CardContent>
        {!data.length ? (
          <div className="text-sm text-gray-500">No devices found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left border-y">
                  <th className="py-2 px-3">Vehicle ID</th>
                  <th className="py-2 px-3">Model</th>
                  <th className="py-2 px-3">Health</th>
                  <th className="py-2 px-3">Last Contact</th>
                  <th className="py-2 px-3">SoC</th>
                  <th className="py-2 px-3">Warnings</th>
                  <th className="py-2 px-3">SIM Usage</th>
                  <th className="py-2 px-3">Location</th>
                  <th className="py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => {
                  const h = health(d)
                  const pct = simUsagePct(d)
                  return (
                    <tr key={d.id} data-row data-id={d.device_id} className="border-b last:border-0">
                      <td className="py-2 px-3">
                        <div className="font-medium">{d.device_id}</div>
                        <div className="text-xs text-gray-500">Device #{d.id}</div>
                      </td>
                      <td className="py-2 px-3">{d.model ?? "—"}</td>
                      <td className="py-2 px-3">
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs ${healthBadge(h)}`}>
                          {h === "good" ? "Good" : h === "warning" ? "Warning" : "Critical"}
                        </span>
                      </td>
                      <td className="py-2 px-3">{fmtAgo(d.last_communication_at)}</td>
                      <td className="py-2 px-3">—</td>
                      <td className="py-2 px-3">—</td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24"><Progress value={pct} /></div>
                          <span>{pct ? `${pct}%` : "—"}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3">—</td>
                      <td className="py-2 px-3">
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Eye className="w-4 h-4" /> View
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

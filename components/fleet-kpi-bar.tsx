// components/fleet-kpi-bar.tsx
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

type Trend = "up" | "down" | "stable"

export type FleetKPIBarProps = {
  vehiclesOnline?: number | null
  totalVehicles?: number | null
  criticalAlerts?: number | null
  averageSocPercent?: number | null
  maintenanceTickets?: number | null
  trendOnline?: Trend
  changeOnline?: string
  trendCritical?: Trend
  changeCritical?: string
  trendSoc?: Trend
  changeSoc?: string
  trendMaint?: Trend
  changeMaint?: string
  loading?: boolean
}

function TrendIcon({ trend }: { trend?: Trend }) {
  if (trend === "up") return <TrendingUp className="w-4 h-4 text-green-500" />
  if (trend === "down") return <TrendingDown className="w-4 h-4 text-red-500" />
  return <Minus className="w-4 h-4 text-gray-400" />
}
function trendVariant(trend?: Trend) {
  if (trend === "up") return "default" as const
  if (trend === "down") return "destructive" as const
  return "secondary" as const
}

export function FleetKPIBar({
  vehiclesOnline,
  totalVehicles,
  criticalAlerts,
  averageSocPercent,
  maintenanceTickets,
  trendOnline,
  changeOnline,
  trendCritical,
  changeCritical,
  trendSoc,
  changeSoc,
  trendMaint,
  changeMaint,
  loading,
}: FleetKPIBarProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-white">
            <CardContent className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-3 w-24 bg-gray-200 rounded" />
                <div className="h-6 w-20 bg-gray-200 rounded" />
                <div className="h-2 w-full bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const onlinePct =
    typeof vehiclesOnline === "number" &&
    typeof totalVehicles === "number" &&
    totalVehicles > 0
      ? Math.round((vehiclesOnline / totalVehicles) * 100)
      : null

  const socPct =
    typeof averageSocPercent === "number"
      ? Math.max(0, Math.min(100, Math.round(averageSocPercent)))
      : null

  const kpis = [
    {
      label: "Vehicles Online",
      value:
        typeof vehiclesOnline === "number" && typeof totalVehicles === "number"
          ? `${vehiclesOnline}`
          : vehiclesOnline ?? "—",
      total:
        typeof vehiclesOnline === "number" && typeof totalVehicles === "number"
          ? `${totalVehicles}`
          : null,
      percentage: onlinePct,
      trend: trendOnline,
      change: changeOnline ?? "",
    },
    {
      label: "Critical Alerts",
      value:
        typeof criticalAlerts === "number" ? String(criticalAlerts) : "—",
      total: null,
      percentage: null,
      trend: trendCritical,
      change: changeCritical ?? "",
    },
    {
      label: "Average SoC",
      value:
        typeof averageSocPercent === "number" ? `${socPct}%` : "—",
      total: null,
      percentage: socPct,
      trend: trendSoc,
      change: changeSoc ?? "",
    },
    {
      label: "Maintenance Tickets",
      value:
        typeof maintenanceTickets === "number"
          ? String(maintenanceTickets)
          : "—",
      total: null,
      percentage: null,
      trend: trendMaint,
      change: changeMaint ?? "",
    },
  ] as const

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{kpi.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {kpi.value}
                    {kpi.total && (
                      <span className="text-sm text-gray-500">/{kpi.total}</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <TrendIcon trend={kpi.trend} />
                {kpi.change && (
                  <Badge variant={trendVariant(kpi.trend)} className="text-xs">
                    {kpi.change}
                  </Badge>
                )}
              </div>
            </div>

            {typeof kpi.percentage === "number" && !Number.isNaN(kpi.percentage) && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${kpi.percentage}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

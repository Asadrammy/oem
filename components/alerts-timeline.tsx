// components/alerts-timeline.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export type AlertItem = {
  id: string
  severity: "critical" | "warning" | "info" | "resolved"
  title: string
  description: string
  vehicleLabel: string
  timestamp?: string
  system: string
  ago: string
}

export function AlertsTimeline({
  loading,
  error,
  alerts,
}: {
  loading?: boolean
  error?: string
  alerts: AlertItem[]
}) {
  if (loading) {
    return <div className="text-sm text-gray-500 animate-pulse">Loading alerts…</div>
  }
  if (error) {
    return <div className="text-sm text-red-600">Failed to load alerts: {error}</div>
  }
  if (!alerts.length) {
    return <div className="text-sm text-gray-500">No alerts 🎉</div>
  }

  const iconFor = (severity: AlertItem["severity"]) => {
    if (severity === "critical") return <AlertTriangle className="w-4 h-4 text-red-600" />
    if (severity === "warning") return <AlertCircle className="w-4 h-4 text-amber-600" />
    if (severity === "resolved") return <CheckCircle className="w-4 h-4 text-emerald-600" />
    return <Info className="w-4 h-4 text-sky-600" />
  }

  const badgeVariant = (severity: AlertItem["severity"]) =>
    severity === "critical" ? "destructive" :
    severity === "warning" ? "secondary" :
    "default"

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-base">Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[420px] pr-3">
          <div className="space-y-3">
            {alerts.map((a) => (
              <div key={a.id} className="rounded-xl border p-3">
                <div className="flex items-center gap-2">
                  {iconFor(a.severity)}
                  <div className="text-sm font-medium">{a.title}</div>
                  <Badge variant={badgeVariant(a.severity)} className="ml-auto">
                    {a.severity}
                  </Badge>
                </div>
                <div className="mt-1 text-xs text-gray-600">{a.description}</div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div><span className="text-gray-400">Vehicle:</span> {a.vehicleLabel}</div>
                  <div><span className="text-gray-400">System:</span> {a.system}</div>
                  <div><span className="text-gray-400">When:</span> {a.ago}</div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

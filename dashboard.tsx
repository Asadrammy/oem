"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./components/app-sidebar"
import { FleetKPIBar } from "./components/fleet-kpi-bar"
import { TelemetryWidget } from "./components/telemetry-widget"
import { AlertsTimeline } from "./components/alerts-timeline"
import { VehiclesTable } from "./components/vehicles-table"
import { Separator } from "@/components/ui/separator"
import { Bell, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function Dashboard() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1">
            <h1 className="font-semibold text-gray-900">Fleet Dashboard</h1>
            <p className="text-sm text-gray-500">Real-time diagnostics and fleet management</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center">3</Badge>
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 space-y-6 p-6 bg-gray-50">
          {/* Fleet KPIs */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Fleet Overview</h2>
            <FleetKPIBar />
          </section>

          {/* Real-time Telemetry */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Telemetry - Vehicle BLX57819</h2>
            <TelemetryWidget />
          </section>

          {/* Alerts and Vehicles */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <AlertsTimeline />
            </div>
            <div className="lg:col-span-2">
              <VehiclesTable />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

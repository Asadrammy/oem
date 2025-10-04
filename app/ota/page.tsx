"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Upload, Search, Filter, Plus, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { Suspense } from "react"

interface OTAUpdate {
  id: string
  version: string
  component: string
  releaseDate: string
  status: "draft" | "testing" | "rolling-out" | "completed" | "paused" | "failed"
  targetVehicles: number
  completedVehicles: number
  failedVehicles: number
  rolloutPercentage: number
  description: string
  criticality: "low" | "medium" | "high" | "critical"
  size: number
}

const mockOTAUpdates: OTAUpdate[] = [
  {
    id: "OTA-001",
    version: "v2.1.4",
    component: "VCU",
    releaseDate: "2024-01-20",
    status: "rolling-out",
    targetVehicles: 892,
    completedVehicles: 623,
    failedVehicles: 12,
    rolloutPercentage: 75,
    description: "Critical security patch and performance improvements",
    criticality: "critical",
    size: 45.2,
  },
  {
    id: "OTA-002",
    version: "v4.3.1",
    component: "BMS",
    releaseDate: "2024-01-18",
    status: "completed",
    targetVehicles: 456,
    completedVehicles: 451,
    failedVehicles: 5,
    rolloutPercentage: 100,
    description: "Battery management optimization for winter conditions",
    criticality: "medium",
    size: 12.8,
  },
  {
    id: "OTA-003",
    version: "v6.4.0",
    component: "Charger",
    releaseDate: "2024-01-15",
    status: "paused",
    targetVehicles: 234,
    completedVehicles: 89,
    failedVehicles: 23,
    rolloutPercentage: 25,
    description: "Fast charging protocol update",
    criticality: "high",
    size: 8.9,
  },
  {
    id: "OTA-004",
    version: "v2.2.0",
    component: "TPMS",
    releaseDate: "2024-01-22",
    status: "testing",
    targetVehicles: 50,
    completedVehicles: 0,
    failedVehicles: 0,
    rolloutPercentage: 0,
    description: "Enhanced tire pressure monitoring with predictive alerts",
    criticality: "low",
    size: 3.2,
  },
]

const statusConfig = {
  draft: { color: "bg-gray-500", label: "Draft", badge: "secondary", icon: Clock },
  testing: { color: "bg-blue-500", label: "Testing", badge: "default", icon: Clock },
  "rolling-out": { color: "bg-orange-500", label: "Rolling Out", badge: "secondary", icon: Download },
  completed: { color: "bg-green-500", label: "Completed", badge: "default", icon: CheckCircle },
  paused: { color: "bg-yellow-500", label: "Paused", badge: "secondary", icon: AlertTriangle },
  failed: { color: "bg-red-500", label: "Failed", badge: "destructive", icon: AlertTriangle },
}

const criticalityConfig = {
  low: { color: "bg-gray-500", label: "Low", badge: "secondary" },
  medium: { color: "bg-blue-500", label: "Medium", badge: "default" },
  high: { color: "bg-orange-500", label: "High", badge: "secondary" },
  critical: { color: "bg-red-500", label: "Critical", badge: "destructive" },
}

function OTALoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  )
}

export default function OTAUpdatesPage() {
  return (
    <Suspense fallback={<OTALoading />}>
      <OTAContent />
    </Suspense>
  )
}

function OTAContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">OTA Updates</h1>
          <p className="text-gray-600">Manage over-the-air firmware updates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Upload Firmware
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Update
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Download className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockOTAUpdates.length}</p>
                <p className="text-sm text-gray-600">Total Updates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockOTAUpdates.filter((u) => u.status === "completed").length}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockOTAUpdates.filter((u) => u.status === "rolling-out").length}</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockOTAUpdates.reduce((sum, u) => sum + u.failedVehicles, 0)}</p>
                <p className="text-sm text-gray-600">Failed Installs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search updates..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="testing">Testing</SelectItem>
                <SelectItem value="rolling-out">Rolling Out</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Component" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Components</SelectItem>
                <SelectItem value="vcu">VCU</SelectItem>
                <SelectItem value="bms">BMS</SelectItem>
                <SelectItem value="charger">Charger</SelectItem>
                <SelectItem value="tpms">TPMS</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Updates List */}
      <Card>
        <CardHeader>
          <CardTitle>Firmware Updates ({mockOTAUpdates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockOTAUpdates.map((update) => {
              const statusConf = statusConfig[update.status]
              const criticalityConf = criticalityConfig[update.criticality]
              const StatusIcon = statusConf.icon

              return (
                <div key={update.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <StatusIcon className="w-5 h-5 text-gray-400" />
                        <Link href={`/ota/${update.id}`} className="font-medium text-blue-600 hover:underline">
                          {update.component} {update.version}
                        </Link>
                        <Badge variant={statusConf.badge as any} className="text-xs">
                          {statusConf.label}
                        </Badge>
                        <Badge variant={criticalityConf.badge as any} className="text-xs">
                          {criticalityConf.label}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{update.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">Release Date:</span>
                          <span className="ml-1">{update.releaseDate}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Size:</span>
                          <span className="ml-1">{update.size} MB</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Target Vehicles:</span>
                          <span className="ml-1">{update.targetVehicles}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Failed:</span>
                          <span className="ml-1 text-red-600">{update.failedVehicles}</span>
                        </div>
                      </div>

                      {update.status === "rolling-out" && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Rollout Progress</span>
                            <span>
                              {update.completedVehicles}/{update.targetVehicles} vehicles
                            </span>
                          </div>
                          <Progress value={update.rolloutPercentage} className="h-2" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2">
                        {update.status === "paused" && (
                          <Button variant="outline" size="sm">
                            Resume
                          </Button>
                        )}
                        {update.status === "rolling-out" && (
                          <Button variant="outline" size="sm">
                            Pause
                          </Button>
                        )}
                        {update.status === "failed" && (
                          <Button variant="outline" size="sm">
                            Retry
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

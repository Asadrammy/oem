"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, User, MapPin, Search, Filter, Plus } from "lucide-react"

interface ScheduledMaintenance {
  id: string
  vehicleId: string
  vehicleModel: string
  type: string
  priority: "low" | "medium" | "high" | "critical"
  scheduledDate: string
  estimatedDuration: number
  technician: string
  location: string
  status: "scheduled" | "in-progress" | "overdue"
  description: string
}

const mockScheduled: ScheduledMaintenance[] = [
  {
    id: "MNT-001",
    vehicleId: "BLX57819",
    vehicleModel: "EV Pro 2024",
    type: "10,000km Service",
    priority: "medium",
    scheduledDate: "2024-01-25",
    estimatedDuration: 4,
    technician: "Rajesh Kumar",
    location: "Service Center - Mumbai",
    status: "scheduled",
    description: "Routine maintenance including battery health check, brake inspection, and software update",
  },
  {
    id: "MNT-002",
    vehicleId: "EV-2024-001",
    vehicleModel: "EV Compact 2024",
    type: "Battery Diagnostic",
    priority: "high",
    scheduledDate: "2024-01-22",
    estimatedDuration: 2,
    technician: "Priya Sharma",
    location: "Service Center - Delhi",
    status: "overdue",
    description: "Investigate battery capacity degradation reported by customer",
  },
  {
    id: "MNT-003",
    vehicleId: "EV-2024-003",
    vehicleModel: "EV SUV 2024",
    type: "Tire Rotation",
    priority: "low",
    scheduledDate: "2024-01-26",
    estimatedDuration: 1,
    technician: "Amit Patel",
    location: "Service Center - Bangalore",
    status: "scheduled",
    description: "Rotate tires and check alignment",
  },
  {
    id: "MNT-004",
    vehicleId: "EV-2024-004",
    vehicleModel: "EV Van 2024",
    type: "Motor Inspection",
    priority: "critical",
    scheduledDate: "2024-01-23",
    estimatedDuration: 6,
    technician: "Suresh Reddy",
    location: "Service Center - Chennai",
    status: "in-progress",
    description: "Investigate motor overheating alerts and replace cooling system if needed",
  },
]

const priorityConfig = {
  low: { color: "bg-gray-500", label: "Low", badge: "secondary" },
  medium: { color: "bg-blue-500", label: "Medium", badge: "default" },
  high: { color: "bg-orange-500", label: "High", badge: "secondary" },
  critical: { color: "bg-red-500", label: "Critical", badge: "destructive" },
}

const statusConfig = {
  scheduled: { color: "bg-blue-500", label: "Scheduled", badge: "default" },
  "in-progress": { color: "bg-green-500", label: "In Progress", badge: "default" },
  overdue: { color: "bg-red-500", label: "Overdue", badge: "destructive" },
}

export default function ScheduledMaintenancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scheduled Maintenance</h1>
          <p className="text-gray-600">Manage upcoming maintenance appointments</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Maintenance
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockScheduled.filter((m) => m.status === "scheduled").length}</p>
                <p className="text-sm text-gray-600">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockScheduled.filter((m) => m.status === "in-progress").length}</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Calendar className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockScheduled.filter((m) => m.status === "overdue").length}</p>
                <p className="text-sm text-gray-600">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockScheduled.reduce((sum, m) => sum + m.estimatedDuration, 0)}</p>
                <p className="text-sm text-gray-600">Total Hours</p>
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
              <Input placeholder="Search maintenance..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance List */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Maintenance ({mockScheduled.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockScheduled.map((maintenance) => {
              const priorityConf = priorityConfig[maintenance.priority]
              const statusConf = statusConfig[maintenance.status]

              return (
                <div key={maintenance.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Link
                          href={`/maintenance/${maintenance.id}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {maintenance.type}
                        </Link>
                        <Badge variant={priorityConf.badge as any} className="text-xs">
                          {priorityConf.label}
                        </Badge>
                        <Badge variant={statusConf.badge as any} className="text-xs">
                          {statusConf.label}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{maintenance.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{maintenance.scheduledDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{maintenance.estimatedDuration}h estimated</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{maintenance.technician}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{maintenance.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Link
                        href={`/vehicles/${maintenance.vehicleId}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {maintenance.vehicleId}
                      </Link>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Reschedule
                        </Button>
                        <Button variant="outline" size="sm">
                          Start Work
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

"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, DollarSign, User, Wrench, Search, Filter, Download, FileText } from "lucide-react"

interface MaintenanceHistory {
  id: string
  vehicleId: string
  vehicleModel: string
  type: string
  completedDate: string
  technician: string
  location: string
  cost: number
  duration: number
  status: "completed" | "cancelled" | "partial"
  description: string
  partsReplaced: string[]
  workOrderNumber: string
}

const mockHistory: MaintenanceHistory[] = [
  {
    id: "MNT-H-001",
    vehicleId: "EV-2024-002",
    vehicleModel: "EV Pro 2024",
    type: "Brake Inspection",
    completedDate: "2024-01-18",
    technician: "Rajesh Kumar",
    location: "Service Center - Mumbai",
    cost: 2500,
    duration: 3,
    status: "completed",
    description: "Complete brake system inspection and pad replacement",
    partsReplaced: ["Brake Pads (Front)", "Brake Fluid"],
    workOrderNumber: "WO-2024-0156",
  },
  {
    id: "MNT-H-002",
    vehicleId: "BLX57820",
    vehicleModel: "EV Compact 2024",
    type: "Software Update",
    completedDate: "2024-01-13",
    technician: "Priya Sharma",
    location: "Service Center - Delhi",
    cost: 0,
    duration: 1,
    status: "completed",
    description: "OTA firmware update to v2.1.3",
    partsReplaced: [],
    workOrderNumber: "WO-2024-0142",
  },
  {
    id: "MNT-H-003",
    vehicleId: "EV-2024-004",
    vehicleModel: "EV Van 2024",
    type: "5,000km Service",
    completedDate: "2024-01-06",
    technician: "Amit Patel",
    location: "Service Center - Bangalore",
    cost: 4200,
    duration: 5,
    status: "completed",
    description: "Routine 5,000km service including battery health check",
    partsReplaced: ["Air Filter", "Cabin Filter", "Coolant"],
    workOrderNumber: "WO-2024-0098",
  },
  {
    id: "MNT-H-004",
    vehicleId: "EV-2024-001",
    vehicleModel: "EV Compact 2024",
    type: "Battery Replacement",
    completedDate: "2023-12-28",
    technician: "Suresh Reddy",
    location: "Service Center - Chennai",
    cost: 85000,
    duration: 8,
    status: "completed",
    description: "Battery pack replacement under warranty",
    partsReplaced: ["Battery Pack", "BMS Module", "Cooling Lines"],
    workOrderNumber: "WO-2023-0892",
  },
]

const statusConfig = {
  completed: { color: "bg-green-500", label: "Completed", badge: "default" },
  cancelled: { color: "bg-red-500", label: "Cancelled", badge: "destructive" },
  partial: { color: "bg-orange-500", label: "Partial", badge: "secondary" },
}

export default function MaintenanceHistoryPage() {
  const totalCost = mockHistory.reduce((sum, m) => sum + m.cost, 0)
  const totalHours = mockHistory.reduce((sum, m) => sum + m.duration, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance History</h1>
          <p className="text-gray-600">Complete audit trail of maintenance activities</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Wrench className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockHistory.filter((m) => m.status === "completed").length}</p>
                <p className="text-sm text-gray-600">Completed Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">₹{totalCost.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Cost</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalHours}</p>
                <p className="text-sm text-gray-600">Total Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <User className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{new Set(mockHistory.map((m) => m.technician)).size}</p>
                <p className="text-sm text-gray-600">Technicians</p>
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
              <Input placeholder="Search maintenance history..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-week">Last Week</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="last-quarter">Last Quarter</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Records ({mockHistory.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockHistory.map((record) => {
              const statusConf = statusConfig[record.status]

              return (
                <div key={record.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Link href={`/maintenance/${record.id}`} className="font-medium text-blue-600 hover:underline">
                          {record.type}
                        </Link>
                        <Badge variant={statusConf.badge as any} className="text-xs">
                          {statusConf.label}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {record.workOrderNumber}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{record.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{record.completedDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span>₹{record.cost.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{record.technician}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-gray-400" />
                          <span>{record.duration}h duration</span>
                        </div>
                      </div>

                      {record.partsReplaced.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs text-gray-500">Parts replaced:</span>
                          {record.partsReplaced.map((part, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {part}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Link href={`/vehicles/${record.vehicleId}`} className="text-sm text-blue-600 hover:underline">
                        {record.vehicleId}
                      </Link>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-1" />
                          Work Order
                        </Button>
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

"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts"
import { AlertTriangle, CheckCircle, Calendar, DollarSign } from "lucide-react"
import { Suspense } from "react"

const maintenanceData = [
  { month: "Jan", scheduled: 12, completed: 11, missed: 1 },
  { month: "Feb", scheduled: 15, completed: 14, missed: 1 },
  { month: "Mar", scheduled: 18, completed: 16, missed: 2 },
  { month: "Apr", scheduled: 14, completed: 13, missed: 1 },
  { month: "May", scheduled: 16, completed: 15, missed: 1 },
  { month: "Jun", scheduled: 20, completed: 18, missed: 2 },
]

const costData = [
  { month: "Jan", cost: 4500 },
  { month: "Feb", cost: 5200 },
  { month: "Mar", cost: 6800 },
  { month: "Apr", cost: 4100 },
  { month: "May", cost: 5900 },
  { month: "Jun", cost: 7200 },
]

function MaintenanceLoading() {
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

export default function MaintenancePage() {
  return (
    <Suspense fallback={<MaintenanceLoading />}>
      <MaintenanceContent />
    </Suspense>
  )
}

function MaintenanceContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Maintenance Overview</h1>
        <p className="text-gray-600">Fleet maintenance management and analytics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/maintenance/scheduled">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">23</p>
                  <p className="text-sm text-gray-600">Scheduled This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/maintenance/scheduled">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">18</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/maintenance/scheduled">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-gray-600">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/maintenance/scheduled">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₹2,84,700</p>
                  <p className="text-sm text-gray-600">Total Cost (6 months)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                scheduled: {
                  label: "Scheduled",
                  color: "hsl(var(--chart-1))",
                },
                completed: {
                  label: "Completed",
                  color: "hsl(var(--chart-2))",
                },
                missed: {
                  label: "Missed",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={maintenanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="scheduled" stroke="var(--color-scheduled)" strokeWidth={2} />
                  <Line type="monotone" dataKey="completed" stroke="var(--color-completed)" strokeWidth={2} />
                  <Line type="monotone" dataKey="missed" stroke="var(--color-missed)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Maintenance Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                cost: {
                  label: "Cost ($)",
                  color: "hsl(var(--chart-4))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="cost" fill="var(--color-cost)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Maintenance Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Maintenance</CardTitle>
              <Link href="/maintenance/scheduled">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">BLX57819 - 10,000km Service</p>
                  <p className="text-sm text-gray-600">Due in 5 days</p>
                </div>
                <Badge variant="outline">Scheduled</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">EV-2024-001 - Battery Check</p>
                  <p className="text-sm text-gray-600">Due in 12 days</p>
                </div>
                <Badge variant="outline">Scheduled</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">EV-2024-003 - Tire Rotation</p>
                  <p className="text-sm text-red-600">Overdue by 3 days</p>
                </div>
                <Badge variant="destructive">Overdue</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Completions</CardTitle>
              <Link href="/maintenance/history">
                <Button variant="outline" size="sm">
                  View History
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">EV-2024-002 - Brake Inspection</p>
                  <p className="text-sm text-gray-600">Completed 2 days ago</p>
                </div>
                <Badge variant="default">Completed</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">BLX57820 - Software Update</p>
                  <p className="text-sm text-gray-600">Completed 1 week ago</p>
                </div>
                <Badge variant="default">Completed</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">EV-2024-004 - 5,000km Service</p>
                  <p className="text-sm text-gray-600">Completed 2 weeks ago</p>
                </div>
                <Badge variant="default">Completed</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fleet Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Fleet Health Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-3">Maintenance Compliance</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>On Schedule</span>
                  <span>78%</span>
                </div>
                <Progress value={78} />
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Average Service Interval</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current: 8,500 km</span>
                  <span>Target: 10,000 km</span>
                </div>
                <Progress value={85} />
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Cost Efficiency</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>₹15/km</span>
                  <span>vs ₹18/km target</span>
                </div>
                <Progress value={82} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

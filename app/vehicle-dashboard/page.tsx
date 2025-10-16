"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
} from "recharts";
import { getVehicleHistory, listVehicles } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import { BarChart3Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function VehicleDashboardPage() {
  const searchParams = useSearchParams();
  const vehicleIdFromQuery = searchParams.get("vehicleId");
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(5);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeChart, setActiveChart] = useState<string | null>(null); // which chart is open

  // Chart definitions
  const chartDefinitions = [
    { key: "motor_temp_c", title: "Motor Temp (°C)", color: "#3b82f6" },
    { key: "battery_level_percent", title: "Battery %", color: "#16a34a" },
    { key: "speed_kph", title: "Speed (km/h)", color: "#f97316" },
    { key: "range_km", title: "Range (km)", color: "#8b5cf6" },
    { key: "battery_power_kw", title: "Battery Power (kW)", color: "#06b6d4" },
    {
      key: "tire_pressure_kpa",
      title: "Tire Pressure (kPa)",
      color: "#ef4444",
    },
    { key: "torque_nm", title: "Torque (Nm)", color: "#eab308" },
  ];

  // Fetch vehicle list
  useEffect(() => {
    async function fetchVehicles() {
      try {
        const data = await listVehicles();
        const vehicleList = data.results || data;
        setVehicles(vehicleList);

        // If vehicleId is passed in query, select it by default
        if (vehicleIdFromQuery) {
          const vehicleIdNum = Number(vehicleIdFromQuery);
          if (vehicleList.some((v: any) => v.id === vehicleIdNum)) {
            setSelectedVehicle(vehicleIdNum);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchVehicles();
  }, [vehicleIdFromQuery]);

  // Fetch vehicle history after selection
  useEffect(() => {
    async function fetchVehicleHistory() {
      if (selectedVehicle === null) return;
      setLoading(true);
      try {
        const data = await getVehicleHistory(selectedVehicle);
        setDashboardData(data);
        setActiveChart(null); // reset active chart when switching vehicles
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchVehicleHistory();
  }, [selectedVehicle]);
  useEffect(() => {
    if (!activeChart && chartDefinitions.length > 0) {
      const firstAvailable = chartDefinitions.find(
        (chart) => dashboardData?.time_series_charts?.[chart.key]?.length > 0
      );
      if (firstAvailable) {
        setActiveChart(firstAvailable.key);
      }
    }
  }, [dashboardData, chartDefinitions, activeChart]);
  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      {/* Vehicle Select */}
      <div>
        <div className="flex items-center gap-2 w-full max-w-lg">
          {/* Label */}
          <label className="font-semibold text-gray-700 min-w-[100px]">
            Select Vehicle:
          </label>

          {/* Dropdown */}
          <select
            className="flex-1 border border-gray-300 rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={selectedVehicle || ""}
            onChange={(e) => setSelectedVehicle(Number(e.target.value))}
          >
            <option value="">-- Select Vehicle --</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.vin}
              </option>
            ))}
          </select>

          {/* Button */}
          <Link href={`/vehicles/${selectedVehicle}`}>
            <Button
              disabled={!selectedVehicle}
              className="bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 rounded-r-lg px-4 py-2 flex items-center gap-2 transition-colors duration-200"
            >
              <BarChart3Icon className="w-4 h-4" />
              View Details
            </Button>
          </Link>
        </div>
      </div>
      {loading && (
        <div className="text-center text-blue-600 font-medium animate-pulse">
          Loading dashboard...
        </div>
      )}

      {!loading && !dashboardData && selectedVehicle && (
        <div className="text-center text-gray-500 font-medium">
          🚗 No data available for this vehicle.
        </div>
      )}

      {dashboardData && (
        <div className="space-y-6">
          {/* Vehicle Header */}
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-6 rounded-xl border border-gray-200 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                {dashboardData?.vehicle?.vin}
              </h1>
              <p className="text-gray-600 text-sm">
                Vehicle ID: {dashboardData?.vehicle?.id}
              </p>
              {dashboardData?.date_filter && (
                <p className="text-gray-600 text-sm">
                  Date Range:{" "}
                  {dashboardData?.date_filter?.start_date?.split("T")[0]} →{" "}
                  {dashboardData?.date_filter?.end_date?.split("T")[0]}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-gray-600 text-sm">Battery Level</p>
              <p className="text-2xl font-bold text-blue-700">
                {dashboardData?.stats?.battery_level ?? "--"}%
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard
              color="from-green-50 to-green-100"
              label="Max Speed"
              value={`${dashboardData?.stats?.max_speed_kph ?? "--"} km/h`}
            />
            <StatCard
              color="from-blue-50 to-blue-100"
              label="Avg Range"
              value={`${
                dashboardData?.stats?.avg_range_km?.toFixed?.(2) ?? "--"
              } km`}
            />
            <StatCard
              color="from-red-50 to-pink-100"
              label="Error Count"
              value={dashboardData?.stats?.error_count ?? "--"}
            />
            <StatCard
              color="from-purple-50 to-fuchsia-100"
              label="Trip Count"
              value={dashboardData?.stats?.trip_count ?? "--"}
            />
            <StatCard
              color="from-orange-50 to-amber-100"
              label="Distance"
              value={`${dashboardData?.stats?.distance_km ?? "--"} km`}
            />
            <StatCard
              color="from-teal-50 to-cyan-100"
              label="Battery"
              value={`${dashboardData?.stats?.battery_level ?? "--"}%`}
            />
          </div>
          {/* Chart Tiles Row */}
          <div className="flex gap-4 overflow-x-auto pb-2">
            {chartDefinitions.map((chart) =>
              dashboardData?.time_series_charts?.[chart.key]?.length > 0 ? (
                <button
                  key={chart.key}
                  onClick={() =>
                    setActiveChart(activeChart === chart.key ? null : chart.key)
                  }
                  className={`flex-shrink-0 px-4 py-3 rounded-lg border transition ${
                    activeChart === chart.key
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {chart.title}
                </button>
              ) : null
            )}
          </div>

          {/* Expanded Chart */}
          {activeChart && (
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                {chartDefinitions.find((c) => c.key === activeChart)?.title}
              </h2>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart
                  data={dashboardData.time_series_charts[activeChart].map(
                    (item: any) => ({
                      time: item.time_label,
                      value: item.value,
                    })
                  )}
                >
                  <defs>
                    <linearGradient
                      id={`color-${activeChart}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={
                          chartDefinitions.find((c) => c.key === activeChart)
                            ?.color || "#3b82f6"
                        }
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="95%"
                        stopColor={
                          chartDefinitions.find((c) => c.key === activeChart)
                            ?.color || "#3b82f6"
                        }
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#6b7280"
                    tickFormatter={(value) => {
                      // Format the time label to show date and time
                      try {
                        const date = new Date(value);
                        if (!isNaN(date.getTime())) {
                          return date.toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          });
                        }
                        return value;
                      } catch {
                        return value;
                      }
                    }}
                  />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                    }}
                    labelFormatter={(value) => {
                      // Format tooltip label to show full date and time
                      try {
                        const date = new Date(value);
                        if (!isNaN(date.getTime())) {
                          return date.toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          });
                        }
                        return value;
                      } catch {
                        return value;
                      }
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={
                      chartDefinitions.find((c) => c.key === activeChart)
                        ?.color || "#3b82f6"
                    }
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, stroke: "#1e40af", strokeWidth: 2 }}
                  />
                  <Area
                    dataKey="value"
                    stroke="none"
                    fill={`url(#color-${activeChart})`}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Light Stat Card Component
const StatCard = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) => (
  <div
    className={`bg-gradient-to-br ${color} text-gray-800 p-4 rounded-xl border border-gray-200 flex flex-col items-center hover:bg-opacity-90 transition`}
  >
    <p className="text-sm text-gray-600">{label}</p>
    <p className="text-lg font-bold">{value}</p>
  </div>
);

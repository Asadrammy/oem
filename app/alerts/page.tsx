"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, Plus, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listAlertRules, listVehiclesType, deleteAlertRule } from "@/lib/api";
import { fuzzySearch } from "@/lib/fuzzySearch";

interface Condition {
  id: number;
  field: string;
  operator: string;
  threshold: number;
}

interface AlertRule {
  id: number;
  name: string;
  description: string;
  severity: string;
  system: string;
  is_active: boolean;
  condition_logic: string;
  trigger_duration_sec: number;
  cooldown_minutes: number;
  auto_resolve: boolean;
  notification_channels: string[];
  recipients: string[];
  vehicle_types: number[];
  conditions: Condition[];
}

interface VehicleType {
  id: number;
  name: string;
}

export default function AlertRulesPage() {
  const router = useRouter();
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState(""); // New state for active search
  const [selectedType, setSelectedType] = useState<string>("all");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchVehicleTypes = async () => {
    try {
      const data = await listVehiclesType();
      setVehicleTypes(data);
    } catch (err) {
      console.error("Error fetching vehicle types:", err);
    }
  };

  const fetchAlertRules = async () => {
    setLoading(true);
    try {
      const data = await listAlertRules();
      let rules: AlertRule[] = data.results ?? [];

      if (activeSearchTerm) {
        rules = fuzzySearch(rules, activeSearchTerm, ['name', 'description', 'severity', 'system'], {
          threshold: 0.3,
          minLength: 2
        });
      }
      if (selectedType !== "all") {
        rules = rules.filter((r) =>
          r.vehicle_types.includes(Number(selectedType))
        );
      }

      setTotalCount(rules.length);
      setTotalPages(Math.ceil(rules.length / limit));
      setAlertRules(rules.slice((page - 1) * limit, page * limit));
    } catch (err) {
      console.error("Error fetching alert rules:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setActiveSearchTerm(searchTerm);
    setPage(1); // Reset to first page when searching
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  useEffect(() => {
    fetchAlertRules();
  }, [page, activeSearchTerm, selectedType]);

  // Auto-clear search when search term is empty
  useEffect(() => {
    if (searchTerm === "") {
      setActiveSearchTerm("");
      setPage(1);
    }
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alert Rules</h1>
          <p className="text-gray-600">Manage and monitor your alert rules</p>
        </div>
        <Link href="/alerts/create">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Alert Rule
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyPress}
            />
          </div>

          <Button
          onClick={handleSearch}
            className="bg-gray-700 hover:bg-gray-800"
          >
            Search
          </Button>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Rules ({totalCount} total)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-500">Loading alert rules...</p>
              </div>
            </div>
          ) : alertRules.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No alert rules yet</h3>
              <p className="text-gray-500 mb-4">Create your first alert rule to monitor vehicle conditions and get notified of issues.</p>
              <Link href="/alerts/create">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Alert Rule
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4 py-2 text-left font-medium text-gray-600">
                      Name
                    </TableHead>
                    <TableHead className="px-4 py-2 text-left font-medium text-gray-600">
                      Severity
                    </TableHead>
                    <TableHead className="px-4 py-2 text-left font-medium text-gray-600">
                      System
                    </TableHead>
                    <TableHead className="px-4 py-2 text-left font-medium text-gray-600">
                      Conditions
                    </TableHead>
                    <TableHead className="px-4 py-2 text-left font-medium text-gray-600">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alertRules.map((rule) => (
                    <TableRow
                      key={rule.id}
                      className="hover:bg-gray-50 border-b"
                    >
                      <TableCell className="font-medium text-blue-600 hover:underline">
                        <Link href={`/alerts/${rule.id}`}>{rule.name}</Link>
                      </TableCell>
                      <TableCell className="px-4 py-2 capitalize">
                        <Link href={`/alerts/${rule.id}`}></Link>
                        {rule.severity}
                      </TableCell>
                      <TableCell className="px-4 py-2 capitalize">
                        {rule.system}
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        {rule.conditions.map((c) => (
                          <div key={c.id}>
                            {c.field} {c.operator} {c.threshold}
                          </div>
                        ))}
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        <div className="flex items-center gap-1">
                          {/* View */}
                          <Link href={`/alerts/${rule.id}`}>
                            <Button variant="ghost" size="sm" aria-label={`View alert rule ${rule.name}`}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>

                          {/* Edit */}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            aria-label={`Edit alert rule ${rule.name}`}
                            onClick={(e) => {
                              console.log("Edit button clicked for alert:", rule.id);
                              e.stopPropagation();
                              router.push(`/alerts/edit/${rule.id}`);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Delete alert rule ${rule.name}`}
                            onClick={async () => {
                              if (
                                confirm(
                                  "Are you sure you want to delete this alert rule?"
                                )
                              ) {
                                try {
                                  await deleteAlertRule(rule.id);
                                  alert("Alert rule deleted successfully");
                                  fetchAlertRules();
                                } catch (err) {
                                  console.error("Delete failed:", err);
                                  alert("Failed to delete alert rule");
                                }
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex flex-col md:flex-row justify-between items-center mt-4 px-2 gap-3">
                <span className="text-sm text-gray-600">
                  Showing {(page - 1) * limit + 1}–
                  {Math.min(page * limit, totalCount)} of {totalCount}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <Button
                        key={p}
                        variant={p === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    )
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

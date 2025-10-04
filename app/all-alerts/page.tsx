"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, Trash2 } from "lucide-react";
import { listAlerts, deleteAlertRule } from "@/lib/api";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

interface Condition {
  id: number;
  field: string;
  operator: string;
  threshold: number;
}

interface AlertRule {
  id: number;
  alert_type: string;
  description: string;
  severity: string;
  system: string;
  is_active: boolean;
  title: string;
  message: string;
  status_label: string;
  trigger_duration_sec: number;
  cooldown_minutes: number;
  auto_resolve: boolean;
  notification_channels: string[];
  recipients: string[];
  vehicle_types: number[];
  conditions: Condition[];
}

export default function AlertRulesPage() {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);

  // input vs applied search
  const [searchText, setSearchText] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchAlertRules = async (pageNum: number = page) => {
    setLoading(true);
    try {
      const data = await listAlerts(pageNum);
      const rules: AlertRule[] = data.results ?? [];
      const count: number = data.count ?? rules.length;

      setAlertRules(rules);
      setTotalCount(count);
      setTotalPages(Math.ceil(count / limit));
      setPage(pageNum);
    } catch (err) {
      console.error("Error fetching alert rules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertRules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // frontend filter
  const filteredRules = alertRules.filter((r) => {
    const search = searchInput.toLowerCase();
    return (
      r.title?.toLowerCase().includes(search) ||
      r.alert_type?.toLowerCase().includes(search) ||
      r.system?.toLowerCase().includes(search) ||
      r.severity?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
          <p className="text-gray-600">Manage and monitor your alerts</p>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by title, alert type, severity..."
              className="pl-10"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <Button
            onClick={() => {
              setSearchInput(searchText); // apply search
              setPage(1); // reset page
              fetchAlertRules(1);
            }}
          >
            Search
          </Button>
        </CardContent>
      </Card>

      {/* Alert Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Alerts ({totalCount} total, {filteredRules.length} shown)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p>Loading alert ...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alert Type</TableHead>
                    <TableHead>System</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status Label</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500">
                        No alerts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell>{rule.alert_type}</TableCell>
                        <TableCell className="capitalize">{rule.system}</TableCell>
                        <TableCell className="capitalize">
                          <span
                            className={`font-medium ${
                              rule.severity === "high"
                                ? "text-red-600"
                                : rule.severity === "medium"
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          >
                            {rule.severity}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{rule.title}</TableCell>
                        <TableCell>
                          <span
                            className={`capitalize px-2 py-1 rounded-full text-xs font-medium ${
                              rule.status_label === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {rule.status_label}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Link href={`/all-alerts/${rule.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                if (confirm("Are you sure you want to delete this alert?")) {
                                  try {
                                    await deleteAlertRule(rule.id);
                                    alert("Alert rule deleted successfully");
                                    fetchAlertRules(page);
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
                    ))
                  )}
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

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Button
                      key={p}
                      variant={p === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  ))}

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

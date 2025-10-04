"use client";

import { useEffect, useState } from "react";
import { listSIMCards, listSIMCardsSummary, deleteSIMCard } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Database,
  DollarSign,
  HardDrive,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api"; // assuming you have axios instance
import { toast } from "@/components/ui/use-toast";

interface SIMCard {
  id: number;
  sim_id: string;
  iccid: string;
  status: string;
  plan_name: string;
  plan_data_limit_gb: number;
  plan_cost: string;
  current_data_used_gb: number;
  current_cycle_start: string;
  overage_threshold: number;
  device: number;
  last_activity: string;
  signal_strength: string;
  created_at: string;
}

interface Summary {
  count: number;
  total_data_used_gb: number;
  total_monthly_cost: number;
}

export default function SIMCardListPage() {
  const [simCards, setSimCards] = useState<SIMCard[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // keep for UI math (server should use same page size)
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [summary, setSummary] = useState<Summary | null>(null);

  // Helper to fetch one page from server
  const fetchSIMCards = async (pageNum: number = 1) => {
    setLoading(true);
    try {
      // Call API with page param
      const resp = await listSIMCards(pageNum);

      // Expect server response like: { results: [], count: number }
      const rows: SIMCard[] = resp.results ?? resp.data ?? [];
      const count: number = resp.count ?? resp.total ?? 0;

      // If you want client-side search fallback (server doesn't support search), filter here
      let filtered = rows;
      if (searchTerm && !resp.searchSupported) {
        filtered = rows.filter(
          (sim) =>
            sim.sim_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sim.iccid.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sim.plan_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setSimCards(filtered);
      setTotalCount(count);
      setTotalPages(Math.max(1, Math.ceil(count / limit)));
      setPage(pageNum);
    } catch (err) {
      console.error("Failed to fetch SIM cards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial fetch
    fetchSIMCards(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fetch summary
  const fetchSummary = async () => {
    try {
      const resp = await listSIMCardsSummary();
      setSummary(resp);
    } catch (err) {
      console.error("Failed to fetch summary:", err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  // When page changes, load that page
  useEffect(() => {
    // Avoid refetch on mount double-call; only fetch when page changes after mount.
    fetchSIMCards(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const suspendSIM = async (id: number) => {
    if (!confirm("Are you sure you want to suspend this SIM?")) return;
    try {
      await api.post(`/api/fleet/sim-cards/${id}/suspend/`);
      alert("SIM suspended successfully");
      fetchSIMCards(page);
    } catch (err) {
      console.error(err);
      alert("Failed to suspend SIM");
    }
  };

  // Pagination helper that returns numbers and '...' tokens
  const getPaginationRange = (total: number, current: number) => {
    const totalPageNumbers = 7; // adjust visible buttons count

    if (total <= totalPageNumbers) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(current - 1, 2);
    const rightSiblingIndex = Math.min(current + 1, total - 1);

    const shouldShowLeftEllipsis = leftSiblingIndex > 2;
    const shouldShowRightEllipsis = rightSiblingIndex < total - 1;

    const pages: Array<number | string> = [1];

    if (shouldShowLeftEllipsis) {
      pages.push("left-ellipsis");
    } else {
      for (let p = 2; p < leftSiblingIndex; p++) pages.push(p);
    }

    for (let p = leftSiblingIndex; p <= rightSiblingIndex; p++) pages.push(p);

    if (shouldShowRightEllipsis) {
      pages.push("right-ellipsis");
    } else {
      for (let p = rightSiblingIndex + 1; p < total; p++) pages.push(p);
    }

    pages.push(total);
    return pages;
  };

  // Handle search: set page to 1 and fetch. If already on page 1, just fetch.
  const handleSearch = () => {
    if (page === 1) {
      fetchSIMCards(1);
    } else {
      setPage(1);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const startIndex = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, totalCount);
  const handleDeleteSIMCard = async (id: number) => {
    if (!confirm("Are you sure you want to delete this SIM card?")) return;

    try {
      await deleteSIMCard(id); // call your API
      toast({
        title: "SIM deleted",
        description: "The SIM card has been deleted successfully.",
        variant: "destructive", // optional: shows red toast
      });
      fetchSIMCards(page); // refresh the table
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to delete SIM",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SIM Cards</h1>
          <p className="text-gray-600">Manage and monitor your SIM cards</p>
        </div>
        <Link href="/sims/add">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add SIM Card
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border rounded-xl bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-blue-700 text-sm">
                <HardDrive className="w-4 h-4" /> Total SIMs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-700">
                {summary.count}
              </p>
            </CardContent>
          </Card>

          <Card className="border rounded-xl bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-green-700 text-sm">
                <Database className="w-4 h-4" /> Total Data Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-700">
                {summary.total_data_used_gb} GB
              </p>
            </CardContent>
          </Card>

          <Card className="border rounded-xl bg-yellow-50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-yellow-700 text-sm">
                <DollarSign className="w-4 h-4" /> Monthly Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-700">
                ₹{summary.total_monthly_cost.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search Filter */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by SIM ID, ICCID, or Plan..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearchKeyPress}
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

      {/* SIM Cards Table */}
      <Card>
        <CardHeader>
          <CardTitle>SIM Cards ({totalCount} total)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-gray-500">Loading SIM cards...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* ShadCN Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SIM ID</TableHead>
                      <TableHead>ICCID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Data Limit (GB)</TableHead>
                      <TableHead>Used (GB)</TableHead>
                      <TableHead>Signal</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {simCards.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="text-center py-8 text-gray-500"
                        >
                          No SIM cards found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      simCards.map((sim) => (
                        <TableRow key={sim.id} className="hover:bg-gray-50">
                          <TableCell>
                            <Link
                              className="text-blue-600 hover:underline font-medium"
                              href={`/sims/${sim.id}`}
                            >
                              {sim.sim_id}
                            </Link>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {sim.iccid}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                sim.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : sim.status === "suspended"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {sim.status}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium">
                            {sim.plan_name}
                          </TableCell>
                          <TableCell>{sim.plan_data_limit_gb}</TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {sim.current_data_used_gb}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                sim.signal_strength === "excellent"
                                  ? "bg-green-100 text-green-700"
                                  : sim.signal_strength === "good"
                                  ? "bg-blue-100 text-blue-700"
                                  : sim.signal_strength === "fair"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {sim.signal_strength}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {sim.last_activity
                              ? new Date(sim.last_activity).toLocaleString()
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {sim.status !== "suspended" ? (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => suspendSIM(sim.id)}
                                className="h-8"
                              >
                                Suspend
                              </Button>
                            ) : (
                              <span className="text-gray-500 text-sm">
                                Suspended
                              </span>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8"
                              onClick={() => handleDeleteSIMCard(sim.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-4">
                  <span className="text-sm text-gray-600">
                    Showing {startIndex}–{endIndex} of {totalCount}
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1 || loading}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>

                    {getPaginationRange(totalPages, page).map((p, idx) =>
                      typeof p === "string" ? (
                        <Button
                          key={"ell-" + idx}
                          variant="ghost"
                          size="sm"
                          disabled
                        >
                          ...
                        </Button>
                      ) : (
                        <Button
                          key={p}
                          variant={p === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(p as number)}
                          className="min-w-[2.5rem]"
                          disabled={loading}
                        >
                          {p}
                        </Button>
                      )
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === totalPages || loading}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

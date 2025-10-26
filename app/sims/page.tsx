"use client";

import { useEffect, useState } from "react";
import { listSIMCards, listSIMCardsSummary, deleteSIMCard } from "@/lib/api";
import { fuzzySearch } from "@/lib/fuzzySearch";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Database,
  DollarSign,
  HardDrive,
  Plus,
  Search,
  Trash2,
  Edit,
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
  const [error, setError] = useState<string>("");

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // keep for UI math (server should use same page size)
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [summary, setSummary] = useState<Summary | null>(null);

  // Helper to fetch one page from server
  const fetchSIMCards = async (pageNum: number = 1) => {
    setLoading(true);
    setError(""); // Clear any previous errors
    
    // First, try to check if we have authentication
    const userStr = localStorage.getItem("user");
    let hasAuth = false;
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        hasAuth = !!user?.token;
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
      }
    }
    
    if (!hasAuth) {
      const accessToken = localStorage.getItem("access_token");
      hasAuth = !!accessToken;
    }
    
    if (!hasAuth) {
      setError("No authentication token found. Please log in again.");
      setLoading(false);
      return;
    }
    
    try {
      // Call API with page param
      const resp = await listSIMCards(pageNum);

      // Expect server response like: { results: [], count: number }
      const rows: SIMCard[] = resp.results ?? resp.data ?? [];
      const count: number = resp.count ?? resp.total ?? 0;

      // Apply fuzzy search filter
      let filtered = rows;
      if (searchTerm) {
        filtered = fuzzySearch(rows, searchTerm, ['sim_id', 'iccid', 'plan_name', 'status'], {
          threshold: 0.3,
          minLength: 2
        });
      }

      setSimCards(filtered);
      setTotalCount(count);
      setTotalPages(Math.max(1, Math.ceil(count / limit)));
      setPage(pageNum);
    } catch (err: any) {
      console.error("Failed to fetch SIM cards:", err);
      console.error("Error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url
      });
      
      // Clear any existing data and show error
      setSimCards([]);
      setTotalCount(0);
      setTotalPages(1);
      
      // If it's a 403 error, provide helpful guidance
      if (err.response?.status === 403) {
        console.warn("⚠️ Access denied to SIM cards API.");
        setError("The SIM cards API is not accessible. This could be because: 1) The API endpoint doesn't exist yet, 2) Your account lacks permissions, or 3) The feature is not implemented. You can still add new SIM cards using the 'Add SIM Card' button.");
      } else if (err.response?.status === 404) {
        console.warn("⚠️ SIM cards API endpoint not found.");
        setError("SIM cards API endpoint not found. The backend might not have this feature implemented yet. You can still add new SIM cards using the 'Add SIM Card' button.");
      } else if (err.response?.status === 401) {
        console.warn("⚠️ Authentication failed.");
        setError("Authentication failed. Please log in again.");
      } else {
        // For other errors, show generic error
        setError(`Failed to load SIM cards: ${err.response?.statusText || err.message}. Please try again or contact support.`);
      }
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
    } catch (err: any) {
      console.error("Failed to fetch summary:", err);
      console.error("Summary error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url
      });
      
      // Don't set summary data on error - let it remain null
      console.warn("⚠️ SIM summary API not available.");
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
      
      // Show success message using toast instead of alert
      toast({
        title: "SIM suspended",
        description: "The SIM card has been suspended successfully.",
        variant: "default",
      });
      
      // Immediately update the SIM status in local state for instant UI feedback
      setSimCards(prevCards => 
        prevCards.map(card => 
          card.id === id ? { ...card, status: 'suspended' } : card
        )
      );
      
      // Refresh the table data after a short delay to ensure backend is updated
      setTimeout(() => {
        fetchSIMCards(page);
      }, 500);
      
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to suspend SIM",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
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
  const openDelete = (simCard: SIMCard) => {
    setDeleteId(simCard.id);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      console.log("🗑️ Attempting to delete SIM card with ID:", deleteId);
      const response = await deleteSIMCard(deleteId);
      console.log("✅ Delete API response:", response);
      
      // Show success message
      toast({
        title: "SIM deleted",
        description: "The SIM card has been deleted successfully.",
        variant: "destructive", // optional: shows red toast
      });

      // Immediately remove the SIM from local state for instant UI feedback
      setSimCards(prevCards => {
        const filtered = prevCards.filter(card => card.id !== deleteId);
        console.log("🔄 Updated SIM cards list:", filtered.length, "remaining");
        return filtered;
      });
      
      // Update the count
      setTotalCount(prevCount => {
        const newCount = prevCount - 1;
        console.log("📊 Updated total count:", newCount);
        return newCount;
      });
      
      // Check if current page becomes empty after deletion
      const remainingCards = simCards.length - 1;
      if (remainingCards === 0 && page > 1) {
        // Go to previous page if current page becomes empty
        setPage(prevPage => Math.max(1, prevPage - 1));
      }
      
      // Refresh summary data
      await fetchSummary();
      
      // Refresh the table data after a short delay to ensure backend is updated
      setTimeout(() => {
        console.log("🔄 Refreshing table data after deletion");
        fetchSIMCards(page);
      }, 1000); // Increased delay to 1 second
      
      setDeleteOpen(false);
      setDeleteId(null);
    } catch (err) {
      console.error("❌ Error deleting SIM:", err);
      toast({
        title: "Failed to delete SIM",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setDeleteOpen(false);
      setDeleteId(null);
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="font-medium">API Access Issue:</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setError("");
                fetchSIMCards(page);
                fetchSummary();
              }}
              className="ml-4 text-red-600 border-red-300 hover:bg-red-100"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Info Message for API Issues */}
      {error && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium">What you can do:</p>
              <ul className="text-sm mt-1 space-y-1">
                <li>• Use the <strong>"Add SIM Card"</strong> button to create new SIM cards</li>
                <li>• Contact your administrator to enable SIM management API access</li>
                <li>• Check if the backend has SIM management endpoints implemented</li>
              </ul>
            </div>
          </div>
        </div>
      )}

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
                          {error ? (
                            <div className="flex flex-col items-center gap-2">
                              <p>Unable to load SIM cards due to API access issue.</p>
                              <p className="text-sm">The 'Add SIM Card' button above should still work to create new SIM cards.</p>
                            </div>
                          ) : (
                            "No SIM cards found."
                          )}
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
                            <div className="flex items-center gap-2">
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
                                asChild
                              >
                                <Link href={`/sims/edit/${sim.id}`}>
                                  <Edit className="w-4 h-4" />
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openDelete(sim);
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

      {/* Delete Dialog */}
      <Dialog
        open={deleteOpen}
        onOpenChange={handleDialogClose}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete SIM card "{simCards.find(s => s.id === deleteId)?.sim_id}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDialogClose(false);
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDelete();
              }}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

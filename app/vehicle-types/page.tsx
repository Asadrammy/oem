// app/vehicles/add/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { listVehiclesType, deleteVehicleType } from "@/lib/api";

type VehicleType = {
  id: number;
  code: string;
  name: string;
  category: string;
  drivetrain: string;
  battery_capacity_kwh: number;
  motor_power_kw: number;
  wltp_range_km: number;
  status: string;
  description?: string;
};

export default function Page() {
  const router = useRouter();
  const [items, setItems] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // search + filters
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // new: exact Code filter (unique, selectable only)
  const [codeOptions, setCodeOptions] = useState<string[]>([]);
  const [selectedCode, setSelectedCode] = useState<string>("all");

  // pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [totalCount, setTotalCount] = useState(0);

  const fetchPage = async (pageNum: number) => {
    setLoading(true);
    setError("");
    try {
      const resp = await listVehiclesType(pageNum);
      const rows: VehicleType[] = Array.isArray(resp?.results)
        ? resp.results
        : Array.isArray(resp)
        ? resp
        : [];

      // normalize rows
      const normalized = rows.map((r) => ({
        id: r.id,
        code: r.code ?? "",
        name: r.name ?? `Type ${r.id}`,
        category: r.category ?? "",
        drivetrain: r.drivetrain ?? "",
        battery_capacity_kwh: r.battery_capacity_kwh ?? 0,
        motor_power_kw: r.motor_power_kw ?? 0,
        wltp_range_km: r.wltp_range_km ?? 0,
        status: r.status ?? "inactive",
        description: r.description ?? "",
      }));

      setItems(normalized);

      // build unique code options from current dataset
      const uniqueCodes = [...new Set(normalized.map((t) => t.code).filter(Boolean))].sort();
      setCodeOptions(uniqueCodes);

      setTotalCount(resp.count ?? normalized.length);
      setPage(pageNum);
    } catch (e: any) {
      setError(e?.message || "Failed to load vehicle types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(1);
  }, []);

  const filtered = useMemo(() => {
    let data = items;

    // exact Code filter if selected
    if (selectedCode !== "all") {
      const target = selectedCode.toLowerCase();
      data = data.filter((t) => (t.code ?? "").toLowerCase() === target);
    }

    if (!searchTerm.trim()) return data;
    const q = searchTerm.toLowerCase();
    return data.filter(
      (t) =>
        t.name?.toLowerCase().includes(q) ||
        (t.code ?? "").toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q)
    );
  }, [items, searchTerm, selectedCode]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filtered.slice(start, end);
  }, [filtered, page]);

  const openDelete = (row: VehicleType) => {
    setDeleteId(row.id);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setError("");
    try {
      await deleteVehicleType(deleteId);
      setItems((prev) => prev.filter((it) => it.id !== deleteId));
      setDeleteOpen(false);
      setDeleteId(null);
    } catch (e: any) {
      setError(e?.message || "Failed to delete vehicle type");
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

  const goToVehicleTypeDetail = (id: number) => {
    router.push(`/vehicle-types/${id}`); // adjust the route if needed
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Types</h1>
          <p className="text-gray-600">
            Define and manage vehicle categories for your fleet
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/vehicle-types/add">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Vehicle Type
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:gap-2">
          {/* free text search */}
          <div className="relative flex-1 min-w-64 mb-2 md:mb-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, code, description..."
              className="pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* exact Code (unique) */}
          <Select
            value={selectedCode}
            onValueChange={(val) => {
              setSelectedCode(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Filter by Code" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Codes</SelectItem>
              {codeOptions.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={() => {
              setSearchTerm(query);
              setPage(1);
            }}
            className="bg-gray-700 hover:bg-gray-800 md:ml-2"
          >
            Search
          </Button>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Types {loading ? "(loading…)" : `(${filtered.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2 mb-3">
              {error}
            </div>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Drivetrain</TableHead>
                  <TableHead>Battery (kWh)</TableHead>
                  <TableHead>Motor (kW)</TableHead>
                  <TableHead>Range (km)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-sm text-gray-500">
                      Loading…
                    </TableCell>
                  </TableRow>
                )}

                {!loading && paginatedData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-sm text-gray-500">
                      No vehicle types found.
                    </TableCell>
                  </TableRow>
                )}

                {!loading &&
                  paginatedData.map((row) => (
                    <TableRow
                      key={row.id}
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        // Don't navigate if delete dialog is open for this row
                        if (deleteOpen && deleteId === row.id) {
                          return;
                        }
                        goToVehicleTypeDetail(row.id);
                      }}
                    >
                      <TableCell>
                        <span
                          className="text-blue-600 hover:underline cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            goToVehicleTypeDetail(row.id);
                          }}
                        >
                          {row.code}
                        </span>
                      </TableCell>

                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.category}</TableCell>
                      <TableCell>{row.drivetrain}</TableCell>
                      <TableCell>{row.battery_capacity_kwh}</TableCell>
                      <TableCell>{row.motor_power_kw}</TableCell>
                      <TableCell>{row.wltp_range_km}</TableCell>
                      <TableCell>{row.status}</TableCell>

                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="View"
                          onClick={(e) => {
                            e.stopPropagation();
                            goToVehicleTypeDetail(row.id);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        <Button 
                          variant="ghost" 
                          size="sm"
                          title="Edit"
                          onClick={(e) => {
                            console.log("Edit button clicked for vehicle type:", row.id);
                            e.stopPropagation();
                            router.push(`/vehicle-types/edit/${row.id}`);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openDelete(row);
                          }}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>

                        {/* Delete Dialog */}
                        <Dialog
                          open={deleteOpen && deleteId === row.id}
                          onOpenChange={handleDialogClose}
                        >
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm Delete</DialogTitle>
                              <DialogDescription>
                                "Are you sure you want to delete vehicle type "
                                {row.name}"?
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
                                {deleting ? "Deleting…" : "Delete"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-4 px-2 gap-3">
              <span className="text-sm text-gray-600">
                Showing {(page - 1) * rowsPerPage + 1}–
                {Math.min(page * rowsPerPage, filtered.length)} of {filtered.length}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                {Array.from(
                  { length: Math.ceil(filtered.length / rowsPerPage) || 1 },
                  (_, i) => i + 1
                ).map((p) => (
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
                  onClick={() =>
                    setPage((p) =>
                      Math.min(
                        Math.ceil(filtered.length / rowsPerPage) || 1,
                        p + 1
                      )
                    )
                  }
                  disabled={page >= Math.ceil(filtered.length / rowsPerPage)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

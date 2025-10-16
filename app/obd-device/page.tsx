// app/devices/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Search, Eye } from "lucide-react";
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
import { Label } from "@/components/ui/label";

import {
  listDevices,
  createDevice,
  updateDevice,
  deleteDevice,
} from "@/lib/api";
import { fuzzySearch } from "@/lib/fuzzySearch";
import Link from "next/link";

type Device = {
  id: number;
  device_id: string;
  serial_number: string;
  vehicle: number;
  firmware_version: string;
  report_interval_sec: number;
  can_baud_rate: number;
  is_active: boolean;
};

export default function DevicesPage() {
  const router = useRouter();
  const [items, setItems] = useState<Device[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // CRUD dialog state

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [createForm, setCreateForm] = useState<Partial<Device>>({
    device_id: "",
    serial_number: "",
    vehicle: 0,
    firmware_version: "",
    report_interval_sec: 0,
    can_baud_rate: 0,
    is_active: true,
  });

  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Device>>({});
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [totalCount, setTotalCount] = useState(0);

  // Search
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return items;
    return fuzzySearch(items, searchTerm, ['device_id', 'serial_number', 'firmware_version'], {
      threshold: 0.3,
      minLength: 2
    });
  }, [items, searchTerm]);
  // Fetch page
  const fetchPage = async (pageNum: number) => {
    setLoading(true);
    setError("");
    try {
      const resp = await listDevices(pageNum);
      const rows: Device[] = resp?.results ?? resp ?? [];
      setItems(rows);
      setTotalCount(resp.count ?? rows.length);
      setPage(pageNum);
    } catch (e: any) {
      setError(e?.message || "Failed to load devices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(1);
  }, []);

  const handleDelete = async () => {
    if (deleteId == null) return;
    try {
      await deleteDevice(deleteId);
      setItems((prev) => prev.filter((d) => d.id !== deleteId));
      setDeleteOpen(false);
      setDeleteId(null);
    } catch (e: any) {
      setError(e?.message || "Failed to delete device");
    }
  };

  const totalPages = Math.ceil(totalCount / rowsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Devices</h1>
          <p className="text-gray-600">Manage onboard devices</p>
        </div>

        <Link href="/obd-device/add">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add OBD Device
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <Card>
          <CardContent className="p-4 flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by Device ID,serial Number,Firmware v..."
                className="pl-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button
              onClick={() => setSearchTerm(query)}
              className="bg-gray-700 hover:bg-gray-800"
            >
              Search
            </Button>
          </CardContent>
        </Card>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Devices ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device ID</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Firmware</TableHead>
                  <TableHead>Interval (s)</TableHead>
                  <TableHead>CAN Baud</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                        Loading devices...
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {!loading && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No OBD devices found</h3>
                        <p className="text-gray-500 mb-4">Get started by adding your first OBD device to monitor vehicle data.</p>
                        <Link href="/obd-device/add">
                          <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Add OBD Device
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {filtered
                  .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                  .map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>
                        {" "}
                        <Link
                          className="text-blue-600 hover:underline"
                          href={`/obd-device/${d.id}`}
                        >
                          {d.device_id}
                        </Link>
                      </TableCell>
                      <TableCell>{d.serial_number}</TableCell>
                      <TableCell>{d.firmware_version}</TableCell>
                      <TableCell>{d.report_interval_sec}</TableCell>
                      <TableCell>{d.can_baud_rate}</TableCell>

                      <TableCell className="text-right space-x-2">
                        {/* Edit */}
                        <Link href={`/obd-device/${d.id}`}>
                          <Button variant="ghost" size="sm" aria-label={`View device ${d.device_id}`}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          aria-label={`Edit device ${d.device_id}`}
                          onClick={(e) => {
                            console.log("Edit button clicked for device:", d.id);
                            e.stopPropagation();
                            router.push(`/obd-device/edit/${d.id}`);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        {/* Delete */}
                        <Dialog
                          open={deleteOpen && deleteId === d.id}
                          onOpenChange={setDeleteOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Delete device ${d.device_id}`}
                              onClick={() => setDeleteId(d.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete {d.device_id}?</DialogTitle>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setDeleteOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={handleDelete}
                              >
                                Delete
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
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => fetchPage(page - 1)}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <Button
                      key={p}
                      variant={p === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => fetchPage(p)}
                    >
                      {p}
                    </Button>
                  )
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => fetchPage(page + 1)}
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

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Eye, Download, Plus, Trash2, Edit } from "lucide-react";
import {
  listFirmwareUpdates,
  rollOutFirmwareUpdates,
  firmwareUpdatesDelete,
} from "@/lib/api";
import { fuzzySearch } from "@/lib/fuzzySearch";
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
import { useToast } from "@/components/ui/use-toast";

interface FirmwareUpdate {
  id: number;
  component: string;
  version: string;
  description: string;
  release_date: string;
  file: string;
  file_size: number;
  priority: number;
  status: string;
  target_count: number;
  success_count: number;
  failure_count: number;
}

export default function FirmwareUpdatesPage() {
  const [updates, setUpdates] = useState<FirmwareUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();
  const fetchUpdates = async (pageNum: number = page) => {
    setLoading(true);
    try {
      const resp = await listFirmwareUpdates(pageNum); // expects {results, count}
      let rows: FirmwareUpdate[] = resp.results ?? [];
      let count: number = resp.count ?? rows.length;

      // Deduplicate by component + version combination
      const seen = new Set<string>();
      rows = rows.filter((fw) => {
        const key = `${fw.component}-${fw.version}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });

      // Apply fuzzy search filter
      if (searchTerm) {
        rows = fuzzySearch(rows, searchTerm, ['version', 'status', 'component', 'release_date', 'description'], {
          threshold: 0.3,
          minLength: 2
        });
      }

      setUpdates(rows);
      setTotalCount(count);
      setTotalPages(Math.ceil(count / limit));
      setPage(pageNum);
    } catch (err) {
      console.error("Error fetching firmware updates:", err);
    } finally {
      setLoading(false);
    }
  };

  const openDelete = (update: FirmwareUpdate) => {
    setDeleteId(update.id);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await firmwareUpdatesDelete(deleteId);
      toast({
        title: "Deleted",
        description: "Firmware update deleted successfully!",
      });
      setUpdates((prev) => prev.filter((u) => u.id !== deleteId));
      setDeleteOpen(false);
      setDeleteId(null);
      fetchUpdates(page); // refresh
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to delete firmware",
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

  useEffect(() => {
    fetchUpdates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Firmware Updates</h1>
          <p className="text-gray-600">Manage OTA firmware updates</p>
        </div>
        <Link href="/firmware-updates/add">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Update
          </Button>
        </Link>
      </div>

      {/* Search Filter */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by version,status,component,release_date..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={() => {
              setPage(1);
              fetchUpdates(1);
            }}
            className="bg-gray-700 hover:bg-gray-800"
          >
            Search
          </Button>
        </CardContent>
      </Card>

      {/* Firmware Updates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Firmware Updates ({totalCount} total)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading firmware updates...</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Release Date</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {updates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        No firmware updates found
                      </TableCell>
                    </TableRow>
                  ) : (
                    updates.map((fw) => (
                      <TableRow key={fw.id}>
                        <TableCell>{fw.component}</TableCell>
                        <TableCell className="font-medium">
                          {fw.version}
                        </TableCell>
                        <TableCell
                          className="max-w-48 truncate"
                          title={fw.description}
                        >
                          {fw.description.replace(/['"]+/g, "")}
                        </TableCell>
                        <TableCell>{fw.release_date}</TableCell>
                        <TableCell>
                          <a
                            href={fw.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-600 hover:underline"
                          >
                            <Download className="w-4 h-4 mr-1" />{" "}
                            {(fw.file_size / 1024).toFixed(1)} KB
                          </a>
                        </TableCell>
                        <TableCell className="capitalize">
                          {fw.status}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {/* View */}
                          <Link href={`/firmware-updates/${fw.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>

                          {/* Edit */}
                          <Link href={`/firmware-updates/edit/${fw.id}`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>

                          {/* Roll Out */}
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={async () => {
                              if (
                                confirm(
                                  "Are you sure you want to roll out this firmware update?"
                                )
                              ) {
                                try {
                                  await rollOutFirmwareUpdates(fw.id);
                                  alert("Firmware rolled out successfully!");
                                  fetchUpdates(page); // refresh table
                                } catch (err) {
                                  console.error(err);
                                  alert("Failed to roll out firmware");
                                }
                              }
                            }}
                          >
                            Roll Out
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openDelete(fw);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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

      {/* Delete Dialog */}
      <Dialog
        open={deleteOpen}
        onOpenChange={handleDialogClose}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete firmware update "{updates.find(u => u.id === deleteId)?.version}"?
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

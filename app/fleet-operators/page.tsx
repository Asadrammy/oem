"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Eye, Plus, Edit, Trash2 } from "lucide-react";
import { listFleetOperators, deleteFleetOperator } from "@/lib/api";
import { fuzzySearch } from "@/lib/fuzzySearch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FleetOperator {
  id: number;
  name: string;
  code: string;
  contact: string | null;
  contact_email: string | null;
  address: string | null;
  timezone: string;
  currency: string;
  language: string;
  date_format: string;
  created_at: string;
}

export default function FleetOperatorPage() {
  const router = useRouter();
  const [operators, setOperators] = useState<FleetOperator[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchOperators = async (pageNum: number = page) => {
    setLoading(true);
    try {
      const resp = await listFleetOperators(pageNum); // expects {results, count}
      let rows: FleetOperator[] = resp.results ?? [];
      let count: number = resp.count ?? rows.length;

      // Apply fuzzy search filter
      if (searchTerm) {
        rows = fuzzySearch(rows, searchTerm, ['name', 'code', 'contact_email', 'contact'], {
          threshold: 0.3,
          minLength: 2
        });
      }

      setOperators(rows);
      setTotalCount(count);
      setTotalPages(Math.ceil(count / limit));
      setPage(pageNum);
    } catch (err) {
      console.error("Error fetching fleet operators:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Auto-clear search when search term is empty
  useEffect(() => {
    if (searchTerm === "") {
      fetchOperators(1);
    }
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fleet Operators</h1>
          <p className="text-gray-600">Manage and monitor your fleet operators</p>
        </div>
        <Link href="/fleet-operators/add">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Operator
          </Button>
        </Link>
      </div>

      {/* Search Filter */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name,contact email,code,contact..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={() => {
              setPage(1);
              fetchOperators(1);
            }}
            className="bg-gray-700 hover:bg-gray-800"
          >
            Search
          </Button>
        </CardContent>
      </Card>

      {/* Operators Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fleet Operators ({totalCount} total)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading operators...</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Contact Email</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>TimeZone</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operators.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        No operators found
                      </TableCell>
                    </TableRow>
                  ) : (
                    operators.map((op) => (
                      <TableRow key={op.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-blue-600 hover:underline">
                          <Link href={`/fleet-operators/${op.id}`}>{op.name}</Link>
                        </TableCell>
                        <TableCell>{op.code}</TableCell>
                        <TableCell>{op.contact_email || "N/A"}</TableCell>
                        <TableCell>{op.contact || "N/A"}</TableCell>
                        <TableCell>{op.timezone || "N/A"}</TableCell>
                        <TableCell>{op.currency || "N/A"}</TableCell>
                        <TableCell className="text-right space-x-0">
                          <Link href={`/fleet-operators/${op.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              console.log("Edit button clicked for operator:", op.id);
                              e.stopPropagation();
                              router.push(`/fleet-operators/edit/${op.id}`);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              if (confirm("Are you sure you want to delete this operator?")) {
                                try {
                                  await deleteFleetOperator(op.id);
                                  alert("Operator deleted successfully");
                                  fetchOperators(page);
                                } catch (err) {
                                  console.error(err);
                                  alert("Failed to delete operator");
                                }
                              }
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

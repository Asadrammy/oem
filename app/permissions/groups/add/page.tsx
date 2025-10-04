"use client";

import { useEffect, useState } from "react";
import { getGroups, getGroupPermissions,getPermissions, assignPermissionsToGroup } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface Permission {
  id: number;
  name: string;
  codename: string;
  content_type_app: string;
  content_type_model: string;
  content_type_name: string;
}

export default function AssignPermissionsToGroupPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      const resp = await getGroups();
      setGroups(resp ?? []);
    };
    fetchGroups();
  }, []);

  // fetch group permissions
  const fetchPermissions = async ( pageNum = 1) => {
    setLoading(true);
    try {
      const resp = await getPermissions(); // assume array of permissions
      const rows = resp ?? [];
      setPermissions(rows.slice((pageNum - 1) * limit, pageNum * limit));
      setTotalCount(rows.length);
      setTotalPages(Math.ceil(rows.length / limit));
      setPage(pageNum);
      setSelectedPermissions([]); // reset selection on group change
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  },[])

  // toggle permission selection
  const togglePermission = (id: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // assign permissions
  const handleAssignPermissions = async () => {
    if (!selectedGroup || selectedPermissions.length === 0) {
      alert("Select a group and at least one permission.");
      return;
    }
    setLoading(true);
    try {
      await assignPermissionsToGroup(selectedGroup, selectedPermissions);
      alert("Permissions assigned successfully!");
      setSelectedPermissions([]);
    } catch (err: any) {
      alert(err.message || "Error assigning permissions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Select Group */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle>Select Group</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Select
            value={selectedGroup ? String(selectedGroup) : ""}
            onValueChange={(val) => setSelectedGroup(Number(val))}
          >
            <SelectTrigger className="border-gray-300 hover:border-gray-400 focus:ring-2 focus:ring-indigo-500">
              <SelectValue placeholder="Select Group" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((g) => (
                <SelectItem key={g.id} value={String(g.id)}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAssignPermissions}
            disabled={loading || !selectedGroup || selectedPermissions.length === 0}
            className="bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto"
          >
            {loading ? "Adding..." : "Add Permission"}
          </Button>
        </CardContent>
      </Card>

      {/* Permissions Table */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle>Group Permissions ({totalCount} total)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading permissions...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Select</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Codename</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">App</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Model</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Content Type</th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <Checkbox
                          checked={selectedPermissions.includes(p.id)}
                          onCheckedChange={() => togglePermission(p.id)}
                        />
                      </td>
                      <td className="py-3 px-4">{p.name}</td>
                      <td className="py-3 px-4">{p.codename}</td>
                      <td className="py-3 px-4">{p.content_type_app}</td>
                      <td className="py-3 px-4">{p.content_type_model}</td>
                      <td className="py-3 px-4">{p.content_type_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex flex-col md:flex-row justify-between items-center mt-4 px-2 gap-3">
                <span className="text-sm text-gray-600">
                  Showing {(page - 1) * limit + 1}–{Math.min(page * limit, totalCount)} of {totalCount}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
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
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
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

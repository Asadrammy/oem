"use client";

import { useEffect, useState } from "react";
import { getGroups, listUsers, assignUsersToGroup } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AssignUsersToGroupPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
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

  // fetch users with pagination
  const fetchUsers = async (pageNum = 1) => {
    setLoading(true);
    try {
      const resp = await listUsers(pageNum); // expect {results, count, total_pages}
      let rows = resp.results ?? [];
      let count = resp.count ?? rows.length;

      setUsers(rows);
      setTotalCount(count);
      setTotalPages(Math.ceil(count / limit));
      setPage(pageNum);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  // toggle checkbox
  const toggleUser = (id: number) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  // handle add permission
  const handleAddPermission = async () => {
    if (!selectedGroup || selectedUsers.length === 0) {
      alert("Select a group and at least one user.");
      return;
    }

    setLoading(true);
    try {
      await assignUsersToGroup(selectedGroup, selectedUsers);
      alert("Users added to group successfully!");
      setSelectedUsers([]);
    } catch (err: any) {
      alert(err.message || "Error assigning users");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Select Group */}
      <Card className=" border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Select Group</CardTitle>
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
            onClick={handleAddPermission}
            disabled={loading || !selectedGroup || selectedUsers.length === 0}
            className="bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto"
          >
            {loading ? "Adding..." : "Add Permission"}
          </Button>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className=" border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Users ({totalCount} total)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading users...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Select</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Username</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => toggleUser(user.id)}
                        />
                      </td>
                      <td className="py-3 px-4">{user.username || user.name}</td>
                      <td className="py-3 px-4">{user.email}</td>
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

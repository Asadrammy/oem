"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Eye, Plus, Edit, Trash2 } from "lucide-react";
import { listUsers, deleteUser } from "@/lib/api";

interface UserProfile {
  id: number;
  user: number;
  phone_number: string | null;
  city: string | null;
  state: string | null;
  pin: string | null;
  address: string | null;
  role: string | null;
  preferred_theme: string | null;
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: UserProfile | null;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  last_login: string | null;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = async (pageNum: number = page) => {
    setLoading(true);
    try {
      const resp = await listUsers(pageNum); // expects {results, count}
      let rows: User[] = resp.results ?? [];
      let count: number = resp.count ?? rows.length;

      // local search filter
      if (searchTerm) {
        rows = rows.filter((u) =>
          u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

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
    fetchUsers();
  }, [page]);

  // Auto-clear search when search term is empty
  useEffect(() => {
    if (searchTerm === "") {
      fetchUsers(1);
    }
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage system users and their profiles</p>
        </div>
        <Link href="/user/add">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </Link>
      </div>

      {/* Search Filter */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by username or email..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={() => {
              setPage(1);
              fetchUsers(1);
            }}
            className="bg-gray-700 hover:bg-gray-800"
          >
            Search
          </Button>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({totalCount} total)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading users...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Username
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Role
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Active
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-blue-600 hover:underline">
                        <Link href={`/user/${u.id}`}>{u.username}</Link>
                      </td>
                      <td className="py-3 px-4">{u.email}</td>
                      <td className="py-3 px-4">
                        {u.first_name} {u.last_name}
                      </td>
                      <td className="py-3 px-4">
                        {u.profile?.role || "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        {u.is_active ? "Yes" : "No"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Link href={`/user/${u.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              console.log("Edit button clicked for user:", u.id);
                              e.stopPropagation();
                              router.push(`/user/edit/${u.id}`);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              if (
                                confirm("Are you sure you want to delete this user?")
                              ) {
                                try {
                                  await deleteUser(u.id);
                                  alert("User deleted successfully");
                                  fetchUsers(page);
                                } catch (err) {
                                  console.error(err);
                                  alert("Failed to delete user");
                                }
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

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

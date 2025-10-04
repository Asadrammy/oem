"use client";

import { useEffect, useState } from "react";
import { listUsers, getUserPermissions } from "@/lib/api"; // adjust paths
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";

type Permission = {
  id: number;
  name: string;
  codename: string;
  content_type_app: string;
  content_type_model: string;
  content_type_name: string;
};

export default function UserPermissionPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [groupPermissions, setGroupPermissions] = useState<Permission[]>([]);
  const [directPermissions, setDirectPermissions] = useState<Permission[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      const resp = await listUsers();
      setUsers(resp.results ?? []);
    };
    fetchUsers();
  }, []);

  // Fetch permissions when user changes
  const handleUserChange = async (id: string) => {
    setSelectedUser(id);
    if (!id) return;

    const resp = await getUserPermissions(Number(id));
    setGroupPermissions(resp?.group_permissions ?? []);
    setDirectPermissions(resp?.direct_permissions ?? []);
    setAllPermissions(resp?.all_permissions ?? []);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      {/* User Selection Card */}
      <Card className="shadow-lg rounded-lg border border-gray-200">
        <CardHeader>
          <CardTitle>User Permissions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Select
            value={selectedUser}
            onValueChange={handleUserChange}
          >
            <SelectTrigger className="w-full  border-gray-300 focus:ring-2 focus:ring-indigo-500 rounded-md">
              <SelectValue placeholder="Select User" />
            </SelectTrigger>
            <SelectContent>
              {users.map((u) => (
                <SelectItem key={u.id} value={String(u.id)}>
                  {u.username || u.name || u.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            className=" text-white w-full sm:w-auto"
            onClick={() => router.push(`/permissions/add`)}
          >
            Assign to Group
          </Button>
        </CardContent>
      </Card>

      {/* Permissions Tables */}
      {selectedUser && (
        <>
          {/* Direct Permissions */}
          <Card className="shadow-lg rounded-lg border border-gray-200">
            <CardHeader>
              <CardTitle>Direct Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              {directPermissions.length === 0 ? (
                <p className="text-gray-500">No direct permissions.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Codename</TableHead>
                        <TableHead>App</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Content Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {directPermissions.map((p) => (
                        <TableRow key={p.id} className="hover:bg-gray-50">
                          <TableCell>{p.id}</TableCell>
                          <TableCell>{p.name}</TableCell>
                          <TableCell>{p.codename}</TableCell>
                          <TableCell>{p.content_type_app}</TableCell>
                          <TableCell>{p.content_type_model}</TableCell>
                          <TableCell>{p.content_type_name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Group Permissions */}
          <Card className="shadow-lg rounded-lg border border-gray-200">
            <CardHeader>
              <CardTitle>Group Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              {groupPermissions.length === 0 ? (
                <p className="text-gray-500">No group permissions.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Codename</TableHead>
                        <TableHead>App</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Content Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupPermissions.map((p) => (
                        <TableRow key={p.id} className="hover:bg-gray-50">
                          <TableCell>{p.id}</TableCell>
                          <TableCell>{p.name}</TableCell>
                          <TableCell>{p.codename}</TableCell>
                          <TableCell>{p.content_type_app}</TableCell>
                          <TableCell>{p.content_type_model}</TableCell>
                          <TableCell>{p.content_type_name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Permissions */}
          <Card className="shadow-lg rounded-lg border border-gray-200">
            <CardHeader>
              <CardTitle>All Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              {allPermissions.length === 0 ? (
                <p className="text-gray-500">No permissions available.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Codename</TableHead>
                        <TableHead>App</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Content Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allPermissions.map((p) => (
                        <TableRow key={p.id} className="hover:bg-gray-50">
                          <TableCell>{p.id}</TableCell>
                          <TableCell>{p.name}</TableCell>
                          <TableCell>{p.codename}</TableCell>
                          <TableCell>{p.content_type_app}</TableCell>
                          <TableCell>{p.content_type_model}</TableCell>
                          <TableCell>{p.content_type_name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

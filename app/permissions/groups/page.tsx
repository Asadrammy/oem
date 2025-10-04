"use client";

import { useEffect, useState } from "react";
import { getGroups, getGroupPermissions } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Permission {
  id: number;
  name: string;
  codename: string;
  content_type_app: string;
  content_type_model: string;
  content_type_name: string;
}

export default function GroupPermissionsPage() {
    const router =useRouter()
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);

  // fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      const resp = await getGroups();
      setGroups(resp ?? []);
    };
    fetchGroups();
  }, []);

  // fetch permissions when group changes
  useEffect(() => {
    const fetchPermissions = async () => {
      if (!selectedGroup) return;
      setLoading(true);
      try {
        const resp = await getGroupPermissions(selectedGroup);
        setPermissions(resp ?? []);
      } catch (err) {
        console.error(err);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPermissions();
  }, [selectedGroup]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      {/* Group Select Card */}
      <Card className="shadow-md rounded-lg border border-gray-200">
        <CardHeader>
          <CardTitle>Select Group</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
          <Select
            value={selectedGroup ? String(selectedGroup) : ""}
            onValueChange={(val) => setSelectedGroup(Number(val))}
          >
            <SelectTrigger className="w-full  border-gray-300 focus:ring-2 focus:ring-indigo-500 rounded-md">
              <SelectValue placeholder="Choose a group" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((g) => (
                <SelectItem key={g.id} value={String(g.id)}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => router.push(`/permissions/groups/add`)}>
          Assign to Group
        </Button>
        </CardContent>
      </Card>

      {/* Permissions Table Card */}
      <Card className="shadow-md rounded-lg border border-gray-200">
        <CardHeader>
          <CardTitle>Group Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500">Loading permissions...</p>
          ) : permissions.length === 0 ? (
            <p className="text-gray-500">No permissions available for this group.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-full border">
                <TableHeader className="bg-gray-100">
                  <TableRow>
                    <TableHead className="px-4 py-2 text-left">ID</TableHead>
                    <TableHead className="px-4 py-2 text-left">Name</TableHead>
                    <TableHead className="px-4 py-2 text-left">Codename</TableHead>
                    <TableHead className="px-4 py-2 text-left">App</TableHead>
                    <TableHead className="px-4 py-2 text-left">Model</TableHead>
                    <TableHead className="px-4 py-2 text-left">Content Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map((p, idx) => (
                    <TableRow
                      key={p.id}
                      className={`hover:bg-gray-50 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      <TableCell className="px-4 py-2">{p.id}</TableCell>
                      <TableCell className="px-4 py-2">{p.name}</TableCell>
                      <TableCell className="px-4 py-2">{p.codename}</TableCell>
                      <TableCell className="px-4 py-2">{p.content_type_app}</TableCell>
                      <TableCell className="px-4 py-2">{p.content_type_model}</TableCell>
                      <TableCell className="px-4 py-2">{p.content_type_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

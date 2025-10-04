// "use client";

// import React, { useEffect, useState, useMemo } from "react";
// import { useRouter, useParams } from "next/navigation";
// import {
//   ArrowLeft,
//   Filter,
//   X,
//   RefreshCcw,
//   CheckSquare,
//   Square,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Card, CardContent } from "@/components/ui/card";

// // Import your API functions
// import {
//   getGroupsById,
//   assignPermissionsToGroup,
//   getPermissions,
// } from "@/lib/api";

// type Permission = {
//   id: number;
//   name: string;
//   codename: string;
//   content_type_app: string;
//   content_type_model: string;
//   content_type_name: string; // ✅ use this
// };

// type GroupedPermissions = {
//   [key: string]: Permission[];
// };

// export default function AssignPermissionsPage() {
//   const router = useRouter();
//   const params = useParams();
//   const roleId = params?.id;

//   const [roleName, setRoleName] = useState<string>("");

//   const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
//   const [groupedPermissions, setGroupedPermissions] =
//     useState<GroupedPermissions>({});
//   const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(
//     new Set()
//   );
//   const [currentPermissions, setCurrentPermissions] = useState<Set<number>>(
//     new Set()
//   );

//   // Filters
//   const [searchTerm, setSearchTerm] = useState("");
//   const [contentTypeFilter, setContentTypeFilter] =
//     useState("All Content Types");

//   // Pagination
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   // 🔹 Expand/collapse state
//   const [openGroup, setOpenGroup] = useState<string | null>(null);

//   const toggleGroupOpen = (groupName: string) => {
//     setOpenGroup(openGroup === groupName ? null : groupName);
//   };

//   // 🔹 Fetch role details + permissions
//   useEffect(() => {
//     if (!roleId) return;

//     const fetchData = async () => {
//       try {
//         setLoading(true);

//         // Role details
//         const roleResponse = await getGroupsById(Number(roleId));
//         setRoleName(roleResponse.name);

//         const currentPerms = new Set<number>(
//           roleResponse.permissions?.map((p: any) => Number(p.id)) || []
//         );
//         setCurrentPermissions(currentPerms);
//         setSelectedPermissions(new Set<number>(currentPerms));

//         // Permissions for page 1
//         await fetchPage(1);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [roleId]);

//   // 🔹 Fetch permissions with pagination
//   const fetchPage = async (pageNum: number) => {
//     try {
//       setLoading(true);
//       const resp = await getPermissions(pageNum);

//       const permissions: Permission[] = resp.results ?? [];
//       const count: number = resp.count;

//       setAllPermissions(permissions);
//       setPage(pageNum);
//       setTotalPages(Math.ceil(count / 10)); // assume 10 per page

//       // ✅ Group by content_type_name
//       const grouped = permissions.reduce(
//         (acc: GroupedPermissions, permission: Permission) => {
//           const key = permission.content_type_name || "other";
//           if (!acc[key]) acc[key] = [];
//           acc[key].push(permission);
//           return acc;
//         },
//         {}
//       );
//       setGroupedPermissions(grouped);
//     } catch (err) {
//       console.error("Error fetching permissions:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🔹 Filtered permissions
//   const filteredGroupedPermissions = useMemo(() => {
//     let filtered = { ...groupedPermissions };

//     if (contentTypeFilter !== "All Content Types") {
//       filtered = { [contentTypeFilter]: filtered[contentTypeFilter] || [] };
//     }

//     if (searchTerm.trim()) {
//       const searchLower = searchTerm.toLowerCase();
//       const newFiltered: GroupedPermissions = {};

//       Object.entries(filtered).forEach(([key, permissions]) => {
//         const matching = permissions.filter(
//           (p) =>
//             p.name.toLowerCase().includes(searchLower) ||
//             p.codename.toLowerCase().includes(searchLower)
//         );
//         if (matching.length > 0) newFiltered[key] = matching;
//       });

//       filtered = newFiltered;
//     }

//     return filtered;
//   }, [groupedPermissions, contentTypeFilter, searchTerm]);

//   const totalPermissions = allPermissions.length;
//   const selectedCount = selectedPermissions.size;
//   const displayedPermissions = Object.values(filteredGroupedPermissions).flat();
//   const displayedCount = displayedPermissions.length;

//   const contentTypes = [
//     "All Content Types",
//     ...Object.keys(groupedPermissions),
//   ];

//   // 🔹 Select handlers
//   const togglePermission = (permissionId: number) => {
//     const newSelected = new Set(selectedPermissions);
//     if (newSelected.has(permissionId)) newSelected.delete(permissionId);
//     else newSelected.add(permissionId);
//     setSelectedPermissions(newSelected);
//   };

//   const toggleGroup = (groupPermissions: Permission[]) => {
//     const groupIds = groupPermissions.map((p) => p.id);
//     const allSelected = groupIds.every((id) => selectedPermissions.has(id));
//     const newSelected = new Set(selectedPermissions);

//     if (allSelected) groupIds.forEach((id) => newSelected.delete(id));
//     else groupIds.forEach((id) => newSelected.add(id));

//     setSelectedPermissions(newSelected);
//   };

//   // 🔹 Toggle all (current page only)
//   const toggleAll = () => {
//     const allIds = displayedPermissions.map((p) => p.id);
//     const allSelected = allIds.every((id) => selectedPermissions.has(id));
//     const newSelected = new Set(selectedPermissions);

//     if (allSelected) {
//       allIds.forEach((id) => newSelected.delete(id));
//     } else {
//       allIds.forEach((id) => newSelected.add(id));
//     }

//     setSelectedPermissions(newSelected);
//   };

//   const handleSave = async () => {
//     if (!roleId) return;
//     try {
//       setSaving(true);
//       const permissionsArray = Array.from(selectedPermissions);
//       await assignPermissionsToGroup(Number(roleId), permissionsArray);
//       router.back();
//     } catch (error) {
//       console.error("Error saving permissions:", error);
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="text-sm text-gray-500">Loading permissions...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto space-y-6">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <button
//             onClick={() => router.back()}
//             className="flex items-center text-gray-600 hover:text-gray-800 text-sm"
//           >
//             <ArrowLeft className="h-4 w-4 mr-1" />
//             Back to Role Details
//           </button>
//         </div>

//         {/* Title */}
//         <div className="flex items-center justify-between">
//           <h1 className="text-2xl font-bold">
//             Assign Permissions:{" "}
//             <span className="text-blue-600">{roleName}</span>
//           </h1>
//           <div className="flex gap-3">
//             <Button variant="outline" onClick={() => router.back()}>
//               <X className="h-4 w-4 mr-1" /> Cancel
//             </Button>
//             <Button
//               onClick={handleSave}
//               disabled={saving}
//               className="bg-blue-600 hover:bg-blue-700"
//             >
//               {saving ? (
//                 <>
//                   <RefreshCcw className="h-4 w-4 animate-spin mr-2" />
//                   Saving...
//                 </>
//               ) : (
//                 "Save Changes"
//               )}
//             </Button>
//           </div>
//         </div>

//         {/* Filters */}
//         <Card>
//           <CardContent className="p-4 flex gap-4 items-center">
//             <Input
//               placeholder="Search by name or code"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="flex-1"
//             />
//             <Select
//               value={contentTypeFilter}
//               onValueChange={setContentTypeFilter}
//             >
//               <SelectTrigger className="w-60">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 {contentTypes.map((type) => (
//                   <SelectItem key={type} value={type}>
//                     {type}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <span className="text-sm text-gray-500">
//               Showing {displayedCount} of {totalPermissions}
//             </span>
//           </CardContent>
//         </Card>

//         {/* Permissions */}
//         <Card>
//           <CardContent className="p-6">
//             <div className="flex justify-between mb-4 items-center">
//               <h2 className="font-semibold">Permissions</h2>
//               <div className="flex items-center gap-2">
//                 <Checkbox
//                   checked={displayedPermissions.every((p) =>
//                     selectedPermissions.has(p.id)
//                   )}
//                   onCheckedChange={toggleAll}
//                 />
//                 <span className="text-sm">Select All</span>
//                 <Badge variant="secondary">{selectedCount} selected</Badge>
//               </div>
//             </div>

//             {Object.entries(filteredGroupedPermissions).map(
//               ([groupName, permissions]) => (
//                 <div key={groupName} className="mb-6">
//                   <div className="flex items-center gap-2 bg-gray-100 p-2 rounded">
//                     <Checkbox
//                       checked={permissions.every((p) =>
//                         selectedPermissions.has(p.id)
//                       )}
//                       onCheckedChange={() => toggleGroup(permissions)}
//                     />
//                     <span
//                       className="font-medium cursor-pointer flex-1"
//                       onClick={() => toggleGroupOpen(groupName)}
//                     >
//                       {groupName}
//                     </span>
//                     <Badge>{permissions.length}</Badge>
//                   </div>

//                   {/* ✅ Only show if expanded */}
//                   {openGroup === groupName && (
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pl-6">
//                       {permissions.map((p) => (
//                         <div
//                           key={p.id}
//                           onClick={() => togglePermission(p.id)}
//                           className={`p-3 rounded border cursor-pointer ${
//                             selectedPermissions.has(p.id)
//                               ? "bg-blue-50 border-blue-300"
//                               : "bg-white border-gray-200"
//                           }`}
//                         >
//                           <div className="text-sm font-medium text-blue-600">
//                             {p.name}
//                           </div>
//                           <div className="text-xs text-gray-500">
//                             {p.codename}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               )
//             )}

//             {/* Pagination */}
//             <div className="flex justify-between items-center mt-6">
//               <span className="text-sm text-gray-600">
//                 Page {page} of {totalPages}
//               </span>
//               <div className="flex gap-2">
//                 {/* Previous */}
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   disabled={page === 1}
//                   onClick={() => fetchPage(page - 1)}
//                 >
//                   Previous
//                 </Button>

//                 {/* Page Numbers */}
//                 {Array.from({ length: totalPages }, (_, i) => i + 1)
//                   .filter((p) => {
//                     // Always show first 2, last 1, and pages near current
//                     return (
//                       p === 1 ||
//                       p === 2 ||
//                       p === totalPages ||
//                       (p >= page - 1 && p <= page + 1)
//                     );
//                   })
//                   .map((p, i, arr) => {
//                     const prev = arr[i - 1];
//                     return (
//                       <React.Fragment key={p}>
//                         {/* Insert ellipsis if gap */}
//                         {prev && p - prev > 1 && (
//                           <span className="px-2 text-gray-500">…</span>
//                         )}
//                         <Button
//                           variant={p === page ? "default" : "outline"}
//                           size="sm"
//                           onClick={() => fetchPage(p)}
//                         >
//                           {p}
//                         </Button>
//                       </React.Fragment>
//                     );
//                   })}

//                 {/* Next */}
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   disabled={page === totalPages}
//                   onClick={() => fetchPage(page + 1)}
//                 >
//                   Next
//                 </Button>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  X,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

// ✅ Updated API
import { getGroupsById, assignPermissionsToGroup } from "@/lib/api";
import api from "@/lib/api"; // make sure axios instance is here

// 🔹 Fetch permissions with filters
export const getPermissions = async (
  page: number = 1,
  app_label?: string,
  model?: string
) => {
  let url = `/api/users/permissions/?page=${page}`;
  if (app_label) url += `&app_label=${app_label}`;
  if (model) url += `&model=${model}`;
  const res = await api.get(url);
  return res.data;
};

type Permission = {
  id: number;
  name: string;
  codename: string;
  content_type_app: string;
  content_type_model: string;
  content_type_name: string;
};

type GroupedPermissions = {
  [key: string]: Permission[];
};

export default function AssignPermissionsPage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params?.id;

  const [roleName, setRoleName] = useState<string>("");

  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [groupedPermissions, setGroupedPermissions] =
    useState<GroupedPermissions>({});
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(
    new Set()
  );
  const [currentPermissions, setCurrentPermissions] = useState<Set<number>>(
    new Set()
  );

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [appFilter, setAppFilter] = useState<string>("All Apps");
  const [modelFilter, setModelFilter] = useState<string>("All Models");

  // Dropdown data
  const [availableApps, setAvailableApps] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Expand/collapse
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const toggleGroupOpen = (groupName: string) => {
    setOpenGroup(openGroup === groupName ? null : groupName);
  };

  // 🔹 Fetch role + permissions
  useEffect(() => {
    if (!roleId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const roleResponse = await getGroupsById(Number(roleId));
        setRoleName(roleResponse.name);

        const currentPerms = new Set<number>(
          roleResponse.permissions?.map((p: any) => Number(p.id)) || []
        );
        setCurrentPermissions(currentPerms);
        setSelectedPermissions(new Set<number>(currentPerms));

        await fetchPage(1);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [roleId]);

  // 🔹 Fetch permissions with filters + pagination
  const fetchPage = async (pageNum: number) => {
    try {
      setLoading(true);
      const resp = await getPermissions(
        pageNum,
        appFilter !== "All Apps" ? appFilter : undefined,
        modelFilter !== "All Models" ? modelFilter : undefined
      );

      const permissions: Permission[] = resp.results ?? [];
      const count: number = resp.count;

      setAllPermissions(permissions);
      setPage(pageNum);
      setTotalPages(Math.ceil(count / 10));

      // Group
      const grouped = permissions.reduce(
        (acc: GroupedPermissions, permission: Permission) => {
          const key = permission.content_type_name || "other";
          if (!acc[key]) acc[key] = [];
          acc[key].push(permission);
          return acc;
        },
        {}
      );
      setGroupedPermissions(grouped);

      // Populate filter dropdowns
      setAvailableApps([
        ...new Set(permissions.map((p) => p.content_type_app)),
      ]);
      setAvailableModels([
        ...new Set(permissions.map((p) => p.content_type_model)),
      ]);
    } catch (err) {
      console.error("Error fetching permissions:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Refetch when filter changes
  useEffect(() => {
    fetchPage(1);
  }, [appFilter, modelFilter]);

  // 🔹 Filtered permissions
  const filteredGroupedPermissions = useMemo(() => {
    let filtered = { ...groupedPermissions };

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      const newFiltered: GroupedPermissions = {};

      Object.entries(filtered).forEach(([key, permissions]) => {
        const matching = permissions.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.codename.toLowerCase().includes(searchLower)
        );
        if (matching.length > 0) newFiltered[key] = matching;
      });

      filtered = newFiltered;
    }

    return filtered;
  }, [groupedPermissions, searchTerm]);

  const totalPermissions = allPermissions.length;
  const selectedCount = selectedPermissions.size;
  const displayedPermissions = Object.values(filteredGroupedPermissions).flat();
  const displayedCount = displayedPermissions.length;

  // 🔹 Select handlers
  const togglePermission = (permissionId: number) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) newSelected.delete(permissionId);
    else newSelected.add(permissionId);
    setSelectedPermissions(newSelected);
  };

  const toggleGroup = (groupPermissions: Permission[]) => {
    const groupIds = groupPermissions.map((p) => p.id);
    const allSelected = groupIds.every((id) => selectedPermissions.has(id));
    const newSelected = new Set(selectedPermissions);

    if (allSelected) groupIds.forEach((id) => newSelected.delete(id));
    else groupIds.forEach((id) => newSelected.add(id));

    setSelectedPermissions(newSelected);
  };

  const toggleAll = () => {
    const allIds = displayedPermissions.map((p) => p.id);
    const allSelected = allIds.every((id) => selectedPermissions.has(id));
    const newSelected = new Set(selectedPermissions);

    if (allSelected) {
      allIds.forEach((id) => newSelected.delete(id));
    } else {
      allIds.forEach((id) => newSelected.add(id));
    }

    setSelectedPermissions(newSelected);
  };

  const handleSave = async () => {
    if (!roleId) return;
    try {
      setSaving(true);
      const permissionsArray = Array.from(selectedPermissions);
      await assignPermissionsToGroup(Number(roleId), permissionsArray);
      router.back();
    } catch (error) {
      console.error("Error saving permissions:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-sm text-gray-500">Loading permissions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-800 text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Role Details
          </button>
        </div>

        {/* Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            Assign Permissions:{" "}
            <span className="text-blue-600">{roleName}</span>
          </h1>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <>
                  <RefreshCcw className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4 flex gap-4 items-center flex-wrap">
            <Input
              placeholder="Search by name or code"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />

            {/* App Filter */}
            <Select value={appFilter} onValueChange={setAppFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Apps">All Apps</SelectItem>
                {availableApps.map((app) => (
                  <SelectItem key={app} value={app}>
                    {app}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Model Filter */}
            <Select value={modelFilter} onValueChange={setModelFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Models">All Models</SelectItem>
                {availableModels.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-sm text-gray-500">
              Showing {displayedCount} of {totalPermissions}
            </span>
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between mb-4 items-center">
              <h2 className="font-semibold">Permissions</h2>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={displayedPermissions.every((p) =>
                    selectedPermissions.has(p.id)
                  )}
                  onCheckedChange={toggleAll}
                />
                <span className="text-sm">Select All</span>
                <Badge variant="secondary">{selectedCount} selected</Badge>
              </div>
            </div>

            {Object.entries(filteredGroupedPermissions).map(
              ([groupName, permissions]) => (
                <div key={groupName} className="mb-6">
                  <div className="flex items-center gap-2 bg-gray-100 p-2 rounded">
                    <Checkbox
                      checked={permissions.every((p) =>
                        selectedPermissions.has(p.id)
                      )}
                      onCheckedChange={() => toggleGroup(permissions)}
                    />
                    <span
                      className="font-medium cursor-pointer flex-1"
                      onClick={() => toggleGroupOpen(groupName)}
                    >
                      {groupName}
                    </span>
                    <Badge>{permissions.length}</Badge>
                  </div>

                  {openGroup === groupName && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pl-6">
                      {permissions.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => togglePermission(p.id)}
                          className={`p-3 rounded border cursor-pointer ${
                            selectedPermissions.has(p.id)
                              ? "bg-blue-50 border-blue-300"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <div className="text-sm font-medium text-blue-600">
                            {p.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {p.codename}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
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

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    return (
                      p === 1 ||
                      p === 2 ||
                      p === totalPages ||
                      (p >= page - 1 && p <= page + 1)
                    );
                  })
                  .map((p, i, arr) => {
                    const prev = arr[i - 1];
                    return (
                      <React.Fragment key={p}>
                        {prev && p - prev > 1 && (
                          <span className="px-2 text-gray-500">…</span>
                        )}
                        <Button
                          variant={p === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => fetchPage(p)}
                        >
                          {p}
                        </Button>
                      </React.Fragment>
                    );
                  })}

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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

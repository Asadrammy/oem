// // app/obd-telemetry/page.tsx
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { Eye, Search } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Input } from "@/components/ui/input";
// import Link from "next/link";
// import { listOBDTelemetry } from "@/lib/api";
// import { useSearchParams } from "next/navigation";

// type OBDTelemetry = {
//   id: number;
//   trip: number;
//   timestamp: string;
//   latitude: number;
//   longitude: number;
//   speed_kph: number | null;
//   battery_level_percent: number | null;
//   motor_temp_c: number | null;
//   battery_voltage: number | null;
//   odometer_km: number | null;
//   error_codes: string;
//   vehicle_id: number;
// };

// export default function OBDTelemetryPage() {
//   const searchParams = useSearchParams();
//   const vehicleId = searchParams.get("vehicle");
//   console.log("vehicleId", vehicleId);
//   const [items, setItems] = useState<OBDTelemetry[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string>("");

//   // Pagination
//   const [page, setPage] = useState(1);
//   const rowsPerPage = 10;
//   const [totalCount, setTotalCount] = useState(0);

//   // Search
//   const [query, setQuery] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");

//   const filtered = useMemo(() => {
//     if (!searchTerm.trim()) return items;
//     const q = searchTerm.toLowerCase();
//     return items.filter(
//       (t) =>
//         t.error_codes?.toLowerCase().includes(q) ||
//         String(t.vehicle_id).includes(q) ||
//         String(t.trip).includes(q)
//     );
//   }, [items, searchTerm]);

//   // Fetch page
//   const fetchPage = async (pageNum: number) => {
//     setLoading(true);
//     try {
//       const resp = await listOBDTelemetry(
//         pageNum,
//         vehicleId ? Number(vehicleId) : undefined
//       );
//       const rows: OBDTelemetry[] = resp?.results ?? resp ?? [];
//       setItems(rows);
//       setTotalCount(resp.count ?? rows.length);
//       setPage(pageNum);
//     } catch (e: any) {
//       setError(e?.message || "Failed to load OBD telemetry");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPage(1);
//   }, [vehicleId]);

//   const totalPages = Math.ceil(totalCount / rowsPerPage);

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">OBD Telemetry</h1>
//           <p className="text-gray-600">View vehicle telemetry data</p>
//         </div>
//       </div>

//       {/* Filters */}
//       <Card>
//         <CardContent className="p-4 flex flex-wrap items-center gap-4">
//           <div className="relative flex-1 min-w-64">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//             <Input
//               placeholder="Search by Vehicle ID, Trip, or Error Codes..."
//               className="pl-10"
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//             />
//           </div>
//           <Button
//             onClick={() => setSearchTerm(query)}
//             className="bg-gray-700 hover:bg-gray-800"
//           >
//             Search
//           </Button>
//         </CardContent>
//       </Card>

//       {/* Table */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Telemetry Records ({filtered.length})</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Vehicle</TableHead>
//                   <TableHead>Trip</TableHead>
//                   <TableHead>Timestamp</TableHead>
//                   <TableHead>Lat</TableHead>
//                   <TableHead>Lng</TableHead>
//                   <TableHead>Speed (kph)</TableHead>
//                   <TableHead>Battery %</TableHead>
//                   <TableHead>Motor Temp (°C)</TableHead>
//                   <TableHead>Voltage (V)</TableHead>
//                   <TableHead>Error Codes</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {loading && (
//                   <TableRow>
//                     <TableCell colSpan={12}>Loading…</TableCell>
//                   </TableRow>
//                 )}
//                 {!loading && filtered.length === 0 && (
//                   <TableRow>
//                     <TableCell colSpan={12}>No telemetry found</TableCell>
//                   </TableRow>
//                 )}
//                 {filtered.map((t) => (
//                   <TableRow key={t.id}>
//                     <TableCell>{t.vehicle_id}</TableCell>
//                     <TableCell>{t.trip}</TableCell>
//                     <TableCell>
//                       {new Date(t.timestamp).toLocaleString()}
//                     </TableCell>
//                     <TableCell>{t.latitude?.toFixed(5)}</TableCell>
//                     <TableCell>{t.longitude?.toFixed(5)}</TableCell>
//                     <TableCell>{t.speed_kph ?? "—"}</TableCell>
//                     <TableCell>{t.battery_level_percent ?? "—"}</TableCell>
//                     <TableCell>{t.motor_temp_c ?? "—"}</TableCell>
//                     <TableCell>{t.battery_voltage ?? "—"}</TableCell>
//                     <TableCell>{t.error_codes || "—"}</TableCell>
//                     <TableCell className="text-right">
//                       <Link href={`/obd-telemetry/${t.id}`}>
//                         <Button variant="ghost" size="sm">
//                           <Eye className="w-4 h-4" />
//                         </Button>
//                       </Link>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>

//             {/* Pagination */}
//             <div className="flex justify-between items-center mt-4">
//               <span className="text-sm text-gray-600">
//                 Page {page} of {totalPages}
//               </span>
//               <div className="flex gap-2 items-center">
//                 {/* Previous */}
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   disabled={page === 1}
//                   onClick={() => fetchPage(page - 1)}
//                 >
//                   Previous
//                 </Button>

//                 {/* Page numbers (max 5 visible) */}
//                 {(() => {
//                   const windowSize = 4;
//                   const half = Math.floor(windowSize / 2);
//                   let start = Math.max(1, page - half);
//                   let end = Math.min(totalPages, start + windowSize - 1);

//                   // shift window if near the end
//                   if (end - start + 1 < windowSize) {
//                     start = Math.max(1, end - windowSize + 1);
//                   }

//                   const pages = [];
//                   if (start > 1) {
//                     pages.push(
//                       <Button
//                         key={1}
//                         variant={page === 1 ? "default" : "outline"}
//                         size="sm"
//                         onClick={() => fetchPage(1)}
//                       >
//                         1
//                       </Button>
//                     );
//                     if (start > 2) {
//                       pages.push(<span key="start-ellipsis">…</span>);
//                     }
//                   }

//                   for (let p = start; p <= end; p++) {
//                     pages.push(
//                       <Button
//                         key={p}
//                         variant={p === page ? "default" : "outline"}
//                         size="sm"
//                         onClick={() => fetchPage(p)}
//                       >
//                         {p}
//                       </Button>
//                     );
//                   }

//                   if (end < totalPages) {
//                     if (end < totalPages - 1) {
//                       pages.push(<span key="end-ellipsis">…</span>);
//                     }
//                     pages.push(
//                       <Button
//                         key={totalPages}
//                         variant={page === totalPages ? "default" : "outline"}
//                         size="sm"
//                         onClick={() => fetchPage(totalPages)}
//                       >
//                         {totalPages}
//                       </Button>
//                     );
//                   }

//                   return pages;
//                 })()}

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
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Search, Download, Filter, RotateCcw } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { listOBDTelemetry } from "@/lib/api";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type OBDTelemetry = {
  id: number;
  trip: number | null;
  trip_id?: number | null;
  timestamp: string;
  latitude: number | null;
  longitude: number | null;
  speed_kph: number | null;
  battery_level_percent: number | null;
  motor_temp_c: number | null;
  battery_voltage: number | null;
  odometer_km: number | null;
  error_codes: string;
  vehicle_id: number | null;
  vehicle_vin?: string | null;
};

type ListResp =
  | {
      count?: number;
      results?: OBDTelemetry[];
    }
  | OBDTelemetry[];

const rowsPerPage = 10;

export default function OBDTelemetryPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Table state
  const [items, setItems] = useState<OBDTelemetry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Pagination (derived from URL; local is just for display)
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / rowsPerPage) || 1;

  // Quick search (client-side within current page)
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Filters (UI controls only; URL is the source of truth for fetch)
  const [timestampAfter, setTimestampAfter] = useState<string>("");
  const [timestampBefore, setTimestampBefore] = useState<string>("");
  const [trip, setTrip] = useState<string>("");
  const [tripId, setTripId] = useState<string>("");
  const [vehicle, setVehicle] = useState<string>(searchParams.get("vehicle") ?? "");
  const [vehicleVin, setVehicleVin] = useState<string>("");
  const [minSpeed, setMinSpeed] = useState<string>("");
  const [maxSpeed, setMaxSpeed] = useState<string>("");
  const [minBattery, setMinBattery] = useState<string>("");
  const [maxBattery, setMaxBattery] = useState<string>("");
  const [minMotorTemp, setMinMotorTemp] = useState<string>("");
  const [maxMotorTemp, setMaxMotorTemp] = useState<string>("");
  const [minRange, setMinRange] = useState<string>("");
  const [maxRange, setMaxRange] = useState<string>("");
  const [hasErrorCodes, setHasErrorCodes] = useState<"" | "true" | "false">("");
  const [aggregated, setAggregated] = useState<boolean>(false);
  const [topErrors, setTopErrors] = useState<boolean>(false);

  // Sorting (UI controls only; URL is the source of truth for fetch)
  const SORT_FIELDS = [
    { value: "timestamp", label: "Timestamp" },
    { value: "id", label: "ID" },
    { value: "speed_kph", label: "Speed (kph)" },
    { value: "battery_level_percent", label: "Battery (%)" },
  ];
  const [sortField, setSortField] = useState<string>("timestamp");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Build URLSearchParams from current UI state
  const buildParams = useCallback(
    (overrides?: Record<string, string | number | boolean | null | undefined>) => {
      const p = new URLSearchParams();

      // page
      p.set("page", "1");

      // filters
      const assign = (k: string, v?: string | number | boolean | null) => {
        if (v === undefined || v === null || v === "") return;
        p.set(k, String(v));
      };

      assign("timestamp_after", timestampAfter);
      assign("timestamp_before", timestampBefore);
      assign("trip", trip);
      assign("trip_id", tripId);
      assign("vehicle", vehicle);
      assign("vehicle_vin", vehicleVin);
      assign("min_speed", minSpeed);
      assign("max_speed", maxSpeed);
      assign("min_battery", minBattery);
      assign("max_battery", maxBattery);
      assign("min_motor_temp", minMotorTemp);
      assign("max_motor_temp", maxMotorTemp);
      assign("min_range", minRange);
      assign("max_range", maxRange);
      if (hasErrorCodes) assign("has_error_codes", hasErrorCodes);
      if (aggregated) assign("aggregated", true);
      if (topErrors) assign("top_errors", true);

      // sorting
      const ordering = sortDir === "desc" ? `-${sortField}` : sortField;
      assign("ordering", ordering);

      // overrides
      if (overrides) {
        Object.entries(overrides).forEach(([k, v]) => {
          if (v === undefined || v === null || v === "") {
            p.delete(k);
          } else {
            p.set(k, String(v));
          }
        });
      }

      return p;
    },
    [
      timestampAfter,
      timestampBefore,
      trip,
      tripId,
      vehicle,
      vehicleVin,
      minSpeed,
      maxSpeed,
      minBattery,
      maxBattery,
      minMotorTemp,
      maxMotorTemp,
      minRange,
      maxRange,
      hasErrorCodes,
      aggregated,
      topErrors,
      sortField,
      sortDir,
    ]
  );

  // Helper: extract fetch params directly from URL snapshot (single source of truth)
  const getFetchParamsFromUrl = useCallback(() => {
    const get = (k: string) => searchParams.get(k) ?? undefined;

    // Default ordering if absent
    const ord = get("ordering") ?? "-timestamp";

    // Coerce true/false flags
    const asBool = (v?: string) => (v === "true" ? true : v === "false" ? false : undefined);

    // Page
    const pageFromUrl = Number(searchParams.get("page") || "1");
    const pageNum = Number.isFinite(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1;

    const paramsObj: Record<string, any> = {
      page: pageNum,
      page_size: rowsPerPage,
      timestamp_after: get("timestamp_after"),
      timestamp_before: get("timestamp_before"),
      trip: get("trip"),
      trip_id: get("trip_id"),
      vehicle: get("vehicle"),
      vehicle_vin: get("vehicle_vin"),
      min_speed: get("min_speed"),
      max_speed: get("max_speed"),
      min_battery: get("min_battery"),
      max_battery: get("max_battery"),
      min_motor_temp: get("min_motor_temp"),
      max_motor_temp: get("max_motor_temp"),
      min_range: get("min_range"),
      max_range: get("max_range"),
      has_error_codes: get("has_error_codes"),
      aggregated: asBool(get("aggregated")),
      top_errors: asBool(get("top_errors")),
      ordering: ord,
    };

    return { paramsObj, pageNum, ord };
  }, [searchParams]);

  // Fetch when URL (searchParams) changes; also hydrate UI controls from URL
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError("");

      // 1) Hydrate UI controls from current URL
      const get = (k: string) => searchParams.get(k) ?? "";
      setTimestampAfter(get("timestamp_after"));
      setTimestampBefore(get("timestamp_before"));
      setTrip(get("trip"));
      setTripId(get("trip_id"));
      setVehicle(get("vehicle"));
      setVehicleVin(get("vehicle_vin"));
      setMinSpeed(get("min_speed"));
      setMaxSpeed(get("max_speed"));
      setMinBattery(get("min_battery"));
      setMaxBattery(get("max_battery"));
      setMinMotorTemp(get("min_motor_temp"));
      setMaxMotorTemp(get("max_motor_temp"));
      setMinRange(get("min_range"));
      setMaxRange(get("max_range"));
      const hec = get("has_error_codes");
      setHasErrorCodes(hec === "true" ? "true" : hec === "false" ? "false" : "");
      setAggregated(get("aggregated") === "true");
      setTopErrors(get("top_errors") === "true");

      const ord = get("ordering");
      if (ord) {
        setSortDir(ord.startsWith("-") ? "desc" : "asc");
        setSortField(ord.replace(/^-/, "") || "timestamp");
      } else {
        // ensure UI shows default when URL has no ordering
        setSortDir("desc");
        setSortField("timestamp");
      }

      // 2) Fetch using ONLY URL params to avoid stale closures
      const { paramsObj, pageNum } = getFetchParamsFromUrl();
      try {
        const resp: ListResp = await listOBDTelemetry(paramsObj);
        if (cancelled) return;

        const rows: OBDTelemetry[] = Array.isArray(resp) ? resp : resp?.results ?? [];
        const count: number = Array.isArray(resp) ? rows.length : resp?.count ?? rows.length;

        setItems(rows);
        setTotalCount(count);
        setPage(pageNum);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || "Failed to load OBD telemetry");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [searchParams, getFetchParamsFromUrl]);

  // Apply filters -> push URL params; fetch will run from the effect above
  const applyFilters = useCallback(() => {
    const params = buildParams({ page: 1 });
    router.push(`${pathname}?${params.toString()}`);
  }, [buildParams, router, pathname]);

  // Reset filters -> clear UI + URL; fetch will run from the effect above
  const resetFilters = useCallback(() => {
    setTimestampAfter("");
    setTimestampBefore("");
    setTrip("");
    setTripId("");
    setVehicle("");
    setVehicleVin("");
    setMinSpeed("");
    setMaxSpeed("");
    setMinBattery("");
    setMaxBattery("");
    setMinMotorTemp("");
    setMaxMotorTemp("");
    setMinRange("");
    setMaxRange("");
    setHasErrorCodes("");
    setAggregated(false);
    setTopErrors(false);
    setSortField("timestamp");
    setSortDir("desc");

    const p = new URLSearchParams();
    p.set("page", "1");
    p.set("ordering", "-timestamp");
    router.push(`${pathname}?${p.toString()}`);
  }, [router, pathname]);

  // Quick client-side filter for current page rows
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const q = searchTerm.toLowerCase();
    return items.filter(
      (t) =>
        (t.error_codes || "").toLowerCase().includes(q) ||
        String(t.vehicle_id ?? "").includes(q) ||
        String(t.trip ?? "").includes(q)
    );
  }, [items, searchTerm]);

  // Pagination controls -> push URL; fetch runs from effect
  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  };

  // CSV export (downloads all pages under current filters)
  const exportCSV = async () => {
    setLoading(true);
    setError("");
    try {
      // Extract current filters directly from URL
      const { paramsObj } = getFetchParamsFromUrl();
      const baseParams: any = {
        ...paramsObj,
        page: 1,
        page_size: 200, // larger page size for faster export
      };

      const firstResp: any = await listOBDTelemetry(baseParams);
      const firstRows: OBDTelemetry[] = Array.isArray(firstResp)
        ? firstResp
        : firstResp?.results ?? [];
      const count: number = Array.isArray(firstResp)
        ? firstRows.length
        : firstResp?.count ?? firstRows.length;

      const all: OBDTelemetry[] = [...firstRows];

      const pageSize = baseParams.page_size;
      const pages = Math.ceil(count / pageSize);

      for (let p = 2; p <= pages; p++) {
        const r: any = await listOBDTelemetry({ ...baseParams, page: p });
        const rows: OBDTelemetry[] = Array.isArray(r) ? r : r?.results ?? [];
        all.push(...rows);
      }

      // Build CSV
      const headers = [
        "id",
        "trip",
        "timestamp",
        "latitude",
        "longitude",
        "speed_kph",
        "battery_level_percent",
        "motor_temp_c",
        "battery_voltage",
        "odometer_km",
        "error_codes",
        "vehicle_id",
        "vehicle_vin",
      ];

      const escapeCSV = (val: any) => {
        if (val === null || val === undefined) return "";
        const s = String(val);
        if (/[\",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
        return s;
      };

      const lines = [
        headers.join(","),
        ...all.map((t) =>
          [
            t.id,
            t.trip ?? "",
            t.timestamp,
            t.latitude ?? "",
            t.longitude ?? "",
            t.speed_kph ?? "",
            t.battery_level_percent ?? "",
            t.motor_temp_c ?? "",
            t.battery_voltage ?? "",
            t.odometer_km ?? "",
            t.error_codes ?? "",
            t.vehicle_id ?? "",
            t.vehicle_vin ?? "",
          ]
            .map(escapeCSV)
            .join(",")
        ),
      ];

      // Create blob and trigger download
      const csv = lines.join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `obd_telemetry_export_${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e?.message || "Failed to export CSV");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">OBD Telemetry</h1>
          <p className="text-gray-600">View vehicle telemetry data</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetFilters} title="Reset filters">
            <RotateCcw className="w-4 h-4 mr-2" /> Reset
          </Button>
          <Button onClick={exportCSV} disabled={loading} title="Export filtered data">
            <Download className="w-4 h-4 mr-2" /> Export to CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Row 1: time + trip + vehicle */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <Input
              type="datetime-local"
              placeholder="timestamp_after"
              value={timestampAfter}
              onChange={(e) => setTimestampAfter(e.target.value)}
            />
            <Input
              type="datetime-local"
              placeholder="timestamp_before"
              value={timestampBefore}
              onChange={(e) => setTimestampBefore(e.target.value)}
            />
            <Input placeholder="trip" value={trip} onChange={(e) => setTrip(e.target.value)} />
            <Input placeholder="trip_id" value={tripId} onChange={(e) => setTripId(e.target.value)} />
            <Input
              placeholder="vehicle (id)"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
            />
          </div>

          {/* Row 2: vin + numeric ranges */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <Input
              placeholder="vehicle_vin"
              value={vehicleVin}
              onChange={(e) => setVehicleVin(e.target.value)}
            />
            <Input
              type="number"
              placeholder="min_speed"
              value={minSpeed}
              onChange={(e) => setMinSpeed(e.target.value)}
            />
            <Input
              type="number"
              placeholder="max_speed"
              value={maxSpeed}
              onChange={(e) => setMaxSpeed(e.target.value)}
            />
            <Input
              type="number"
              placeholder="min_battery"
              value={minBattery}
              onChange={(e) => setMinBattery(e.target.value)}
            />
            <Input
              type="number"
              placeholder="max_battery"
              value={maxBattery}
              onChange={(e) => setMaxBattery(e.target.value)}
            />
            <Input
              type="number"
              placeholder="min_range"
              value={minRange}
              onChange={(e) => setMinRange(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <Input
              type="number"
              placeholder="max_range"
              value={maxRange}
              onChange={(e) => setMaxRange(e.target.value)}
            />
            <Input
              type="number"
              placeholder="min_motor_temp"
              value={minMotorTemp}
              onChange={(e) => setMinMotorTemp(e.target.value)}
            />
            <Input
              type="number"
              placeholder="max_motor_temp"
              value={maxMotorTemp}
              onChange={(e) => setMaxMotorTemp(e.target.value)}
            />
            <select
              className="border rounded px-3 py-2 text-sm"
              value={hasErrorCodes}
              onChange={(e) => setHasErrorCodes(e.target.value as "" | "true" | "false")}
            >
              <option value="">has_error_codes (any)</option>
              <option value="true">has_error_codes=true</option>
              <option value="false">has_error_codes=false</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={aggregated}
                onChange={(e) => setAggregated(e.target.checked)}
              />
              aggregated=true
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={topErrors}
                onChange={(e) => setTopErrors(e.target.checked)}
              />
              top_errors=true
            </label>
          </div>

          {/* Sorting and actions */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="border rounded px-3 py-2 text-sm"
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
            >
              {SORT_FIELDS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <select
              className="border rounded px-3 py-2 text-sm"
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as "asc" | "desc")}
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>

            <div className="ml-auto flex gap-2">
              <Button variant="outline" onClick={resetFilters}>
                <RotateCcw className="w-4 h-4 mr-2" /> Reset
              </Button>
              <Button onClick={applyFilters}>Apply Filters</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick search row */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by Vehicle ID, Trip, or Error Codes (current page)..."
              className="pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setSearchTerm(query)} className="bg-gray-700 hover:bg-gray-800">
            Search
          </Button>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Telemetry Records ({filtered.length}
            {totalCount ? ` of ${totalCount}` : ""})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Trip</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Lat</TableHead>
                  <TableHead>Lng</TableHead>
                  <TableHead>Speed (kph)</TableHead>
                  <TableHead>Battery %</TableHead>
                  <TableHead>Motor Temp (°C)</TableHead>
                  <TableHead>Voltage (V)</TableHead>
                  <TableHead>Error Codes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={12}>Loading…</TableCell>
                  </TableRow>
                )}
                {!loading && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={12}>No telemetry found</TableCell>
                  </TableRow>
                )}
                {filtered.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.vehicle_id ?? "—"}</TableCell>
                    <TableCell>{t.trip ?? "—"}</TableCell>
                    <TableCell>{new Date(t.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{t.latitude != null ? t.latitude.toFixed(5) : "—"}</TableCell>
                    <TableCell>{t.longitude != null ? t.longitude.toFixed(5) : "—"}</TableCell>
                    <TableCell>{t.speed_kph ?? "—"}</TableCell>
                    <TableCell>{t.battery_level_percent ?? "—"}</TableCell>
                    <TableCell>{t.motor_temp_c ?? "—"}</TableCell>
                    <TableCell>{t.battery_voltage ?? "—"}</TableCell>
                    <TableCell className="max-w-[240px] truncate">{t.error_codes || "—"}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/obd-telemetry/${t.id}`}>
                        <Button variant="ghost" size="sm" title="View detail">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
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
              <div className="flex gap-2 items-center">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => goToPage(page - 1)}>
                  Previous
                </Button>

                {(() => {
                  const windowSize = 4;
                  const half = Math.floor(windowSize / 2);
                  let start = Math.max(1, page - half);
                  let end = Math.min(totalPages, start + windowSize - 1);
                  if (end - start + 1 < windowSize) start = Math.max(1, end - windowSize + 1);

                  const pages = [];
                  if (start > 1) {
                    pages.push(
                      <Button key={1} variant={page === 1 ? "default" : "outline"} size="sm" onClick={() => goToPage(1)}>
                        1
                      </Button>
                    );
                    if (start > 2) pages.push(<span key="start-ellipsis">…</span>);
                  }
                  for (let p = start; p <= end; p++) {
                    pages.push(
                      <Button key={p} variant={p === page ? "default" : "outline"} size="sm" onClick={() => goToPage(p)}>
                        {p}
                      </Button>
                    );
                  }
                  if (end < totalPages) {
                    if (end < totalPages - 1) pages.push(<span key="end-ellipsis">…</span>);
                    pages.push(
                      <Button
                        key={totalPages}
                        variant={page === totalPages ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(totalPages)}
                      >
                        {totalPages}
                      </Button>
                    );
                  }
                  return pages;
                })()}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => goToPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>

            {error && <p className="text-red-600 mt-3 text-sm">{error}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Battery, Thermometer, MapPin } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export type OBDDevice = {
  id: number;
  device_id: string;
  vehicle: number | null;
  firmware_version?: string | null;
  can_baud_rate?: number | null;
  report_interval_sec?: number | null;
  last_communication_at?: string | null;
  sim_card?: {
    sim_id: string;
    status?: string | null;
    signal_strength?: string | null;
  } | null;
};

function fmtAgo(iso?: string | null): string {
  if (!iso) return "—";
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return "—";
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function TelemetryWidget({
  selectedDeviceId,
  devices,
  loading,
  error,
  socByDeviceId,
  locationByDeviceId,
}: {
  selectedDeviceId?: string | null;
  devices?: OBDDevice[];
  loading?: boolean;
  error?: string;
  // new optional maps (device.id -> value)
  socByDeviceId?: Record<number, number | null>;
  locationByDeviceId?: Record<
    number,
    { latitude?: number; longitude?: number; address?: string } | null
  >;
}) {
  const list: OBDDevice[] = Array.isArray(devices) ? devices : [];

  if (loading) return <div className="text-sm text-gray-500 animate-pulse">Loading telemetry…</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!list.length) return <div className="text-sm text-gray-500">No devices.</div>;

  const dev = list.find((d) => d.device_id === selectedDeviceId) || list[0];

  const soc =
    typeof socByDeviceId?.[dev.id] === "number" ? socByDeviceId?.[dev.id] ?? undefined : undefined;

  const loc = locationByDeviceId?.[dev.id] || null;
  const locLine =
    loc?.address ??
    (typeof loc?.latitude === "number" && typeof loc?.longitude === "number"
      ? `${loc.latitude.toFixed(5)}, ${loc.longitude.toFixed(5)}`
      : "—");

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-base">Telemetry</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Top badges */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{dev?.device_id ?? "—"}</Badge>
          {dev?.sim_card?.sim_id && <Badge variant="outline">SIM {dev.sim_card.sim_id}</Badge>}
          {dev?.sim_card?.status && <Badge variant="outline">{dev.sim_card.status}</Badge>}
        </div>

        {/* SOC + Temps blocks */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Battery className="w-4 h-4" /> State of Charge
            </div>
            <div className="mt-2 flex items-end gap-2">
              <div className="text-2xl font-semibold">
                {typeof soc === "number" ? `${soc}%` : "—"}
              </div>
            </div>
            <div className="mt-2">
              <Progress value={typeof soc === "number" ? soc : 0} />
            </div>
          </div>

          <div className="rounded-xl border p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Thermometer className="w-4 h-4" /> Temperatures
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div>Battery: —°C</div>
              <div>Inverter: —°C</div>
              <div>Cabin: —°C</div>
              <div>Ambient: —°C</div>
            </div>
          </div>
        </div>

        {/* Device info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <Info label="Vehicle" value={dev?.vehicle ?? "—"} />
          <Info label="Firmware" value={dev?.firmware_version ?? "—"} />
          <Info label="Baud Rate" value={dev?.can_baud_rate ?? "—"} />
          <Info
            label="Report Interval"
            value={dev?.report_interval_sec ? `${dev.report_interval_sec}s` : "—"}
          />
          <Info label="Last Contact" value={fmtAgo(dev?.last_communication_at)} />
          <Info label="Signal" value={dev?.sim_card?.signal_strength ?? "—"} />
          <Info label="Speed" value="—" />
          <Info label="Power" value="—" />
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>Location: {locLine}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border px-3 py-2">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

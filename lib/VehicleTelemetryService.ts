// lib/VehicleTelemetryService.ts
type TelemetryData = {
  speed_kph: number;
  battery_level_percent: number;
  motor_temp_c: number;
  range_km: number;
  latitude?: number;
  longitude?: number;
};

type Callbacks = {
  onTelemetryUpdate: (data: TelemetryData) => void;
  onStatusChange: (status: string) => void;
  onConnect: (vin: string) => void;
  onDisconnect: () => void;
  onError: (err: Event | string) => void;
};

export class VehicleTelemetryService {
  private socket: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private callbacks: Callbacks;

  private readonly baseUrl: string =
    process.env.NEXT_PUBLIC_WS_BASE_URL ||
    "wss://oem.platform-api-test.joulepoint.com";

  constructor(callbacks?: Partial<Callbacks>) {
    this.callbacks = {
      onTelemetryUpdate: () => {},
      onStatusChange: () => {},
      onConnect: () => {},
      onDisconnect: () => {},
      onError: () => {},
      ...callbacks,
    };
  }

  connectToVehicle(vin: string) {
    this.disconnect();

    const url = `${this.baseUrl}/ws/vehicle/${vin}/`;
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log(`✅ WebSocket connected: ${vin}`);
      this.callbacks.onConnect(vin);
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "update_telemetry") {
          this.callbacks.onTelemetryUpdate(data.payload);
        } else if (data.type === "vehicle.status") {
          this.callbacks.onStatusChange(data.status);
        } else {
          console.log("WebSocket message:", data);
        }
      } catch (err) {
        console.error("❌ Error parsing WebSocket message:", err);
      }
    };

    this.socket.onerror = (err) => {
      console.error("❌ WebSocket error:", err);
      this.callbacks.onError(err);
    };

    this.socket.onclose = () => {
      console.log("🔌 WebSocket disconnected");
      this.callbacks.onDisconnect();

      if (!this.reconnectTimeout) {
        this.reconnectTimeout = setTimeout(() => {
          this.connectToVehicle(vin);
        }, 3000);
      }
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  on<K extends keyof Callbacks>(event: K, callback: Callbacks[K]) {
    this.callbacks[event] = callback;
  }
}

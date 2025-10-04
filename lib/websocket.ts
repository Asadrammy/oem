let socket: WebSocket | null = null;

export const connectVehicleWS = (
  vin: string = "UAUZZZ8V5LA901234",
  onMessage: (data: any) => void
) => {
  const WS_BASE =
    process.env.NEXT_PUBLIC_WS_BASE_URL ||
    "wss://oem.platform-api-test.joulepoint.com";

  socket = new WebSocket(`${WS_BASE}/ws/vehicle/${vin}/`);

  socket.onopen = () => {
  console.log(`✅ WebSocket connected1: ${vin}`);
  // socket?.send(JSON.stringify({ action: "subscribe_telemetry", vin }));
};


  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (err) {
      console.error("❌ Error parsing WebSocket message:", err);
    }
  };

  socket.onerror = (err) => {
    console.error("❌ WebSocket error:", err);
  };

  socket.onclose = () => {
    console.log("🔌 WebSocket disconnected");
  };

  return socket;
};

export const disconnectVehicleWS = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};

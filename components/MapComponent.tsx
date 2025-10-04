// MapComponent.tsx
"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Status-based icons function
const getStatusIcon = (status: string, healthStatus: string) => {
  let color = "#3B82F6"; // default blue
  
  if (status === "offline" || healthStatus === "Critical") {
    color = "#EF4444"; // red
  } else if (healthStatus === "Warning") {
    color = "#F59E0B"; // yellow
  } else if (status === "available") {
    color = "#10B981"; // green
  }
  
  return new L.Icon({
    iconUrl: "data:image/svg+xml;base64," + btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 0C5.59644 0 0 5.59644 0 12.5C0 19.4036 12.5 41 12.5 41C12.5 41 25 19.4036 25 12.5C25 5.59644 19.4036 0 12.5 0Z" fill="${color}"/>
        <circle cx="12.5" cy="12.5" r="7" fill="white"/>
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.5 16C5.67 16 5 15.33 5 14.5S5.67 13 6.5 13 8 13.67 8 14.5 7.33 16 6.5 16ZM17.5 16C16.67 16 16 15.33 16 14.5S16.67 13 17.5 13 19 13.67 19 14.5 18.33 16 17.5 16ZM5 11L6.5 6.5H17.5L19 11H5Z" fill="${color}" transform="translate(4, 4) scale(0.7)"/>
      </svg>
    `),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
  });
};

interface MapComponentProps {
  vehicles: any[];
}

const MapComponent: React.FC<MapComponentProps> = ({ vehicles }) => {
  const [mounted, setMounted] = useState(false);

  // Move the useEffect INSIDE the component function
  useEffect(() => {
    setMounted(true);
    
    // Fix for default Leaflet marker icons in Next.js - moved inside useEffect
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  if (!mounted) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <>
      {vehicles.length > 0 ? (
        <MapContainer
          center={[17.45, 78.38]}
          zoom={12}
          style={{
            height: "100%",
            width: "100%",
            borderRadius: "0 0 1rem 1rem",
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {vehicles.map((vehicle) => {
            if (!vehicle.latitude || !vehicle.longitude) return null;

            return (
              <Marker
                key={vehicle.id}
                position={[vehicle.latitude, vehicle.longitude]}
                icon={getStatusIcon(vehicle.online_status, vehicle.health_status)}
              >
                <Popup className="vehicle-popup">
                  <div className="p-2 min-w-[200px]">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">
                        {vehicle.make} {vehicle.model}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          vehicle.status === "available"
                            ? "bg-green-100 text-green-800"
                            : vehicle.status === "in_use"
                            ? "bg-blue-100 text-blue-800"
                            : vehicle.status === "maintenance"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {vehicle.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">License Plate:</span>
                        <span className="font-medium">{vehicle.license_plate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">VIN:</span>
                        <span className="font-mono text-xs">{vehicle.vin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Battery:</span>
                        <span className="font-medium">{vehicle.current_battery_level}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mileage:</span>
                        <span className="font-medium">
                          {vehicle.mileage_km?.toLocaleString() || 0} km
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Online Status:</span>
                        <span
                          className={`font-medium ${
                            vehicle.online_status === "online"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {vehicle.online_status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Health:</span>
                        <span
                          className={`font-medium ${
                            vehicle.health_status === "Normal"
                              ? "text-green-600"
                              : vehicle.health_status === "Warning"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {vehicle.health_status}
                        </span>
                      </div>

                      {vehicle.alerts_summary && (
                        <div className="mt-2 pt-2 border-t">
                          {vehicle.alerts_summary.WARNINGS?.length > 0 && (
                            <div className="text-xs text-yellow-600">
                              <strong>Warnings:</strong>
                              <ul className="mt-1">
                                {vehicle.alerts_summary.WARNINGS.map(
                                  (warning: string, idx: number) => (
                                    <li key={idx} className="ml-2">
                                      • {warning}
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                          {vehicle.alerts_summary.ERRORS?.length > 0 && (
                            <div className="text-xs text-red-600 mt-1">
                              <strong>Errors:</strong>
                              <ul className="mt-1">
                                {vehicle.alerts_summary.ERRORS.map(
                                  (error: string, idx: number) => (
                                    <li key={idx} className="ml-2">
                                      • {error}
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      ) : (
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-500">Loading vehicle locations...</p>
        </div>
      )}
    </>
  );
};

export default MapComponent;

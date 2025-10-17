"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Clock, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fuzzySearchStrings, getSearchSuggestions, fuzzySearch } from "@/lib/fuzzySearch";
import { 
  listVehicles, 
  listUsers, 
  listDevices, 
  listAlerts, 
  listSIMCards, 
  listFirmwareUpdates, 
  listFleetOperators 
} from "@/lib/api";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'vehicle' | 'user' | 'device' | 'alert' | 'sim' | 'firmware' | 'operator';
  url: string;
  icon: string;
}

interface GlobalSearchProps {
  placeholder?: string;
  className?: string;
}

export default function GlobalSearch({ 
  placeholder = "Search", 
  className = "" 
}: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [searchableData, setSearchableData] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const router = useRouter();

  // Fetch real-time data from all APIs
  const fetchAllData = useCallback(async () => {
    const now = Date.now();
    // Cache for 30 seconds to avoid excessive API calls
    if (now - lastFetch < 30000 && searchableData.length > 0) {
      return;
    }

    setLoading(true);
    try {
      const [vehiclesResp, usersResp, devicesResp, alertsResp, simsResp, firmwareResp, operatorsResp] = await Promise.allSettled([
        listVehicles(1), // Get first page
        listUsers({ page: 1, page_size: 50 }),
        listDevices(1),
        listAlerts(1),
        listSIMCards(1),
        listFirmwareUpdates(1),
        listFleetOperators(1)
      ]);

      const allResults: SearchResult[] = [];

      // Process Vehicles
      if (vehiclesResp.status === 'fulfilled') {
        const vehicles = vehiclesResp.value.results || [];
        vehicles.forEach((vehicle: any) => {
          allResults.push({
            id: `v${vehicle.id}`,
            title: `${vehicle.make} ${vehicle.model}`,
            description: `VIN: ${vehicle.vin || 'N/A'} | License: ${vehicle.license_plate || 'N/A'}`,
            type: 'vehicle',
            url: `/vehicles/${vehicle.id}`,
            icon: '🚗'
          });
        });
      }

      // Process Users
      if (usersResp.status === 'fulfilled') {
        const users = usersResp.value.results || [];
        users.forEach((user: any) => {
          allResults.push({
            id: `u${user.id}`,
            title: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
            description: user.email || `@${user.username}`,
            type: 'user',
            url: `/user/${user.id}`,
            icon: '👤'
          });
        });
      }

      // Process Devices
      if (devicesResp.status === 'fulfilled') {
        const devices = devicesResp.value.results || devicesResp.value || [];
        devices.forEach((device: any) => {
          allResults.push({
            id: `d${device.id}`,
            title: device.device_id || `OBD Device #${device.id}`,
            description: `Serial: ${device.serial_number || 'N/A'} | FW: ${device.firmware_version || 'N/A'}`,
            type: 'device',
            url: `/obd-device/${device.id}`,
            icon: '📱'
          });
        });
      }

      // Process Alerts
      if (alertsResp.status === 'fulfilled') {
        const alerts = alertsResp.value.results || [];
        alerts.forEach((alert: any) => {
          allResults.push({
            id: `a${alert.id}`,
            title: alert.name || alert.title || `Alert #${alert.id}`,
            description: alert.description || alert.alert_type || 'Alert',
            type: 'alert',
            url: `/alerts/${alert.id}`,
            icon: '⚠️'
          });
        });
      }

      // Process SIM Cards
      if (simsResp.status === 'fulfilled') {
        const sims = simsResp.value.results || simsResp.value || [];
        sims.forEach((sim: any) => {
          allResults.push({
            id: `s${sim.id}`,
            title: sim.sim_id || `SIM Card ${sim.id}`,
            description: `ICCID: ${sim.iccid || 'N/A'} | Plan: ${sim.plan_name || 'N/A'}`,
            type: 'sim',
            url: `/sims/${sim.id}`,
            icon: '📶'
          });
        });
      }

      // Process Firmware
      if (firmwareResp.status === 'fulfilled') {
        const firmware = firmwareResp.value.results || [];
        firmware.forEach((fw: any) => {
          allResults.push({
            id: `f${fw.id}`,
            title: `${fw.component} v${fw.version}`,
            description: fw.description || `Status: ${fw.status || 'Unknown'}`,
            type: 'firmware',
            url: `/firmware-updates/${fw.id}`,
            icon: '💾'
          });
        });
      }

      // Process Fleet Operators
      if (operatorsResp.status === 'fulfilled') {
        const operators = operatorsResp.value.results || [];
        operators.forEach((operator: any) => {
          allResults.push({
            id: `o${operator.id}`,
            title: operator.name || `Fleet Operator ${operator.id}`,
            description: `Code: ${operator.code || 'N/A'} | Email: ${operator.contact_email || 'N/A'}`,
            type: 'operator',
            url: `/fleet-operators/${operator.id}`,
            icon: '🏢'
          });
        });
      }

      setSearchableData(allResults);
      setLastFetch(now);
    } catch (error) {
      console.error('Error fetching search data:', error);
    } finally {
      setLoading(false);
    }
  }, [lastFetch, searchableData.length]);

  // Fetch data when component mounts or when search opens
  useEffect(() => {
    if (isOpen) {
      fetchAllData();
    }
  }, [isOpen, fetchAllData]);


  // Fuzzy search through all data
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    
    const results = fuzzySearch(searchableData, query, ['title', 'description'], {
      threshold: 0.2,
      minLength: 1
    });
    
    return results.slice(0, 8); // Limit to 8 results
  }, [query, searchableData]);

  // Get search suggestions
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    return getSearchSuggestions(
      searchableData.map(item => item.title),
      query,
      5
    );
  }, [query, searchableData]);

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    setIsOpen(false);
    setQuery("");
    
    // Navigate to first result or show all results
    if (searchResults.length > 0) {
      router.push(searchResults[0].url);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery("");
    router.push(result.url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(query);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery("");
    } else if (e.key === '/' && !isOpen) {
      // Global shortcut to open search
      e.preventDefault();
      setIsOpen(true);
      setTimeout(() => {
        const input = document.querySelector('input[placeholder*="Search vehicles"]') as HTMLInputElement;
        if (input) input.focus();
      }, 100);
    }
  };

  // Global keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => {
          const input = document.querySelector('input[placeholder*="Search vehicles"]') as HTMLInputElement;
          if (input) input.focus();
        }, 100);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isOpen && !target.closest('.global-search-container')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const getTypeColor = (type: string) => {
    const colors = {
      vehicle: "bg-blue-100 text-blue-800",
      user: "bg-green-100 text-green-800",
      device: "bg-purple-100 text-purple-800",
      alert: "bg-red-100 text-red-800",
      sim: "bg-yellow-100 text-yellow-800",
      firmware: "bg-indigo-100 text-indigo-800",
      operator: "bg-gray-100 text-gray-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      vehicle: "Vehicle",
      user: "User",
      device: "Device",
      alert: "Alert",
      sim: "SIM",
      firmware: "Firmware",
      operator: "Operator",
    };
    return labels[type as keyof typeof labels] || "Item";
  };

  return (
    <div className={`relative global-search-container ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-20 w-full"
        />
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setQuery("")}
              className="h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
          <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
            <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">⌘K</kbd>
          </div>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto shadow-lg border">
          <CardContent className="p-0">
            {loading && !searchableData.length ? (
              <div className="p-4 text-center">
                <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-500">Loading search data...</p>
              </div>
            ) : query.trim() ? (
              <>
                {/* Search Results */}
                {searchResults.length > 0 ? (
                  <div className="p-2">
                    <div className="text-xs text-gray-500 mb-2 px-2 flex items-center justify-between">
                      <span>{searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found</span>
                      <span className="text-xs text-gray-400">Press Enter to search</span>
                    </div>
                    
                    {/* Group results by type */}
                    {Object.entries(
                      searchResults.reduce((acc, result) => {
                        if (!acc[result.type]) acc[result.type] = [];
                        acc[result.type].push(result);
                        return acc;
                      }, {} as Record<string, SearchResult[]>)
                    ).map(([type, results]) => (
                      <div key={type} className="mb-3">
                        <div className="text-xs font-medium text-gray-700 px-2 py-1 bg-gray-100">
                          {getTypeLabel(type)} ({results.length})
                    </div>
                        {results.slice(0, 3).map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className="w-full text-left p-2 hover:bg-gray-50 rounded-md flex items-center gap-3"
                      >
                        <span className="text-lg">{result.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{result.title}</div>
                          <div className="text-xs text-gray-500 truncate">{result.description}</div>
                        </div>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                      </button>
                        ))}
                        {results.length > 3 && (
                          <div className="text-xs text-gray-500 px-2 py-1">
                            +{results.length - 3} more {getTypeLabel(type).toLowerCase()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No results found for "{query}"</p>
                    <p className="text-xs mt-1">Try different keywords or check spelling</p>
                  </div>
                )}
              </>
            ) : (
              /* Recent Searches and Quick Actions */
              <div className="p-2">
                
                <div className="border-t mt-2 pt-2">
                  <div className="text-xs text-gray-500 mb-2 px-2">
                    Quick shortcuts
                  </div>
                  <div className="px-2 py-1 text-xs text-gray-400 space-y-1">
                    <div>• Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Ctrl+K</kbd> to open search</div>
                    <div>• Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">/</kbd> to focus search</div>
                    <div>• Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Esc</kbd> to close</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}


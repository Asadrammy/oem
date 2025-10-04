// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   Car,
//   Settings,
//   AlertTriangle,
//   Wrench,
//   Smartphone,
//   Download,
//   BarChart3,
//   Home,
//   Search,
//   Plus,
//   List,
//   FileText,
//   Clock,
//   History,
//   User,
//   Usb,
//   Gauge,
// } from "lucide-react";

// import {
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarRail,
// } from "@/components/ui/sidebar";
// import { Input } from "@/components/ui/input";
// import { title } from "process";

// const navigation = [
//   {
//     title: "Overview",
//     items: [
//       { title: "Dashboard", icon: Home, url: "/dashboard" },
//     ],
//   },
//   {
//     title: "Fleet Management",
//     items: [{ title: "Fleet Operaters", icon: Car, url: "/fleet-operators" }],
//   },
//   {
//     title: "Vehicles Management",
//     items: [
//       { title: "Vehicles Dashbord", icon: Gauge, url: "/vehicle-dashboard" },
//       { title: "Vehicles", icon: Car, url: "/vehicles" },
//       { title: "Vehicle Types", icon: List, url: "/vehicle-types" },
//       // { title: "Firmware Updates", icon: Download, url: "/firmware-updates/" },
//     ],
//   },
//   {
//     title: "OBD Management",
//     items: [
//       { title: "OBD Device", icon: Usb, url: "/obd-device/" },
//       { title: "OBD Telemetry", icon: Usb, url: "/obd-telemetry/" },
//     ],
//   },

//   {
//     title: "Monitoring",
//     items: [
//       { title: "Alerts", icon: AlertTriangle, url: "/all-alerts" },
//       { title: "Alerts Rule & Warnings", icon: AlertTriangle, url: "/alerts" },
//     ],
//   },
//   // {
//   //   title: "Maintenance",
//   //   items: [
//   //     { title: "Overview", icon: Wrench, url: "/maintenance" },
//   //     { title: "Scheduled", icon: Clock, url: "/maintenance/scheduled" },
//   //     { title: "History", icon: History, url: "/maintenance/history" },
//   //   ],
//   // },
//   {
//     title: "Connectivity",
//     items: [
//       { title: "SIM Management", icon: Smartphone, url: "/sims" },
//       { title: "OTA Updates", icon: Download, url: "/firmware-updates" },
//       // { title: "OTA Updates", icon: Download, url: "/ota" },
//     ],
//   },
//     {
//     title: "Users Management",
//     items: [
//       { title: "Users", icon: User, url: "/user" },
//       { title: "Role & Permissions", icon: Settings, url: "/group-permissions" },
      
//     ],
//   },
  
// ];

// export function AppSidebar() {
//   const pathname = usePathname();

//   // consider a segment-aware active function (handles child URLs too)
//   const isActive = (url: string) => {
//     if (url === "/") return pathname === "/";
//     return pathname === url || pathname.startsWith(url + "/");
//   };

//   return (
//     <Sidebar className="border-r border-gray-200">
//       <SidebarHeader className="p-4">
//         <div className="flex items-center gap-2">
//           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
//             <Car className="w-4 h-4 text-white" />
//           </div>
//           <div>
//             <h2 className="font-semibold text-gray-900">OEM Diagnostics</h2>
//             <p className="text-xs text-gray-500">Fleet Management</p>
//           </div>
//         </div>
//         <div className="relative mt-4">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//           <Input placeholder="Search vehicles..." className="pl-10" />
//         </div>
//       </SidebarHeader>

//       <SidebarContent>
//         {navigation.map((section) => (
//           <SidebarGroup key={section.title}>
//             <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider">
//               {section.title}
//             </SidebarGroupLabel>
//             <SidebarGroupContent>
//               <SidebarMenu>
//                 {section.items.map((item) => {
//                   const active = isActive(item.url);
//                   return (
//                     <SidebarMenuItem key={item.title}>
//                       <SidebarMenuButton asChild isActive={active}>
//                         <Link
//                           href={item.url}
//                           className="flex items-center gap-3"
//                           aria-current={active ? "page" : undefined}
//                         >
//                           <item.icon className="w-4 h-4" />
//                           <span>{item.title}</span>
//                         </Link>
//                       </SidebarMenuButton>
//                     </SidebarMenuItem>
//                   );
//                 })}
//               </SidebarMenu>
//             </SidebarGroupContent>
//           </SidebarGroup>
//         ))}
//       </SidebarContent>

//       <SidebarRail />
//     </Sidebar>
//   );
// }
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import {
  Car,
  Settings,
  AlertTriangle,
  Wrench,
  Smartphone,
  Download,
  List,
  Home,
  Gauge,
  Search,
  User,
  Usb,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";

const navigation = [
  {
    title: "Overview",
    items: [{ title: "Dashboard", icon: Home, url: "/dashboard" }],
  },
  {
    title: "Fleet Management",
    items: [{ title: "Fleet Operaters", icon: Car, url: "/fleet-operators" }],
  },
  {
    title: "Vehicles Management",
    items: [
      // { title: "Vehicles Dashbord", icon: Gauge, url: "/vehicle-dashboard" },
      { title: "Vehicles", icon: Car, url: "/vehicles" },
      { title: "Vehicle Types", icon: List, url: "/vehicle-types" },
    ],
  },
  {
    title: "OBD Management",
    items: [
      { title: "OBD Device", icon: Usb, url: "/obd-device/" },
      { title: "OBD Telemetry", icon: Usb, url: "/obd-telemetry/" },
    ],
  },
  {
    title: "Monitoring",
    items: [
      { title: "Alerts", icon: AlertTriangle, url: "/all-alerts" },
      { title: "Alerts Rule & Warnings", icon: AlertTriangle, url: "/alerts" },
    ],
  },
  {
    title: "Connectivity",
    items: [
      { title: "SIM Management", icon: Smartphone, url: "/sims" },
      { title: "OTA Updates", icon: Download, url: "/firmware-updates" },
    ],
  },
  {
    title: "Users Management",
    items: [
      { title: "Users", icon: User, url: "/user" },
      { title: "Role & Permissions", icon: Settings, url: "/group-permissions" },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [search, setSearch] = useState("");

  const isActive = (url: string) => {
    if (url === "/") return pathname === "/";
    return pathname === url || pathname.startsWith(url + "/");
  };

  // Filter navigation items based on search input
  const filteredNavigation = useMemo(() => {
    if (!search.trim()) return navigation;

    const query = search.toLowerCase();

    return navigation
      .map((section) => {
        const filteredItems = section.items.filter((item) =>
          item.title.toLowerCase().includes(query)
        );
        if (filteredItems.length > 0) {
          return { ...section, items: filteredItems };
        }
        return null;
      })
      .filter(Boolean) as typeof navigation;
  }, [search]);

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Car className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">OEM Diagnostics</h2>
            <p className="text-xs text-gray-500">Fleet Management</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {filteredNavigation.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={active}>
                        <Link
                          href={item.url}
                          className="flex items-center gap-3"
                          aria-current={active ? "page" : undefined}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}

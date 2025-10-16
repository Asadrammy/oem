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
//     items: [{ title: "Fleet Operators", icon: Car, url: "/fleet-operators" }],
//   },
//   {
//     title: "Vehicles Management",
//     items: [
//       { title: "Vehicles Dashboard", icon: Gauge, url: "/vehicle-dashboard" },
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
//       { title: "Alert Rules & Warnings", icon: AlertTriangle, url: "/alerts" },
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
//     title: "User Management",
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
import { useState, useMemo, useEffect, useRef } from "react";
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
import GlobalSearch from "@/components/global-search";
import { fuzzySearch } from "@/lib/fuzzySearch";

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
      { title: "OBD Device", icon: Usb, url: "/obd-device" },
      { title: "OBD Telemetry", icon: Usb, url: "/obd-telemetry" },
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
  const sidebarContentRef = useRef<HTMLDivElement>(null);

  // Function to scroll to active item
  const scrollToActiveItem = () => {
    if (sidebarContentRef.current) {
      // Find the active menu item within this sidebar
      const activeMenuItem = sidebarContentRef.current.querySelector('[aria-current="page"]');
      if (activeMenuItem) {
        console.log('Scrolling to active item:', activeMenuItem);
        
        // Try multiple scroll methods
        const container = sidebarContentRef.current;
        
        // Method 1: Direct scrollIntoView
        try {
          (activeMenuItem as HTMLElement).scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        } catch (e) {
          console.log('scrollIntoView failed, trying manual scroll');
          
          // Method 2: Manual scroll calculation
          const itemTop = (activeMenuItem as HTMLElement).offsetTop;
          const containerHeight = container.clientHeight;
          const itemHeight = (activeMenuItem as HTMLElement).clientHeight;
          const scrollTop = itemTop - (containerHeight / 2) + (itemHeight / 2);
          
          console.log('Scroll values:', { itemTop, containerHeight, itemHeight, scrollTop });
          
          container.scrollTo({
            top: Math.max(0, scrollTop),
            behavior: 'smooth'
          });
        }
      } else {
        console.log('No active menu item found in sidebar');
        
        // Fallback: try to find any active item in the document
        const globalActiveItem = document.querySelector('[aria-current="page"]');
        if (globalActiveItem) {
          console.log('Found global active item, scrolling to it');
          (globalActiveItem as HTMLElement).scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }
      }
    } else {
      console.log('Sidebar content ref not available');
    }
  };

  const isActive = (url: string) => {
    if (url === "/") return pathname === "/";
    const isMatch = pathname === url || pathname.startsWith(url + "/");
    
    // Debug logging for OBD Management
    if (url.includes("obd-device") || url.includes("obd-telemetry")) {
      console.log(`Checking OBD URL: ${url}, pathname: ${pathname}, isMatch: ${isMatch}`);
    }
    
    return isMatch;
  };

  // Auto-scroll to active item when route changes
  useEffect(() => {
    // Call scroll function multiple times with different delays
    scrollToActiveItem();
    
    const timers = [
      setTimeout(() => scrollToActiveItem(), 100),
      setTimeout(() => scrollToActiveItem(), 300),
      setTimeout(() => scrollToActiveItem(), 500),
      setTimeout(() => scrollToActiveItem(), 1000)
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [pathname]);

  // Use MutationObserver to detect DOM changes
  useEffect(() => {
    if (sidebarContentRef.current) {
      const observer = new MutationObserver(() => {
        scrollToActiveItem();
      });

      observer.observe(sidebarContentRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['aria-current', 'class']
      });

      return () => observer.disconnect();
    }
  }, []);

  // Global route change listener
  useEffect(() => {
    const handleRouteChange = () => {
      setTimeout(() => scrollToActiveItem(), 100);
    };

    // Listen for popstate events (browser back/forward)
    window.addEventListener('popstate', handleRouteChange);
    
    // Listen for pushstate/replacestate (programmatic navigation)
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function(...args) {
      originalPushState.apply(this, args);
      setTimeout(() => scrollToActiveItem(), 100);
    };
    
    window.history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      setTimeout(() => scrollToActiveItem(), 100);
    };

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  // Also scroll when search changes (in case active item changes)
  useEffect(() => {
    if (search.trim() === '') {
      const timer = setTimeout(() => {
        scrollToActiveItem();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [search]);

  // Filter navigation items based on search input using fuzzy search
  const filteredNavigation = useMemo(() => {
    if (!search.trim()) return navigation;

    return navigation
      .map((section) => {
        // Use fuzzy search to filter items
        const filteredItems = fuzzySearch(section.items, search, ['title'], {
          threshold: 0.3,
          minLength: 1
        });
        
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

        {/* Global Search */}
        <div className="mt-4">
          <GlobalSearch placeholder="Search vehicles, users, devices..." />
        </div>
      </SidebarHeader>

      <SidebarContent ref={sidebarContentRef}>
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
                          onClick={() => {
                            // Force scroll to this item after navigation
                            setTimeout(() => {
                              scrollToActiveItem();
                            }, 500);
                          }}
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

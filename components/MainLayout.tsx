"use client";

import type React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Header } from "@/components/header";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function MainLayout({ children, title, subtitle }: MainLayoutProps) {
  const pathname = usePathname();
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Scroll to top when route changes and reset scroll position
  useEffect(() => {
    if (mainContentRef.current) {
      // Immediately reset scroll position for instant feedback
      mainContentRef.current.scrollTop = 0;
      
      // Optional: Smooth scroll animation (commented out for instant response)
      // mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathname]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen">
        {/* Fixed Header */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-white">
          <Header title={title} subtitle={subtitle} />
        </div>

        {/* Scrollable Main Content */}
        <div 
          ref={mainContentRef}
          className="flex-1 overflow-auto p-6 bg-gray-50"
          style={{
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch' // Better scrolling on iOS
          }}
        >
          <div className="max-w-full">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

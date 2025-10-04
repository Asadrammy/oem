
"use client";

import type React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "../../components/app-sidebar";
import { Header } from "@/components/header";

export default function VehiclesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Reusable Header */}
        <Header
          title="SIM Management "
          subtitle=" Manage SIM cards and data plans"
        />

        {/* Main Content */}
        <div className="flex-1 p-6 bg-gray-50">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

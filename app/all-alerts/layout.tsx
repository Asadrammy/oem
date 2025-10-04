"use client";

import type React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "../../components/app-sidebar";
import { Header } from "@/components/header";

export default function Allalert({
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
          title="Alert"
          subtitle=" Manage and monitor your alerts"
        />

        {/* Main Content */}
        <div className="flex-1 p-6 bg-gray-50">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
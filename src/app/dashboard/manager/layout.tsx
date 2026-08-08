"use client";

import { useState } from "react";
import { ManagerSidebar } from "@/components/manager/sidebar";
import { ManagerTopbar } from "@/components/manager/topbar";
import { TabRoleGuard } from "@/components/tab-role-guard";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <TabRoleGuard requiredRole="MANAJER">
      <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#0d1117" }}>
        <ManagerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <ManagerTopbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </TabRoleGuard>
  );
}

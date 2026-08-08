"use client";

import { useState } from "react";
import { PelayanSidebar } from "@/components/pelayan/sidebar";
import { PelayanTopbar } from "@/components/pelayan/topbar";
import { TabRoleGuard } from "@/components/tab-role-guard";

export default function WaiterLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <TabRoleGuard requiredRole="PELAYAN">
      <div className="flex h-screen bg-[#121221] overflow-hidden">
        <PelayanSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <PelayanTopbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </TabRoleGuard>
  );
}

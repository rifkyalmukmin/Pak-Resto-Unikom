"use client";

import { useState } from "react";
import { KokiSidebar } from "@/components/koki/sidebar";
import { KokiTopbar } from "@/components/koki/topbar";
import { TabRoleGuard } from "@/components/tab-role-guard";

export default function ChefLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <TabRoleGuard requiredRole="CHEF">
      <div className="flex h-screen bg-[#121221] overflow-hidden">
        <KokiSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <KokiTopbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </TabRoleGuard>
  );
}

"use client";

import { useState } from "react";
import { KasirSidebar } from "@/components/kasir/sidebar";
import { KasirTopbar } from "@/components/kasir/topbar";

export default function CashierLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#121221] overflow-hidden">
      <KasirSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <KasirTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

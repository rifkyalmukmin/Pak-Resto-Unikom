import { KasirSidebar } from "@/components/kasir/sidebar";
import { KasirTopbar } from "@/components/kasir/topbar";

export default function CashierLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#121221] overflow-hidden">
      <KasirSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <KasirTopbar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

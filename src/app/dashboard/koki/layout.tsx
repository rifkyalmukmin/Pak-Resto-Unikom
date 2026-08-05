import { KokiSidebar } from "@/components/koki/sidebar";
import { KokiTopbar } from "@/components/koki/topbar";

export default function ChefLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#121221] overflow-hidden">
      <KokiSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <KokiTopbar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

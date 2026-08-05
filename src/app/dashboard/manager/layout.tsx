import { ManagerSidebar } from "@/components/manager/sidebar";
import { ManagerTopbar } from "@/components/manager/topbar";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#0d1117" }}>
      <ManagerSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <ManagerTopbar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

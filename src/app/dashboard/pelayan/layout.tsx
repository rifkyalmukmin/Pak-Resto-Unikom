import { PelayanSidebar } from "@/components/pelayan/sidebar";
import { PelayanTopbar } from "@/components/pelayan/topbar";

export default function WaiterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#121221] overflow-hidden">
      <PelayanSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <PelayanTopbar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

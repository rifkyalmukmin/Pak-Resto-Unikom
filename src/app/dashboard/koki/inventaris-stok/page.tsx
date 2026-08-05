"use client";

import { useState } from "react";
import { Search, ListFilter, Download, X, Check, AlertTriangle, Pencil, BellRing, BellOff, ChevronDown } from "lucide-react";

type StokStatus = "TERSEDIA" | "HAMPIR HABIS" | "HABIS";

interface Bahan {
  id: number;
  nama: string;
  jumlah: number;
  satuan: string;
  status: StokStatus;
}

const ACCENT = "#F59E0B";

const initialBahan: Bahan[] = [
  { id: 1, nama: "Daging Sapi (Wagyu MB5)", jumlah: 24.5, satuan: "KG",  status: "TERSEDIA" },
  { id: 2, nama: "Ayam Fillet (Dada)",      jumlah: 4.2,  satuan: "KG",  status: "HAMPIR HABIS" },
  { id: 3, nama: "Selada Romaine",           jumlah: 0,    satuan: "PCS", status: "HABIS" },
  { id: 4, nama: "Bawang Putih",             jumlah: 12,   satuan: "KG",  status: "TERSEDIA" },
  { id: 5, nama: "Truffle Oil (Black)",      jumlah: 0.8,  satuan: "Ltr", status: "HAMPIR HABIS" },
  { id: 6, nama: "Beras Jasmine",            jumlah: 150,  satuan: "KG",  status: "TERSEDIA" },
  { id: 7, nama: "Telur Ayam Kampung",       jumlah: 6,    satuan: "PCS", status: "HAMPIR HABIS" },
  { id: 8, nama: "Santan Kelapa",            jumlah: 0,    satuan: "Ltr", status: "HABIS" },
];

const statusStyle: Record<StokStatus, string> = {
  "TERSEDIA":     "bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981]",
  "HAMPIR HABIS": "bg-amber-500/15 border border-amber-500/30 text-amber-400",
  "HABIS":        "bg-red-500/15 border border-red-500/30 text-red-400",
};
const statusDot: Record<StokStatus, string> = {
  "TERSEDIA":     "bg-[#10B981]",
  "HAMPIR HABIS": "bg-amber-400",
  "HABIS":        "bg-red-500",
};

type OverlayType = "konfirmasi" | "sukses-edit" | null;

export default function InventarisStokPage() {
  const [bahanList, setBahanList] = useState<Bahan[]>(initialBahan);
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState<StokStatus | "SEMUA">("SEMUA");
  const [filterOpen, setFilterOpen]     = useState(false);
  const [editTarget, setEditTarget]     = useState<Bahan | null>(null);
  const [jumlahInput, setJumlahInput]   = useState("");
  const [overlay, setOverlay]           = useState<OverlayType>(null);

  const filtered = bahanList.filter((b) =>
    b.nama.toLowerCase().includes(search.toLowerCase()) &&
    (filterStatus === "SEMUA" || b.status === filterStatus)
  );
  const totalItem    = bahanList.length;
  const stokTersedia = bahanList.filter((b) => b.status === "TERSEDIA").length;
  const hampirHabis  = bahanList.filter((b) => b.status === "HAMPIR HABIS").length;
  const outOfStock   = bahanList.filter((b) => b.status === "HABIS").length;

  function openEdit(b: Bahan) {
    setEditTarget(b);
    setJumlahInput(String(b.jumlah));
  }
  function closeEdit() { setEditTarget(null); setJumlahInput(""); setOverlay(null); }

  function computeStatus(j: number): StokStatus {
    if (j <= 0) return "HABIS";
    if (j < 10) return "HAMPIR HABIS";
    return "TERSEDIA";
  }

  function handleSimpanClick() {
    if (jumlahInput === "") return;
    setOverlay("konfirmasi");
  }
  function handleKonfirmasiYes() {
    if (!editTarget) return;
    const jumlah = parseFloat(jumlahInput) || 0;
    setBahanList((p) =>
      p.map((b) => b.id === editTarget.id ? { ...b, jumlah, status: computeStatus(jumlah) } : b)
    );
    setEditTarget(null);
    setJumlahInput("");
    setOverlay("sukses-edit");
  }

  const InfoIcon = () => (
    <div className="w-11 h-11 rounded-full flex items-center justify-center border-2 mb-5"
      style={{ borderColor: ACCENT, backgroundColor: `${ACCENT}18` }}>
      <span className="font-bold text-lg leading-none select-none" style={{ color: ACCENT }}>i</span>
    </div>
  );
  const SuccessIcon = () => (
    <div className="w-11 h-11 rounded-full flex items-center justify-center border-2 mb-5"
      style={{ borderColor: ACCENT, backgroundColor: `${ACCENT}18` }}>
      <Check size={22} color={ACCENT} strokeWidth={3} />
    </div>
  );

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 p-6 space-y-5">

        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Inventaris Stok</h1>
          <p className="text-slate-400 text-sm mt-1.5 leading-relaxed max-w-lg">
            Pantau dan perbarui ketersediaan bahan baku dapur secara real-time.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-xl border border-white/5 p-5 flex items-center justify-between" style={{ backgroundColor: "#1E293B" }}>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">Total Item Terdaftar</p>
              <p className="text-white text-4xl font-bold tabular-nums">{totalItem}</p>
            </div>
          </div>
          <div className="rounded-xl border border-white/5 p-5 flex items-center justify-between" style={{ backgroundColor: "#1E293B" }}>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">Stok Tersedia</p>
              <p className="text-4xl font-bold tabular-nums text-[#4EDEA3]">{stokTersedia}</p>
            </div>
            <div className="w-14 h-14 rounded-full flex items-center justify-center border-2 shrink-0" style={{ borderColor: "#10B981", backgroundColor: "#10B98118" }}>
              <Check size={26} color="#10B981" strokeWidth={2.5} />
            </div>
          </div>
          <div className="rounded-xl border border-white/5 p-5 flex items-center justify-between" style={{ backgroundColor: "#1E293B" }}>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">Hampir Habis (Low)</p>
              <p className="text-4xl font-bold tabular-nums" style={{ color: ACCENT }}>{hampirHabis}</p>
            </div>
            <div className="w-14 h-14 rounded-full flex items-center justify-center border-2 shrink-0" style={{ borderColor: ACCENT, backgroundColor: `${ACCENT}18` }}>
              <AlertTriangle size={24} color={ACCENT} strokeWidth={2.5} />
            </div>
          </div>
          <div className="rounded-xl border border-white/5 p-5 flex items-center justify-between" style={{ backgroundColor: "#1E293B" }}>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">Out of Stock</p>
              <p className="text-4xl font-bold tabular-nums text-[#FFB4AB]">{outOfStock}</p>
            </div>
            <div className="w-14 h-14 rounded-full flex items-center justify-center border-2 shrink-0" style={{ borderColor: "#FFB4AB", backgroundColor: "#FFB4AB18" }}>
              <X size={26} color="#FFB4AB" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Table card */}
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "#1E293B", borderColor: "#45464C" }}>
          {/* Toolbar */}
          <div className="px-5 py-4 flex items-center gap-3 border-b" style={{ backgroundColor: "#131B2E80", borderColor: "#45464C40" }}>
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari bahan baku..."
                className="w-full border border-white/10 text-white placeholder-slate-500 text-sm rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-white/25"
                style={{ backgroundColor: "#0D1625" }}
              />
            </div>
            <div className="flex-1" />
            <div className="relative">
              <button
                onClick={() => setFilterOpen((p) => !p)}
                className="flex items-center gap-2 border border-white/10 text-slate-300 text-sm px-3.5 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                style={{ backgroundColor: "#31353F" }}
              >
                <ListFilter size={13} />
                <span>{filterStatus === "SEMUA" ? "Filter Status" : filterStatus}</span>
                <ChevronDown size={12} className={`transition-transform ${filterOpen ? "rotate-180" : ""}`} />
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 rounded-xl border overflow-hidden z-50 shadow-xl"
                  style={{ backgroundColor: "#0D1625", borderColor: "#45464C" }}>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider px-4 pt-3 pb-2">Status Inventaris</p>
                  {([
                    { value: "SEMUA",        label: "Semua Status",  dot: "#64748b" },
                    { value: "TERSEDIA",     label: "Tersedia",      dot: "#10B981" },
                    { value: "HAMPIR HABIS", label: "Hampir Habis",  dot: ACCENT },
                    { value: "HABIS",        label: "Habis",         dot: "#FFB4AB" },
                  ] as const).map(({ value, label, dot }) => (
                    <button
                      key={value}
                      onClick={() => { setFilterStatus(value); setFilterOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                      style={{ color: filterStatus === value ? "#fff" : "#94a3b8" }}
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dot }} />
                      <span className="flex-1 text-left font-medium">{label}</span>
                      {filterStatus === value && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </button>
                  ))}
                  {filterStatus !== "SEMUA" && (
                    <div className="px-4 py-2.5 border-t" style={{ borderColor: "#45464C" }}>
                      <button
                        onClick={() => { setFilterStatus("SEMUA"); setFilterOpen(false); }}
                        className="text-xs font-semibold hover:opacity-70"
                        style={{ color: ACCENT }}
                      >
                        Reset filter
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <button className="flex items-center gap-2 border border-white/10 text-sm px-3.5 py-2.5 rounded-lg font-semibold hover:opacity-90"
              style={{ backgroundColor: "#BFC6DC", color: "#1a1a2e" }}>
              <Download size={13} /> Export CSV/PDF
            </button>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[2.5fr_1fr_1fr_1.5fr_0.5fr] gap-4 px-5 py-3 border-b"
            style={{ backgroundColor: "#131B2E4D", borderColor: "#45464C40" }}>
            {["Nama Bahan", "Jumlah\nTersisa", "Satuan", "Status\nInventaris", "Aksi"].map((h) => (
              <p key={h} className="text-white text-[10px] font-bold uppercase tracking-wider whitespace-pre-line leading-tight">{h}</p>
            ))}
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="px-5 py-10 text-center text-slate-500 text-sm">Tidak ada bahan baku ditemukan</div>
          ) : filtered.map((b) => (
            <div
              key={b.id}
              className="grid grid-cols-[2.5fr_1fr_1fr_1.5fr_0.5fr] gap-4 px-5 py-3.5 border-b last:border-0 items-center"
              style={{ backgroundColor: "#1E293B", borderColor: "#45464C30" }}
            >
              <span className="text-sm text-[#E3E0F7]">{b.nama}</span>
              <p className="text-sm font-mono tabular-nums text-[#E3E0F7]">
                {b.jumlah % 1 === 0 ? b.jumlah.toFixed(0) : b.jumlah.toFixed(1)}
              </p>
              <p className="text-sm text-[#E3E0F7]">{b.satuan}</p>
              <div>
                <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-md w-fit ${statusStyle[b.status]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot[b.status]}`} />
                  {b.status}
                </span>
              </div>
              <div>
                <button onClick={() => openEdit(b)} className="text-white hover:opacity-70 transition-opacity p-1">
                  <Pencil size={14} />
                </button>
              </div>
            </div>
          ))}

          {/* Footer */}
          <div className="px-5 py-3 flex items-center justify-between" style={{ backgroundColor: "#131B2E4D" }}>
            <p className="text-slate-400 text-sm">
              Menampilkan <span className="text-white font-semibold">{filtered.length}</span> dari{" "}
              <span className="text-white font-semibold">{bahanList.length}</span> bahan baku
            </p>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 border border-white/10 hover:text-white" style={{ backgroundColor: "#1E293B" }}>‹</button>
              {[1, 2, 3].map((p) => (
                <button key={p} className="w-8 h-8 rounded-lg text-sm font-semibold"
                  style={p === 1 ? { backgroundColor: ACCENT, color: "#000" } : { backgroundColor: "transparent", color: "#94a3b8" }}>
                  {p}
                </button>
              ))}
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 border border-white/10 hover:text-white" style={{ backgroundColor: "#1E293B" }}>›</button>
            </div>
          </div>
        </div>

        {/* Bottom alert cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/5 p-5" style={{ backgroundColor: "#1E293B" }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-bold text-base">Peringatan Stok Menipis</h3>
                <p className="text-slate-400 text-sm mt-0.5">Bahan berikut memerlukan pengadaan ulang segera.</p>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${ACCENT}18` }}>
                <BellRing size={16} color={ACCENT} strokeWidth={2} />
              </div>
            </div>
            <div className="space-y-2">
              {bahanList.filter((b) => b.status === "HAMPIR HABIS").map((item) => (
                <div key={item.id} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ backgroundColor: "#1A1A2A" }}>
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle size={14} color={ACCENT} />
                    <span className="text-white text-sm font-medium">{item.nama}</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: ACCENT }}>
                    Sisa {item.jumlah % 1 === 0 ? item.jumlah : item.jumlah.toFixed(1)} {item.satuan}
                  </span>
                </div>
              ))}
              {bahanList.filter((b) => b.status === "HAMPIR HABIS").length === 0 && (
                <p className="text-slate-500 text-sm text-center py-3">Tidak ada stok menipis</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-white/5 p-5" style={{ backgroundColor: "#1E293B" }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-bold text-base">Peringatan Stok Habis</h3>
                <p className="text-slate-400 text-sm mt-0.5">Bahan baku berikut telah kehabisan stok.</p>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#FFB4AB18" }}>
                <BellOff size={16} color="#FFB4AB" strokeWidth={2} />
              </div>
            </div>
            <div className="space-y-2">
              {bahanList.filter((b) => b.status === "HABIS").map((item) => (
                <div key={item.id} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ backgroundColor: "#1A1A2A" }}>
                  <div className="flex items-center gap-2.5">
                    <X size={14} color="#FFB4AB" />
                    <span className="text-white text-sm font-medium">{item.nama}</span>
                  </div>
                  <span className="text-sm font-bold text-[#FFB4AB]">Stok Habis</span>
                </div>
              ))}
              {bahanList.filter((b) => b.status === "HABIS").length === 0 && (
                <p className="text-slate-500 text-sm text-center py-3">Semua stok tersedia</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Update Stok */}
      {editTarget !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeEdit} />
          <div className="relative w-[480px] rounded-2xl overflow-hidden border shadow-2xl z-10" style={{ borderColor: "#45464C" }}>
            <div className="px-7 pt-6 pb-5 border-b" style={{ backgroundColor: "#2D3449", borderBottomColor: "#45464C" }}>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-bold text-xl text-white">Update Stok</h2>
                  <p className="text-slate-400 text-sm mt-1">{editTarget.nama}</p>
                </div>
                <button onClick={closeEdit} className="text-slate-500 hover:text-white transition-colors p-1 mt-0.5">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="px-7 py-6" style={{ backgroundColor: "#222A3D" }}>
              <label className="text-white text-xs font-bold uppercase tracking-wider block mb-2">
                Jumlah Stok ({editTarget.satuan})
              </label>
              <div className="flex items-center rounded-xl border overflow-hidden" style={{ backgroundColor: "#060E20", borderColor: "#45464C" }}>
                <input
                  type="text" inputMode="decimal"
                  value={jumlahInput}
                  onChange={(e) => setJumlahInput(e.target.value.replace(/[^0-9.]/g, ""))}
                  placeholder="0"
                  className="flex-1 bg-transparent text-lg font-bold px-4 py-3 focus:outline-none text-white"
                />
                <span className="px-4 text-slate-400 text-sm font-semibold">{editTarget.satuan}</span>
              </div>
            </div>
            <div className="px-7 py-5 flex items-center justify-end gap-3 border-t" style={{ backgroundColor: "#2D3449", borderTopColor: "#45464C" }}>
              <button onClick={closeEdit} className="px-5 py-2.5 rounded-xl border text-white text-sm font-semibold hover:bg-white/5" style={{ borderColor: "#45464C" }}>
                Batal
              </button>
              <button onClick={handleSimpanClick}
                className="px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90"
                style={{ backgroundColor: ACCENT, color: "#000" }}>
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Konfirmasi */}
      {overlay === "konfirmasi" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-[420px] rounded-2xl border border-white/10 shadow-2xl px-8 py-8 z-10" style={{ backgroundColor: "#1E2235" }}>
            <InfoIcon />
            <h3 className="text-white font-bold text-lg mb-2">Konfirmasi Perubahan</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-7">Apakah anda yakin dengan perubahan stok yang akan dilakukan?</p>
            <div className="flex gap-3">
              <button onClick={() => setOverlay(null)} className="flex-1 py-3 rounded-xl border-2 font-bold text-sm" style={{ borderColor: ACCENT, color: ACCENT }}>No</button>
              <button onClick={handleKonfirmasiYes} className="flex-1 py-3 rounded-xl font-bold text-sm" style={{ backgroundColor: ACCENT, color: "#000" }}>Yes</button>
            </div>
          </div>
        </div>
      )}

      {/* Sukses */}
      {overlay === "sukses-edit" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOverlay(null)} />
          <div className="relative w-[420px] rounded-2xl border border-white/10 shadow-2xl px-8 py-8 z-10" style={{ backgroundColor: "#1E2235" }}>
            <SuccessIcon />
            <h3 className="text-white font-bold text-lg mb-2">Stok Berhasil Diperbarui</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-7">Jumlah stok bahan baku telah berhasil diperbarui dalam sistem.</p>
            <button onClick={() => setOverlay(null)} className="w-full py-3 rounded-xl font-bold text-sm" style={{ backgroundColor: ACCENT, color: "#000" }}>Oke</button>
          </div>
        </div>
      )}
    </div>
  );
}

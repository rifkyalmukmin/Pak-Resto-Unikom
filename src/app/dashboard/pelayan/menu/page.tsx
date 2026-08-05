"use client";

import { useState, useRef } from "react";
import { Plus, Pencil, Trash2, X, Check, ChevronDown, XCircle } from "lucide-react";

type Category = "Semua" | "Makanan" | "Minuman" | "Dessert";
type MenuStatus = "Tersedia" | "Habis";
type ModalMode = "tambah" | "edit" | null;
type OverlayType = "konfirmasi-simpan" | "sukses-tambah" | "sukses-edit" | "konfirmasi-hapus" | "sukses-hapus" | null;

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: Exclude<Category, "Semua">;
  status: MenuStatus;
  image: string;
}

const categories: Category[] = ["Semua", "Makanan", "Minuman", "Dessert"];
const categoryOptions: Exclude<Category, "Semua">[] = ["Makanan", "Minuman", "Dessert"];

const initialMenu: MenuItem[] = [
  { id: 1, name: "Nasi Goreng Kambing",   description: "Spesial bumbu rempah UNIKOM",             price: 45000,  category: "Makanan",  status: "Tersedia", image: "/images/menu/nasi-goreng.png" },
  { id: 2, name: "Matcha Creamy Latte",   description: "Premium Uji Matcha Grade",                 price: 29000,  category: "Minuman",  status: "Tersedia", image: "/images/menu/iced-cappucino.png" },
  { id: 3, name: "Wagyu MB7 Steak",       description: "Truffle Mashed Potato Side",               price: 185000, category: "Makanan",  status: "Habis",    image: "/images/menu/rendang-sapi.png" },
  { id: 4, name: "Classic Tiramisu",      description: "Authentic Italian Recipe",                  price: 35000,  category: "Dessert",  status: "Tersedia", image: "/images/menu/chocolate-lava.png" },
  { id: 5, name: "Salmon Poke Bowl",      description: "Fresh Norwegian Salmon",                    price: 65000,  category: "Makanan",  status: "Tersedia", image: "/images/menu/caesar-salad.png" },
  { id: 6, name: "Lychee Mojito",         description: "Cold Pressed Fresh Lime",                   price: 32000,  category: "Minuman",  status: "Tersedia", image: "/images/menu/lychee-tea.png" },
  { id: 7, name: "Sate Maranggi",         description: "Authentic Purwakarta Beef",                 price: 52000,  category: "Makanan",  status: "Habis",    image: "/images/menu/mix-dim-sum.png" },
  { id: 8, name: "Jus Alpukat Spesial",   description: "Drip Chocolate Garnish",                   price: 22000,  category: "Minuman",  status: "Tersedia", image: "/images/menu/ayam-goreng.png" },
];

const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID").replace(/,/g, ".");

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className="relative w-10 h-[22px] rounded-full transition-colors shrink-0 overflow-hidden"
    style={{ backgroundColor: checked ? "#10B981" : "#374151" }}
  >
    <span
      className="absolute top-[3px] w-4 h-4 bg-white rounded-full shadow"
      style={{ left: checked ? "21px" : "3px", transition: "left 0.2s ease" }}
    />
  </button>
);

const InfoIcon = () => (
  <div className="w-11 h-11 rounded-full flex items-center justify-center border-2 mb-5"
    style={{ borderColor: "#10B981", backgroundColor: "#10B98118" }}>
    <span className="text-[#10B981] font-bold text-lg leading-none select-none">i</span>
  </div>
);
const SuccessIcon = () => (
  <div className="w-11 h-11 rounded-full flex items-center justify-center border-2 mb-5"
    style={{ borderColor: "#10B981", backgroundColor: "#10B98118" }}>
    <Check size={22} color="#10B981" strokeWidth={3} />
  </div>
);

export default function KatalogMenuPage() {
  const [menuList, setMenuList]       = useState<MenuItem[]>(initialMenu);
  const [activeCategory, setActiveCategory] = useState<Category>("Semua");
  const [modalMode, setModalMode]     = useState<ModalMode>(null);
  const [editTarget, setEditTarget]   = useState<MenuItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [overlay, setOverlay]         = useState<OverlayType>(null);

  // Form state
  const [nameInput, setNameInput]       = useState("");
  const [descInput, setDescInput]       = useState("");
  const [priceInput, setPriceInput]     = useState("");
  const [catInput, setCatInput]         = useState<Exclude<Category, "Semua">>("Makanan");
  const [statusInput, setStatusInput]   = useState<MenuStatus>("Tersedia");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [catOpen, setCatOpen]           = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = menuList.filter((m) =>
    activeCategory === "Semua" || m.category === activeCategory
  );

  function openTambah() {
    setNameInput(""); setDescInput(""); setPriceInput("");
    setCatInput("Makanan"); setStatusInput("Tersedia"); setImagePreview(null);
    setModalMode("tambah");
  }
  function openEdit(item: MenuItem) {
    setEditTarget(item);
    setNameInput(item.name); setDescInput(item.description);
    setPriceInput(String(item.price)); setCatInput(item.category);
    setStatusInput(item.status); setImagePreview(item.image);
    setModalMode("edit");
  }
  function closeModal() { setModalMode(null); setEditTarget(null); setOverlay(null); }

  function handleSimpanClick() {
    if (!nameInput.trim() || !priceInput) return;
    setOverlay("konfirmasi-simpan");
  }
  function handleKonfirmasiYes() {
    const price = parseInt(priceInput.replace(/\D/g, ""), 10) || 0;
    const image = imagePreview ?? editTarget?.image ?? "/images/menu/nasi-goreng.png";
    if (modalMode === "tambah") {
      const newId = Math.max(...menuList.map((m) => m.id)) + 1;
      setMenuList((p) => [...p, { id: newId, name: nameInput.trim(), description: descInput.trim(), price, category: catInput, status: statusInput, image }]);
      setOverlay("sukses-tambah");
    } else if (modalMode === "edit" && editTarget) {
      setMenuList((p) => p.map((m) => m.id === editTarget.id
        ? { ...m, name: nameInput.trim(), description: descInput.trim(), price, category: catInput, status: statusInput, image }
        : m
      ));
      setOverlay("sukses-edit");
    }
    setModalMode(null);
  }
  function handleDeleteClick(id: number) { setDeleteTarget(id); setOverlay("konfirmasi-hapus"); }
  function handleKonfirmasiHapusYes() {
    if (deleteTarget !== null) setMenuList((p) => p.filter((m) => m.id !== deleteTarget));
    setDeleteTarget(null); setOverlay("sukses-hapus");
  }
  function toggleStatus(id: number) {
    setMenuList((p) => p.map((m) => m.id === id
      ? { ...m, status: m.status === "Tersedia" ? "Habis" : "Tersedia" }
      : m
    ));
  }
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 p-6 space-y-5">

        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Katalog Menu</h1>
            <p className="text-slate-400 text-sm mt-1.5 max-w-lg leading-relaxed">
              Manajemen ketersediaan hidangan secara real-time.
            </p>
          </div>
          <button
            onClick={openTambah}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 shrink-0 ml-6"
            style={{ backgroundColor: "#10B981", color: "#000" }}
          >
            <Plus size={15} strokeWidth={3} />
            Tambah Menu
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors"
              style={activeCategory === cat
                ? { backgroundColor: "#10B981", color: "#000" }
                : { backgroundColor: "#1E293B", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.07)" }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu grid */}
        <div className="grid grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="rounded-xl overflow-hidden flex flex-col border" style={{ backgroundColor: "#1E293B", borderColor: "#3C4A42" }}>
              {/* Image area */}
              <div className="relative w-full aspect-[4/3] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                {/* Price badge */}
                <span className="absolute top-2 left-2 text-[11px] font-bold px-3 py-1 rounded-full" style={{ backgroundColor: "#0B1326", color: "#4EDEA3" }}>
                  {fmt(item.price)}
                </span>
                {/* Edit + delete icons */}
                <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                  <button
                    onClick={() => openEdit(item)}
                    className="w-7 h-7 rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: "#0B132680", backdropFilter: "blur(4px)" }}
                  >
                    <Pencil size={11} style={{ color: "#4EDEA3" }} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item.id)}
                    className="w-7 h-7 rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: "#0B132680", backdropFilter: "blur(4px)" }}
                  >
                    <Trash2 size={11} style={{ color: "#ef4444" }} />
                  </button>
                </div>
                {/* HABIS badge */}
                {item.status === "Habis" && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xs font-bold px-3 py-1 rounded-full border border-red-400/60" style={{ backgroundColor: "#ef444480" }}>
                      HABIS
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3 flex flex-col gap-2 flex-1">
                <div>
                  <p className="text-white text-sm font-bold leading-tight line-clamp-1">{item.name}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">{item.description}</p>
                </div>
                {/* Status toggle */}
                <div className="flex items-center justify-between mt-auto py-2 border-t" style={{ borderColor: "#3C4A42" }}>
                  <div className="flex items-center gap-1.5">
                    {item.status === "Tersedia" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src="/images/pelayan/konten/ceklis.png" alt="" width={13} height={13} />
                    ) : (
                      <XCircle size={13} style={{ color: "#FFB4AB" }} strokeWidth={2} />
                    )}
                    <span className="text-xs font-semibold" style={{ color: item.status === "Tersedia" ? "#4EDEA3" : "#FFB4AB" }}>
                      {item.status === "Tersedia" ? "Tersedia" : "Habis"}
                    </span>
                  </div>
                  <Toggle checked={item.status === "Tersedia"} onChange={() => toggleStatus(item.id)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modal Tambah / Edit ───────────────────── */}
      {modalMode !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-[620px] rounded-2xl overflow-hidden border shadow-2xl z-10 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none", borderColor: "#3C4A42" }}>
            {/* Header */}
            <div className="px-7 pt-6 pb-5 border-b flex items-start justify-between sticky top-0" style={{ backgroundColor: "#222A3D", borderColor: "#3C4A42" }}>
              <div>
                <h2 className="font-bold text-xl text-white">
                  {modalMode === "tambah" ? "Tambah Menu Baru" : "Edit Menu"}
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  {modalMode === "tambah"
                    ? "Tambahkan hidangan baru ke dalam katalog menu."
                    : "Perbarui informasi hidangan yang ada."}
                </p>
              </div>
              <button onClick={closeModal} className="text-slate-500 hover:text-white transition-colors p-1 mt-0.5">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-7 py-6 space-y-5" style={{ backgroundColor: "#222A3D" }}>
              {/* Row 1: Nama + Kategori */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-xs font-bold uppercase tracking-wider block mb-2">Nama Menu</label>
                  <input
                    type="text" value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Ayam Goreng Penyet"
                    className="w-full rounded-xl border px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none transition-colors"
                    style={{ backgroundColor: "#060E20", borderColor: "#3C4A42" }}
                  />
                </div>
                <div>
                  <label className="text-white text-xs font-bold uppercase tracking-wider block mb-2">Kategori</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setCatOpen((p) => !p)}
                      className="w-full flex items-center justify-between rounded-xl border px-4 py-3 text-sm text-white hover:border-white/20 transition-colors"
                      style={{ backgroundColor: "#060E20", borderColor: "#3C4A42" }}
                    >
                      <span className="font-medium">{catInput}</span>
                      <ChevronDown size={14} className={`text-slate-400 transition-transform ${catOpen ? "rotate-180" : ""}`} />
                    </button>

                    {catOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1 rounded-xl border overflow-hidden z-50 shadow-xl" style={{ backgroundColor: "#0D1625", borderColor: "#3C4A42" }}>
                        {categoryOptions.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => { setCatInput(c); setCatOpen(false); }}
                            className="w-full flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-white/5"
                            style={{ color: catInput === c ? "#4EDEA3" : "#94a3b8" }}
                          >
                            <span className="font-medium">{c}</span>
                            {catInput === c && <Check size={13} style={{ color: "#4EDEA3" }} strokeWidth={3} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 2: Harga + Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-xs font-bold uppercase tracking-wider block mb-2">Harga</label>
                  <div className="flex items-center rounded-xl border overflow-hidden" style={{ backgroundColor: "#060E20", borderColor: "#3C4A42" }}>
                    <span className="px-3 text-sm font-semibold" style={{ color: "#4EDEA3" }}>Rp</span>
                    <input
                      type="text" inputMode="numeric"
                      value={priceInput}
                      onChange={(e) => setPriceInput(e.target.value.replace(/\D/g, ""))}
                      placeholder="25.000"
                      className="flex-1 bg-transparent text-sm px-3 py-3 focus:outline-none text-white placeholder-slate-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-white text-xs font-bold uppercase tracking-wider block mb-2">Status Menu</label>
                  <div className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ backgroundColor: "#060E20", borderColor: "#3C4A42" }}>
                    <span className="text-sm flex-1" style={{ color: statusInput === "Tersedia" ? "#10B981" : "#94a3b8" }}>
                      {statusInput}
                    </span>
                    <Toggle checked={statusInput === "Tersedia"} onChange={() => setStatusInput((p) => p === "Tersedia" ? "Habis" : "Tersedia")} />
                  </div>
                </div>
              </div>

              {/* Foto Menu */}
              <div>
                <label className="text-white text-xs font-bold uppercase tracking-wider block mb-2">Foto Menu</label>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full rounded-xl border border-dashed hover:opacity-80 transition-opacity overflow-hidden"
                  style={{ borderColor: "#4EDEA360", backgroundColor: "#060E20" }}
                >
                  {imagePreview ? (
                    <div className="h-36 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs font-semibold">Klik untuk ganti foto</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-36 flex flex-col items-center justify-center gap-2">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#BBCABF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                        <circle cx="12" cy="13" r="3"/>
                        <line x1="18" y1="5" x2="18" y2="9"/>
                        <line x1="16" y1="7" x2="20" y2="7"/>
                      </svg>
                      <p className="text-slate-500 text-xs">Ketuk untuk unggah foto (JPG, PNG)</p>
                    </div>
                  )}
                </button>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="text-white text-xs font-bold uppercase tracking-wider block mb-2">Deskripsi</label>
                <textarea
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  rows={3}
                  placeholder="Jelaskan detail menu, bahan utama, atau info alergi..."
                  className="w-full rounded-xl border px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none transition-colors resize-none"
                  style={{ backgroundColor: "#060E20", borderColor: "#3C4A42" }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-7 py-5 flex items-center justify-end gap-3 border-t" style={{ backgroundColor: "#222A3D", borderColor: "#3C4A42" }}>
              <button onClick={closeModal} className="px-5 py-2.5 rounded-xl border border-white/10 text-white text-sm font-semibold hover:bg-white/5 transition-colors">
                Batal
              </button>
              <button
                onClick={handleSimpanClick}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#10B981", color: "#000" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/pelayan/meja/simpan-perubahan.png" alt="" width={14} height={14} style={{ filter: "brightness(0)" }} />
                {modalMode === "tambah" ? "Simpan Menu" : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Konfirmasi Simpan */}
      {overlay === "konfirmasi-simpan" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-[420px] rounded-2xl border border-white/10 shadow-2xl px-8 py-8 z-10" style={{ backgroundColor: "#1E2235" }}>
            <InfoIcon />
            <h3 className="text-white font-bold text-lg mb-2">Konfirmasi Perubahan</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-7">Apakah anda yakin dengan data menu yang akan disimpan?</p>
            <div className="flex gap-3">
              <button onClick={() => setOverlay(null)} className="flex-1 py-3 rounded-xl border-2 font-bold text-sm" style={{ borderColor: "#10B981", color: "#10B981" }}>Batal</button>
              <button onClick={handleKonfirmasiYes} className="flex-1 py-3 rounded-xl font-bold text-sm" style={{ backgroundColor: "#10B981", color: "#000" }}>Ya, Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Konfirmasi Hapus */}
      {overlay === "konfirmasi-hapus" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-[420px] rounded-2xl border border-white/10 shadow-2xl px-8 py-8 z-10" style={{ backgroundColor: "#1E2235" }}>
            <InfoIcon />
            <h3 className="text-white font-bold text-lg mb-2">Konfirmasi Hapus Menu</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-7">Apakah anda yakin ingin menghapus menu ini dari katalog?</p>
            <div className="flex gap-3">
              <button onClick={() => { setOverlay(null); setDeleteTarget(null); }} className="flex-1 py-3 rounded-xl border-2 font-bold text-sm" style={{ borderColor: "#10B981", color: "#10B981" }}>No</button>
              <button onClick={handleKonfirmasiHapusYes} className="flex-1 py-3 rounded-xl font-bold text-sm" style={{ backgroundColor: "#10B981", color: "#000" }}>Yes</button>
            </div>
          </div>
        </div>
      )}

      {/* Sukses Tambah */}
      {overlay === "sukses-tambah" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOverlay(null)} />
          <div className="relative w-[420px] rounded-2xl border border-white/10 shadow-2xl px-8 py-8 z-10" style={{ backgroundColor: "#1E2235" }}>
            <SuccessIcon />
            <h3 className="text-white font-bold text-lg mb-2">Menu Berhasil Ditambahkan</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-7">Menu baru telah berhasil ditambahkan ke dalam katalog.</p>
            <button onClick={() => setOverlay(null)} className="w-full py-3 rounded-xl font-bold text-sm" style={{ backgroundColor: "#10B981", color: "#000" }}>Oke</button>
          </div>
        </div>
      )}

      {/* Sukses Edit */}
      {overlay === "sukses-edit" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOverlay(null)} />
          <div className="relative w-[420px] rounded-2xl border border-white/10 shadow-2xl px-8 py-8 z-10" style={{ backgroundColor: "#1E2235" }}>
            <SuccessIcon />
            <h3 className="text-white font-bold text-lg mb-2">Menu Berhasil Diperbarui</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-7">Informasi menu telah berhasil diperbarui dalam katalog.</p>
            <button onClick={() => setOverlay(null)} className="w-full py-3 rounded-xl font-bold text-sm" style={{ backgroundColor: "#10B981", color: "#000" }}>Oke</button>
          </div>
        </div>
      )}

      {/* Sukses Hapus */}
      {overlay === "sukses-hapus" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOverlay(null)} />
          <div className="relative w-[420px] rounded-2xl border border-white/10 shadow-2xl px-8 py-8 z-10" style={{ backgroundColor: "#1E2235" }}>
            <SuccessIcon />
            <h3 className="text-white font-bold text-lg mb-2">Menu Berhasil Dihapus</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-7">Menu telah berhasil dihapus dari katalog.</p>
            <button onClick={() => setOverlay(null)} className="w-full py-3 rounded-xl font-bold text-sm" style={{ backgroundColor: "#10B981", color: "#000" }}>Oke</button>
          </div>
        </div>
      )}
    </div>
  );
}

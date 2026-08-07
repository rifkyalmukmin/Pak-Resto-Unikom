# Pak Resto Unikom

Sistem manajemen restoran digital untuk lingkungan **Universitas Komputer Indonesia (UNIKOM)**. Aplikasi monolit Next.js (frontend + API Routes) untuk operasional staff: pelayan, koki, kasir, dan manajer.

## Fitur

| Role | Fitur utama |
|------|-------------|
| **Pelayan** | Buat pesanan dine-in, antar pesanan (`SIAP` → `DIANTAR` → `SELESAI`), lihat meja, kelola stok bahan baku |
| **Koki (CHEF)** | Antrean pesanan aktif (`MENUNGGU` → `DIPROSES` → `SIAP`), update inventaris stok |
| **Kasir** | Konfirmasi pembayaran, pesanan take-away |
| **Manajer** | CRUD menu & kategori, CRUD user staff, laporan pendapatan |

**Alur pesanan:** `MENUNGGU` → `DIPROSES` → `SIAP` → `DIANTAR` → `SELESAI` (+ pembayaran `LUNAS`)

> Beberapa halaman masih mock (riwayat koki, laporan transaksi kasir, trend-analysis, portal `/pesan` pelanggan).

## Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS |
| Backend | Next.js Route Handlers (`/api/*`) |
| ORM / DB | Prisma + PostgreSQL (Supabase) |
| Auth | NextAuth.js v5 — Credentials (username/password + bcrypt), JWT session |
| Validasi | Zod |
| Icons | Lucide React |
| API testing | Postman (`postman/Pak-Resto-API.postman_collection.json`) |

## Struktur Project

```
pak-resto-unikom/
├── prisma/
│   ├── schema.prisma          # 9 model ERD (user, meja, kategori, menu, …)
│   └── seed.ts                # User per role, menu, meja, bahan baku
├── postman/
│   └── Pak-Resto-API.postman_collection.json
├── public/                    # Aset gambar
├── src/
│   ├── app/
│   │   ├── api/               # orders, payments, menu, kategori, bahan-baku,
│   │   │                      # users, tables, reports
│   │   ├── dashboard/         # pelayan | koki | kasir | manager
│   │   ├── login/
│   │   └── pesan/             # Portal pelanggan (masih mock data)
│   ├── components/
│   ├── lib/                   # api.ts, prisma, api-auth, helpers
│   ├── types/
│   ├── auth.ts
│   └── middleware.ts          # Proteksi /dashboard/* by role
├── .env.example
└── package.json
```

## Instalasi & Setup

### Prasyarat

- Node.js >= 18.18 (disarankan v20+)
- npm >= 9
- Database PostgreSQL ([Supabase](https://supabase.com) direkomendasikan)

### Langkah

1. **Clone & install**

   ```bash
   git clone https://github.com/rifkyalmukmin/Pak-Resto-Unikom.git
   cd Pak-Resto-Unikom
   npm install
   ```

2. **Environment**

   ```bash
   cp .env.example .env
   ```

   Isi `.env` (lihat [`.env.example`](.env.example)):

   ```env
   # Pakai Connection Pooling Supabase (bukan db.*.supabase.co:5432 langsung)
   DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

   AUTH_SECRET="hasil: openssl rand -base64 32"
   AUTH_URL="http://localhost:3000"

   NEXT_PUBLIC_APP_NAME="Pak Resto Unikom"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

   > **Jangan commit `.env`.** File ini sudah di `.gitignore`. Hanya `.env.example` yang di-push.

3. **Database**

   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

   Jika shell punya `DATABASE_URL` lama (mis. localhost), unset dulu:

   ```bash
   unset DATABASE_URL DIRECT_URL
   ```

4. **Jalankan**

   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000) → login di `/login`.

## Akun Seed

Semua password: **`password123`**

| Username | Role |
|----------|------|
| `pelayan` | PELAYAN |
| `chef` | CHEF |
| `kasir` | KASIR |
| `manajer` | MANAJER |

## API Overview

Semua endpoint staff memerlukan session login (cookie NextAuth), kecuali handler auth.

| Domain | Method | Path |
|--------|--------|------|
| Orders | GET, POST | `/api/orders` |
| Orders | GET, PATCH | `/api/orders/[id]` |
| Payments | GET, POST | `/api/payments` |
| Menu | GET, POST | `/api/menu` (`?all=true` untuk manajer) |
| Menu | GET, PATCH, DELETE | `/api/menu/[id]` |
| Kategori | GET, POST | `/api/kategori` |
| Kategori | PATCH, DELETE | `/api/kategori/[id]` |
| Bahan baku | GET, POST | `/api/bahan-baku` |
| Bahan baku | PATCH, DELETE | `/api/bahan-baku/[id]` |
| Users | GET, POST | `/api/users` |
| Users | GET, PATCH, DELETE | `/api/users/[id]` |
| Tables | GET | `/api/tables` |
| Laporan | GET | `/api/reports/pendapatan` |

Import koleksi Postman dari folder `postman/` untuk uji cepat (mulai dari request Login).

## Database (ERD)

Model Prisma (nama Indonesia):

`user` · `meja` · `kategori` · `menu` · `bahan_baku` · `menu_bahan` · `pesanan` · `detail_pesanan` · `pembayaran`

Role: `PELAYAN` | `CHEF` | `KASIR` | `MANAJER`

Detail: [`prisma/schema.prisma`](prisma/schema.prisma)

## Scripts

| Script | Deskripsi |
|--------|-----------|
| `npm run dev` | Development server |
| `npm run build` / `start` | Production |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Sync schema ke DB |
| `npm run db:seed` | Seed data contoh |
| `npm run db:studio` | Prisma Studio |
| `npm run format` | Prettier |

## Autentikasi

- **Credentials only** — username + password (bcrypt)
- Session **JWT** (tanpa tabel Account/Session OAuth)
- Middleware membatasi `/dashboard/pelayan|koki|kasir|manager` sesuai role

## Deployment

1. Push ke GitHub, import ke [Vercel](https://vercel.com)
2. Set env di Vercel: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_URL`
3. Deploy; jalankan `db:push` (+ `db:seed` jika perlu) terhadap DB production

## Catatan untuk kolaborator

1. Clone → `npm install` → copy `.env.example` → isi sendiri
2. Setup DB sendiri **atau** minta connection string dari pemilik project
3. `db:push` + `db:seed` sebelum `npm run dev`
4. Jangan push `.env`

## Lisensi

MIT — bebas digunakan dan dimodifikasi untuk keperluan akademik.

---

Dibuat untuk **Universitas Komputer Indonesia (UNIKOM)**.

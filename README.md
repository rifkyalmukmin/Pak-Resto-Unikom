# 🍽️ Pak Resto Unikom

Aplikasi sistem restoran digital yang dikembangkan untuk lingkungan **Universitas Komputer Indonesia (Unikom)**. Proyek ini menyediakan solusi digital dalam pengelolaan restoran, mulai dari pemesanan online, manajemen menu, reservasi meja, hingga layanan pelanggan.

## ✨ Fitur Utama

- 🛒 **Pemesanan Digital** — Sistem pemesanan online yang cepat dan praktis
- 📋 **Manajemen Menu** — Kelola menu dengan kategori terorganisir & update real-time
- 🪑 **Reservasi Meja** — Reservasi meja makan untuk menghindari antrean
- 👥 **Autentikasi** — Login dengan Email/Password, GitHub, & Google (NextAuth.js)
- 📊 **Dashboard Admin** — Manajemen menu, pesanan, dan laporan (coming soon)
- ⭐ **Rating & Feedback** — Sistem penilaian layanan pelanggan (coming soon)
- 🎓 **Integrasi Kampus Unikom** — Dirancang khusus untuk ekosistem kampus

## 🛠️ Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling** | TailwindCSS, Shadcn/ui, Radix UI |
| **Backend** | Next.js API Routes (Route Handlers) |
| **ORM** | Prisma ORM |
| **Database** | PostgreSQL (Supabase) |
| **Auth** | NextAuth.js v5 (Auth.js) — GitHub, Google, Credentials |
| **Data Fetching** | TanStack Query (React Query) |
| **Validasi** | Zod |
| **Icons** | Lucide React |
| **Deploy** | Vercel (frontend) + Supabase (database) |
| **Package Manager** | npm |

## 📁 Struktur Project

```
pak-resto-unikom/
├── prisma/
│   ├── schema.prisma        # Skema database (PostgreSQL)
│   └── seed.ts              # Data seed (kategori, menu, meja, admin)
├── public/                  # Aset statis
├── src/
│   ├── app/                 # App Router (Next.js 15)
│   │   ├── api/             # API Routes
│   │   │   ├── auth/[...nextauth]/  # NextAuth handler
│   │   │   ├── menu/        # API menu
│   │   │   └── orders/      # API pesanan
│   │   ├── login/           # Halaman login
│   │   ├── menu/            # Halaman menu
│   │   ├── order/           # Halaman pemesanan
│   │   ├── globals.css      # (di styles/)
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   ├── loading.tsx      # Loading UI
│   │   ├── not-found.tsx    # 404 page
│   │   └── providers.tsx   # Client providers (React Query)
│   ├── components/
│   │   ├── ui/              # Komponen Shadcn/ui (button, card, dll)
│   │   └── layout/          # Header & Footer
│   ├── lib/
│   │   ├── prisma.ts        # Prisma client singleton
│   │   └── utils.ts         # Utility functions (cn, formatCurrency, dll)
│   ├── types/               # Type declarations
│   ├── hooks/              # Custom React hooks
│   ├── server/              # Server utilities
│   ├── styles/
│   │   └── globals.css      # Global CSS + tema Shadcn
│   ├── auth.ts              # Konfigurasi NextAuth.js v5
│   └── middleware.ts        # Middleware proteksi route
├── .env.example             # Template environment variables
├── components.json          # Konfigurasi Shadcn/ui CLI
├── tailwind.config.ts       # Konfigurasi TailwindCSS
├── tsconfig.json            # Konfigurasi TypeScript
├── next.config.mjs          # Konfigurasi Next.js
└── package.json            # Dependensi & scripts
```

## 🚀 Instalasi & Setup

### Prasyarat

- **Node.js** >= 18.18.0 (direkomendasikan v20+)
- **npm** >= 9.0.0
- **PostgreSQL** database (rekomendasi: [Supabase](https://supabase.com))

### Langkah Instalasi

1. **Clone repository**

   ```bash
   git clone https://github.com/rifkyalmukmin/Pak-Resto-Unikom.git
   cd Pak-Resto-Unikom
   ```

2. **Install dependensi**

   ```bash
   npm install
   ```

3. **Setup environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit file `.env` dan isi dengan kredensial Anda:

   ```env
   # Database (Supabase PostgreSQL)
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
   DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

   # NextAuth.js
   AUTH_SECRET="generate-with: openssl rand -base64 32"
   AUTH_URL="http://localhost:3000"

   # OAuth Providers (opsional)
   AUTH_GITHUB_ID=""
   AUTH_GITHUB_SECRET=""
   AUTH_GOOGLE_ID=""
   AUTH_GOOGLE_SECRET=""
   ```

4. **Generate AUTH_SECRET**

   ```bash
   openssl rand -base64 32
   ```

5. **Setup database dengan Prisma**

   ```bash
   # Generate Prisma Client
   npm run db:generate

   # Push schema ke database
   npm run db:push

   # (Opsional) Buat migrasi
   npm run db:migrate

   # Seed data contoh
   npm run db:seed
   ```

6. **Jalankan development server**

   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📜 Scripts Tersedia

| Script | Deskripsi |
|--------|-----------|
| `npm run dev` | Jalankan development server |
| `npm run build` | Build untuk production |
| `npm run start` | Jalankan production server |
| `npm run lint` | Cek ESLint |
| `npm run type-check` | Cek TypeScript |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema ke database |
| `npm run db:migrate` | Buat migrasi database |
| `npm run db:studio` | Buka Prisma Studio (GUI database) |
| `npm run db:seed` | Isi database dengan data contoh |
| `npm run format` | Format kode dengan Prettier |

## 🗄️ Skema Database

Database terdiri dari model berikut:

- **User** — Pengguna (Admin, Staff, Customer)
- **Account & Session** — Autentikasi NextAuth
- **Category** — Kategori menu (Makanan, Minuman, Snack)
- **MenuItem** — Item menu restoran
- **RestaurantTable** — Meja restoran
- **Order** — Pesanan
- **OrderItem** — Detail item dalam pesanan

Lihat skema lengkap di [`prisma/schema.prisma`](prisma/schema.prisma).

## 🔐 Autentikasi

Project menggunakan **NextAuth.js v5 (Auth.js)** dengan strategi:

- **JWT Session** — stateless, cocok untuk serverless (Vercel)
- **Prisma Adapter** — menyimpan user, account, & session di database
- **Provider**:
  - Credentials (Email/Password)
  - GitHub OAuth
  - Google OAuth
- **Role-based access** — Admin, Staff, Customer
- **Middleware** — proteksi route `/dashboard`, `/admin`, `/account`

## 🌐 Deployment

### Frontend → Vercel

1. Push project ke GitHub
2. Import repository di [Vercel](https://vercel.com)
3. Set environment variables di Vercel Dashboard
4. Deploy

### Database → Supabase

1. Buat project baru di [Supabase](https://supabase.com)
2. Ambil connection string PostgreSQL
3. Set `DATABASE_URL` & `DIRECT_URL` di environment variables
4. Jalankan `npm run db:push` untuk setup schema

## 🤝 Kontribusi

Silakan buka issue atau pull request untuk berkontribusi.

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/nama-fitur`)
3. Commit perubahan (`git commit -m 'feat: tambahkan fitur X'`)
4. Push ke branch (`git push origin feature/nama-fitur`)
5. Buka Pull Request

## 📝 Lisensi

MIT License — bebas digunakan dan dimodifikasi.

---

Dibuat dengan ❤️ untuk **Universitas Komputer Indonesia (Unikom)**.

# 🔍 AUDIT MENYELURUH — Pak Resto Unikom

> **Tanggal Audit:** 2026-08-03  
> **Auditor:** Senior Software Architect / Full Stack Engineer / Security Engineer / DevOps / Tech Lead (15+ tahun pengalaman)  
> **Scope:** Full-stack audit — Arsitektur, Kode, Frontend, Backend, Database, Security, Performance, DevOps, Testing, Dokumentasi, UX, Maintainability, Scalability, Technical Debt  
> **Status Project:** Proyek mahasiswa — **BELUM SIAP PRODUKSI**

---

## 1. ARSITEKTUR

### Struktur Folder
```
├── src/app/          → App Router (Next.js 15)
├── src/components/   → UI + Layout (restaurant/ kosong)
├── src/lib/          → Prisma + Utils
├── src/auth.ts       → NextAuth v5
├── src/middleware.ts → Middleware
├── api/              → Route handlers
```

**Masalah Kritis:**
- Tidak ada folder `services/`, `repositories/`, `validators/`, `constants/`, `tests/`.
- `components/restaurant/` kosong — tidak ada komponen domain.
- `hooks/` kosong — tidak ada custom hooks.
- `types/` hanya berisi `next-auth.d.ts`.
- `server/` kosong.

**Separation of Concerns:** **BURUK**. Logika database (`prisma.category.findMany`) langsung di `page.tsx`. Tidak ada service layer. Tidak ada repository pattern. Tidak ada abstraction layer.

**Modularitas:** Rendah. Semua logika bisnis tersebar di route handlers dan page components.

**Clean Architecture:** Tidak diterapkan. Tidak ada layer domain, application, infrastructure, presentation yang jelas.

**Dependency Management:** `package.json` menggunakan versi **beta** (`next-auth` 5.0.0-beta.25, `react` 19.0.0-rc). Ini berisiko tinggi untuk produksi.

**Nilai:** **3 / 10**

---

## 2. CODE QUALITY

### Clean Code & Readability
Kode cukup rapi secara sintaks, tapi:
- Tidak ada JSDoc / komentar penjelasan.
- Nama variabel cukup baik (`formatCurrency`, `customerName`).
- Tidak ada type annotations eksplisit di beberapa fungsi.

### Naming Convention
- `formatCurrency` ✅
- `customerPhone` ✅
- `isAvailable` ✅
- `orderItems` ✅

### Reusability
- `formatCurrency` reusable ✅
- `cn()` reusable ✅
- Komponen `Button`, `Card`, `Badge` reusable ✅
- Tidak ada abstract service atau repository yang reusable �

### Duplicate Code
- `prisma.category.findMany` muncul di `menu/page.tsx` dan `api/menu/route.ts` — **duplikasi query**.
- Struktur `Card` untuk menu item berulang tanpa komponen abstrak.

### SOLID Principles
- **S**ingle Responsibility: ❌ `MenuPage` melakukan query + render + tidak ada error boundary.
- **O**pen/Closed: ❌ Tidak ada interface/abstraction untuk database access.
- **L**iskov: N/A.
- **I**nterface Segregation: ❌ Tidak ada interface.
- **D**ependency Inversion: ❌ `prisma` di-import langsung di page dan API.

### DRY
- Duplikasi query database antara page dan API.
- Tidak ada shared types antara frontend dan backend.

### KISS
- Kode relatif sederhana, tapi over-engineering di beberapa bagian (`force-dynamic` tanpa alasan jelas).

### Error Handling
- `try/catch` ada di API, tapi hanya `console.error` — tidak ada logging service.
- Tidak ada error boundary di React.
- `MenuPage` tidak memiliki `try/catch` — jika `prisma` gagal, halaman akan crash.

### Logging
- Hanya `console.error`. Tidak ada structured logging (Winston, Pino, dll).

**Contoh Kode Buruk:**
```typescript
// src/app/menu/page.tsx
export default async function MenuPage() {
  const categories = await prisma.category.findMany({ ... });
  // Tidak ada error handling, tidak ada loading state, tidak ada empty state
}
```

**Solusi Perbaikan:**
```typescript
export default async function MenuPage() {
  try {
    const categories = await menuService.getCategories();
    if (!categories.length) return <EmptyState message="Tidak ada menu tersedia" />;
    return <MenuList categories={categories} />;
  } catch (e) {
    return <ErrorState error={e} />;
  }
}
```

**Nilai:** **4 / 10**

---

## 3. FRONTEND

### UI / UX
- Desain menggunakan Tailwind + shadcn/ui — terlihat modern.
- Warna `primary` konsisten.
- Layout responsif (`md:`, `lg:` breakpoints).

### Responsiveness
- Header menggunakan `hidden md:flex` ✅
- Grid `sm:grid-cols-2 lg:grid-cols-3` ✅
- Mobile menu (`Menu` icon) ada tapi **tidak berfungsi** — tidak ada `onClick` handler ❌

### Accessibility
- `aria-label` ada di beberapa tombol (`aria-label="Keranjang"`) ✅
- `lang="id"` di HTML ✅
- Tidak ada `aria-expanded`, `aria-controls` untuk mobile menu ❌
- Kontras warna belum diuji secara formal ❌
- Tidak ada `skip-to-content` link ❌

### Loading State
- `loading.tsx` ada ✅
- Tidak digunakan secara konsisten — `MenuPage` tidak menggunakan `Suspense` ❌

### Empty State
- Tidak ada komponen `EmptyState` ❌
- Jika kategori kosong, halaman akan kosong tanpa penjelasan ❌

### Error State
- `not-found.tsx` bagus ✅
- Tidak ada `error.tsx` global ❌
- `MenuPage` tidak menangani error ❌

### Animation
- `hover:shadow-lg` ✅
- `transition-shadow` ✅
- Tidak ada animasi masuk/keluar (framer-motion tidak digunakan) ❌

### Consistency
- Font `Inter` konsisten ✅
- Spacing `container` konsisten ✅
- Tombol `Button` konsisten ✅

### Design System
- Menggunakan shadcn/ui — bagus ✅
- Tidak ada dokumentasi design system ❌
- Tidak ada token warna yang terdokumentasi ❌

**Apakah UI sudah profesional?**
- **Belum sepenuhnya.** Terlihat seperti template shadcn/ui yang dimodifikasi sedikit. Tidak ada branding kuat, tidak ada ilustrasi, foto menu hanya emoji (`🍽️`), tidak ada interaktivitas yang kaya.

**Apa yang membuatnya terlihat seperti project mahasiswa?**
1. Emoji sebagai placeholder gambar menu (`🍽️`) — tidak profesional.
2. Tidak ada foto produk nyata.
3. Tidak ada halaman detail produk.
4. Tidak ada fitur keranjang (cart) yang berfungsi — hanya link kosong (`/cart` tidak ada).
5. Tidak ada sistem reservasi meja yang berfungsi (`/tables` tidak ada).
6. Login hanya tampilan — tidak ada form submission yang berfungsi.
7. Tidak ada dashboard admin.
8. Tidak ada sistem rating/review yang berfungsi.
9. `register` link di header tapi halaman `/register` tidak ada.
10. `about` link tapi halaman `/about` tidak ada.

**Nilai:** **5 / 10**

---

## 4. BACKEND

### API Design
- RESTful endpoint: `/api/menu`, `/api/orders` ✅
- Response format konsisten (`{ success, data, error }`) ✅
- Tidak ada pagination (`take: 50` hardcoded) ❌
- Tidak ada filtering, sorting, searching ❌
- Tidak ada versioning (`/v1/`) ❌

### REST Best Practice
- `GET` untuk membaca ✅
- `POST` untuk membuat ✅
- Tidak ada `PUT`, `PATCH`, `DELETE` ❌
- Status code digunakan (`201`, `400`, `500`) ✅

### Validation
- `POST /api/orders` memiliki validasi manual (`Array.isArray`) ✅
- Tidak menggunakan `zod` untuk validasi input ❌
- Tidak ada validasi `tableId`, `customerPhone` ❌
- Tidak ada sanitasi input ❌

### Middleware
- `middleware.ts` hanya ekspor `auth` — tidak ada rate limiting, CORS, logging ❌
- Tidak ada middleware validasi ❌

### Authentication
- NextAuth v5 beta digunakan ✅
- `Credentials` provider ada tapi **tidak memverifikasi password** (`authorize` hanya mencari user, tidak membandingkan password) ❌ — **BUG KRITIS**
- `GitHub` dan `Google` provider dikonfigurasi tapi `clientId`/`clientSecret` mungkin kosong �
- `session: { strategy: "jwt" }` ✅

### Authorization
- `jwt` callback menyimpan `role` ✅
- Tidak ada middleware yang memeriksa `role` untuk endpoint admin ❌
- `GET /api/orders` tidak memerlukan autentikasi — siapa saja bisa melihat semua pesanan ❌

### Error Response
- Format konsisten ✅
- Pesan error generik (`"Gagal membuat pesanan"`) — tidak informatif ❌

### Security
- Lihat bagian Security.

### Database Query
- `prisma` digunakan langsung — tidak ada query optimization �
- `findMany` tanpa `select` — mengambil semua kolom ❌
- Tidak ada `include` yang selektif ❌

### Performance
- Tidak ada caching ❌
- Tidak ada pagination ❌
- `force-dynamic` di `MenuPage` — mencegah caching statis ❌

**Nilai:** **3 / 10**

---

## 5. DATABASE

### Table Design
- `User`, `Category`, `MenuItem`, `RestaurantTable`, `Order`, `OrderItem` ✅
- `Account`, `Session`, `VerificationToken` (NextAuth) ✅

### Normalization
- `Category` → `MenuItem` (1:N) ✅
- `Order` → `OrderItem` (1:N) ✅
- `MenuItem` → `OrderItem` (1:N) ✅
- Normalisasi cukup baik ✅

### Index
- `@@index([categoryId])` di `MenuItem` ✅
- `@@index([status])`, `@@index([userId])` di `Order` ✅
- Tidak ada index di `customerName`, `customerPhone` ❌
- Tidak ada composite index ❌

### Foreign Key
- Semua relasi menggunakan `@relation` dengan `onDelete: Cascade` ✅
- `tableId` nullable (`String?`) — baik untuk pesanan tanpa meja ✅

### Query Performance
- Tidak ada `select` eksplisit — mengambil semua kolom ❌
- `findMany` tanpa batasan — bisa lambat jika data besar ❌
- Tidak ada `cursor` pagination ❌

### Data Integrity
- `slug` `@unique` ✅
- `email` `@unique` ✅
- `orderNumber` `@unique` ✅
- `number` (meja) `@unique` ✅
- Tidak ada `CHECK` constraint (misalnya `price > 0`) ❌
- `status` menggunakan `String` bukan enum (`AVAILABLE | OCCUPIED | RESERVED`) ❌ — seharusnya enum

**Nilai:** **5 / 10**

---

## 6. SECURITY — URUTAN BAHAYA

### P0 — KRITIS

1. **Authentication Bypass / Password Tidak Diverifikasi** (`src/auth.ts`)
   - `authorize` hanya mencari user berdasarkan email, **tidak membandingkan password**.
   - Siapa saja yang tahu email bisa login sebagai siapa saja.
   - **Dampak:** Total compromise akun.
   - **Perbaikan:** Gunakan `bcrypt.compare` atau `argon2.verify`.

2. **Tidak Ada Rate Limiting** (`src/middleware.ts`, semua API)
   - `POST /api/orders` bisa di-spam tanpa batas.
   - `GET /api/orders` bisa di-DDoS.
   - **Dampak:** Denial of Service, data breach (semua pesanan terbuka).

3. **API `/api/orders` Tidak Memerlukan Autentikasi**
   - Semua pesanan (termasuk data pelanggan: `customerName`, `customerPhone`) bisa diakses siapa saja.
   - **Dampak:** Data breach — PII (Personally Identifiable Information) terbuka.

4. **Secrets Tidak Tervalidasi**
   - `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` tidak dicek apakah ada.
   - `DATABASE_URL` tidak divalidasi.
   - **Dampak:** Aplikasi bisa crash atau berfungsi tidak benar.

### P1 — TINGGI

5. **Tidak Ada Input Sanitization / XSS Protection**
   - `customerName`, `notes`, `description` tidak disanitasi.
   - Jika data ini ditampilkan di frontend tanpa `dangerouslySetInnerHTML`, masih berisiko jika ada komponen yang menggunakan HTML.
   - **Dampak:** Stored XSS.

6. **CSRF Tidak Dilindungi**
   - `POST /api/orders` tidak memiliki CSRF token.
   - Meskipun menggunakan JWT, endpoint ini bisa diserang jika cookie digunakan.
   - **Dampak:** Cross-Site Request Forgery.

7. **SQL Injection Potensial**
   - `prisma` menggunakan parameterized queries — aman dari SQL injection langsung.
   - Tapi `items.map((i) => i.menuItemId)` tidak divalidasi — jika `menuItemId` berisi string berbahaya, `prisma` akan menanganinya, tapi tidak ada validasi format (harus UUID/CUID).

### P2 — MEDIUM

8. **JWT Token Tidak Divalidasi dengan Baik**
   - `jwt` callback mengambil `dbUser` setiap kali — ini bisa lambat.
   - Tidak ada `maxAge` atau `refresh` mechanism.

9. **Tidak Ada HTTPS Enforcement**
   - `next.config.mjs` tidak memiliki `headers` untuk `Strict-Transport-Security`.

10. **Tidak Ada Content Security Policy (CSP)**
    - Tidak ada `Content-Security-Policy` header.

### P3 — RENDAH

11. **Tidak Ada Security Headers** (`X-Frame-Options`, `X-Content-Type-Options`, dll.)
12. **Tidak Ada Audit Logging** — siapa yang membuat pesanan, siapa yang login.

**Nilai:** **2 / 10**

---

## 7. PERFORMANCE

### Rendering
- `MenuPage` menggunakan `force-dynamic` — tidak bisa di-cache statis ❌
- Tidak ada `Suspense` untuk data fetching ❌
- `Header` sticky dengan `backdrop-blur` — bisa mempengaruhi performa scroll ❌ (minor)

### API Response
- `GET /api/menu` mengambil semua kategori + semua item — tidak ada pagination ❌
- `GET /api/orders` mengambil 50 pesanan — bisa lambat jika `include` besar ❌

### Database Query
- Tidak ada `select` — mengambil semua kolom ❌
- Tidak ada `cursor` pagination ❌
- `findMany` tanpa filter — semua data diambil ❌

### Caching
- Tidak ada `revalidate` atau `cache` strategy ❌
- `QueryClient` memiliki `staleTime: 60s` — baik ✅
- Tidak ada Redis atau in-memory cache ❌

### Lazy Loading
- Tidak ada `lazy()` atau `Suspense` untuk komponen berat ❌
- Gambar tidak menggunakan `next/image` dengan `lazy` ❌ (tidak ada gambar sama sekali)

### Bundle Size
- `lucide-react` digunakan — ringan ✅
- `next-auth` beta — mungkin lebih besar dari versi stabil ❌
- Tidak ada `bundle-analyzer` ❌

### Memory Usage
- `QueryClient` dibuat setiap render (`useState`) — sebenarnya hanya sekali, tapi pola ini bisa membingungkan ❌

### Network Request
- Tidak ada `prefetch` atau `preload` ❌
- Tidak ada `service-worker` �

**Nilai:** **3 / 10**

---

## 8. DEVOPS

### Docker
- Tidak ada `Dockerfile` �
- Tidak ada `.dockerignore` ❌

### Docker Compose
- Tidak ada `docker-compose.yml` ❌

### CI/CD
- Tidak ada `.github/workflows/` ❌
- Tidak ada `.gitlab-ci.yml` ❌

### Environment Variable
- `.env` tidak ada di workspace ❌
- `.env.example` disebutkan di README tapi belum diverifikasi ❌
- `process.env` digunakan langsung tanpa validasi ❌

### Build Process
- `npm run build` tersedia ✅
- `npm run lint` tersedia ✅
- `npm run type-check` tersedia ✅
- Tidak ada `npm run test` ❌

### Deployment
- Tidak ada konfigurasi deployment ❌
- Tidak ada `vercel.json` atau konfigurasi platform ❌

### Monitoring
- Tidak ada `Sentry`, `LogRocket`, `Datadog` ❌
- Hanya `console.error` ❌

### Logging
- Tidak ada structured logging ❌
- Tidak ada log rotation ❌

**Nilai:** **1 / 10**

---

## 9. TESTING

### Unit Test
- Tidak ada folder `__tests__` atau `tests/` ❌
- Tidak ada `jest`, `vitest`, `playwright` ❌

### Integration Test
- Tidak ada ❌

### E2E Test
- Tidak ada ❌

### Coverage
- Tidak ada ❌

**Prioritas Perbaikan:**
1. **Unit test untuk `auth.ts`** — verifikasi password, JWT, session.
2. **Unit test untuk `api/orders`** — validasi input, perhitungan total.
3. **Integration test untuk `prisma`** — query database.
4. **E2E test untuk alur pemesanan** — dari menu → keranjang → checkout.

**Nilai:** **0 / 10**

---

## 10. DOKUMENTASI

### README
- `README.md` ada dan cukup lengkap ✅
- Menjelaskan tech stack, struktur folder, langkah instalasi ✅
- Menyebutkan `.env.example` tapi file tersebut belum diverifikasi ❌

### Apakah developer lain bisa langsung menjalankan project?
- **Tidak sepenuhnya.** README menyebutkan `cp .env.example .env` tapi file `.env.example` belum diverifikasi keberadaannya. Tidak ada instruksi untuk menjalankan `db:seed`. Tidak ada penjelasan tentang cara menjalankan test (karena tidak ada).

### Dokumentasi yang Kurang:
- Tidak ada dokumentasi API (Swagger/OpenAPI) ❌
- Tidak ada dokumentasi database (ERD) ❌
- Tidak ada dokumentasi arsitektur ❌
- Tidak ada `CONTRIBUTING.md` ❌
- Tidak ada `CHANGELOG.md` ❌
- Tidak ada dokumentasi deployment ❌

**Nilai:** **4 / 10**

---

## 11. USER EXPERIENCE

### Perjalanan Pengguna (User Journey)
1. **Landing Page (`/`)** — Hero section bagus, fitur dijelaskan, menu populer ditampilkan.
2. **Menu (`/menu`)** — Kategori dan item ditampilkan. Tombol "Tambah" tidak berfungsi (tidak ada keranjang).
3. **Pesan (`/order`)** — Halaman tidak ada ❌
4. **Login (`/login`)** — Form tampilan bagus tapi tidak berfungsi (tidak ada `action`, tidak ada `onSubmit`).
5. **Keranjang (`/cart`)** — Halaman tidak ada ❌
6. **Meja (`/tables`)** — Halaman tidak ada ❌
7. **Tentang (`/about`)** — Halaman tidak ada ❌
8. **Register (`/register`)** — Link ada tapi halaman tidak ada ❌

### Friction Points
- Tombol "Pesan" di menu populer tidak melakukan apa-apa ❌
- Tombol "Tambah" di halaman menu tidak melakukan apa-apa ❌
- Link "Masuk" dan "Daftar" di header tidak berfungsi ❌
- Tidak ada feedback saat pengguna berinteraksi ❌
- Tidak ada notifikasi sukses/gagal ❌
- Tidak ada progress indicator ❌

### Apa yang Membuat Pengguna Bingung?
1. Tombol yang tidak berfungsi — pengguna akan mengira aplikasi rusak.
2. Tidak ada keranjang — pengguna tidak tahu bagaimana menyelesaikan pesanan.
3. Tidak ada halaman pesanan (`/order`) — pengguna tidak bisa memesan.
4. Login tidak berfungsi — pengguna tidak bisa masuk.
5. Tidak ada status pesanan — pengguna tidak tahu apakah pesanan berhasil.

**Nilai:** **2 / 10**

---

## 12. MAINTAINABILITY

Jika project ini memiliki **100.000 user** dan dikerjakan oleh **20 developer**:

### Masalah yang Akan Muncul:
1. **Tidak ada service layer** — 20 developer akan saling menimpa kode di `page.tsx` dan `route.ts`.
2. **Tidak ada testing** — setiap perubahan bisa merusak fitur yang sudah ada.
3. **Tidak ada CI/CD** — deployment manual, risiko human error tinggi.
4. **Tidak ada dokumentasi API** — developer baru akan kesulitan memahami endpoint.
5. **Tidak ada type sharing** — frontend dan backend menggunakan tipe yang berbeda.
6. **Database query langsung di page** — sulit untuk mengubah database tanpa merusak UI.
7. **Tidak ada error monitoring** — bug produksi tidak akan terdeteksi.
8. **Versi beta dependencies** — update bisa merusak aplikasi.

### Apa yang Perlu Di-refactor?
- **Sprint 1:** Tambahkan service layer, repository pattern, dan shared types.
- **Sprint 2:** Tambahkan testing (unit, integration, E2E).
- **Sprint 3:** Tambahkan CI/CD, Docker, monitoring.
- **Sprint 4:** Refactor UI/UX, tambahkan fitur yang hilang.

**Nilai:** **2 / 10**

---

## 13. SCALABILITY

### 10.000 User
- Database query tanpa pagination akan lambat �
- Tidak ada caching — setiap request akan query database ❌
- `force-dynamic` mencegah caching statis ❌
- **Bottleneck:** Database query, tidak ada pagination.

### 100.000 User
- `findMany` tanpa batasan akan mengambil semua data — akan crash ❌
- Tidak ada rate limiting — mudah di-DDoS �
- Tidak ada load balancing ❌
- **Bottleneck:** Database, API, tidak ada horizontal scaling.

### 1 Juta User
- Tidak mungkin dengan arsitektur saat ini ❌
- Perlu microservices, caching layer (Redis), CDN, database sharding ❌
- **Bottleneck:** Semua — arsitektur monolitik tanpa optimasi.

**Nilai:** **1 / 10**

---

## 14. TECHNICAL DEBT

### Bad Practice
- `console.error` sebagai satu-satunya logging ❌
- `force-dynamic` tanpa alasan ❌
- `prisma` di-import langsung di page ❌

### Anti Pattern
- **God Component:** `MenuPage` melakukan query, render, dan tidak ada error handling.
- **Spaghetti Code:** Logika bisnis tersebar di page dan API.
- **Magic Numbers:** `take: 50`, `Math.round(subtotal * 0.11)` — tidak ada konstanta.

### Code Smell
- `key={feature.title}` — menggunakan judul sebagai key, bisa duplikat ❌
- `key={menu.name}` — menggunakan nama sebagai key, bisa duplikat ❌
- `key={item.id}` — baik ✅

### Over Engineering
- `force-dynamic` — over-engineering untuk halaman yang bisa statis.
- `backdrop-blur` di header — mungkin tidak perlu.

### Under Engineering
- Tidak ada service layer ❌
- Tidak ada validation library ❌
- Tidak ada testing ❌
- Tidak ada monitoring ❌

**Nilai:** **2 / 10**

---

## 15. MISSING FEATURE

Urutan berdasarkan dampak terhadap pengguna:

| Prioritas | Fitur | Dampak |
|-----------|-------|--------|
| P0 | **Keranjang (Cart)** — pengguna tidak bisa memesan | Kritis — aplikasi tidak berfungsi |
| P0 | **Halaman Pesanan (`/order`)** — tidak ada | Kritis — aplikasi tidak berfungsi |
| P0 | **Login yang berfungsi** — `authorize` tidak verifikasi password | Kritis — keamanan |
| P1 | **Halaman Detail Menu** — pengguna tidak bisa melihat detail | Tinggi — UX |
| P1 | **Sistem Reservasi Meja (`/tables`)** — tidak ada | Tinggi — fitur utama |
| P1 | **Dashboard Admin** — disebutkan tapi tidak ada | Tinggi — manajemen |
| P2 | **Rating & Feedback** — disebutkan tapi tidak ada | Medium — fitur tambahan |
| P2 | **Halaman Register (`/register`)** — link ada tapi halaman tidak ada | Medium — UX |
| P2 | **Halaman Tentang (`/about`)** — link ada tapi halaman tidak ada | Medium — UX |
| P3 | **Notifikasi / Toast** — tidak ada feedback | Rendah — UX |
| P3 | **Pencarian Menu** — tidak ada | Rendah — UX |
| P3 | **Filter Kategori** — tidak ada | Rendah — UX |

**Nilai:** **2 / 10**

---

## 16. PRIORITAS PERBAIKAN

| Priority | Issue | Impact | Effort | Recommendation |
|----------|-------|--------|--------|---------------|
| **P0** | Authentication bypass (`authorize` tidak verifikasi password) | Kritis — semua akun bisa diakses | Rendah | Tambahkan `bcrypt.compare` di `authorize` |
| **P0** | `GET /api/orders` terbuka tanpa autentikasi | Kritis — data pelanggan terbuka | Rendah | Tambahkan `auth()` middleware di API |
| **P0** | Tidak ada keranjang (`/cart`) dan halaman pesanan (`/order`) | Kritis — aplikasi tidak berfungsi | Tinggi | Buat halaman dan komponen keranjang |
| **P1** | Tidak ada service layer / repository pattern | Tinggi — maintainability buruk | Medium | Buat `services/` dan `repositories/` |
| **P1** | Tidak ada testing | Tinggi — risiko regresi | Tinggi | Tambahkan `jest` + `vitest` |
| **P1** | Tidak ada rate limiting | Tinggi — DDoS | Rendah | Tambahkan `rate-limit` middleware |
| **P2** | `force-dynamic` mencegah caching | Medium — performa buruk | Rendah | Hapus `force-dynamic` jika tidak perlu |
| **P2** | Tidak ada pagination | Medium — performa buruk | Medium | Tambahkan `cursor` pagination |
| **P2** | Tidak ada `zod` validation | Medium — input tidak aman | Rendah | Tambahkan `zod` schema untuk semua input |
| **P3** | Tidak ada Docker / CI/CD | Rendah — deployment manual | Tinggi | Tambahkan `Dockerfile` dan `.github/workflows` |
| **P3** | Tidak ada monitoring | Rendah — bug tidak terdeteksi | Medium | Tambahkan `Sentry` |

**Alasan Prioritas:**
- **P0** dipilih karena dampak langsung terhadap keamanan dan fungsionalitas aplikasi. Tanpa perbaikan ini, aplikasi tidak bisa digunakan atau berbahaya.
- **P1** dipilih karena dampak jangka panjang terhadap maintainability dan kualitas kode.
- **P2** dan **P3** dipilih berdasarkan rasio dampak/usaha — beberapa perbaikan mudah tapi memberikan manfaat besar.

---

## 17. ROADMAP REFACTOR

### Sprint 1 — Keamanan & Fungsionalitas Dasar (Minggu 1-2)
**Target:** Aplikasi aman dan berfungsi dasar.
- [ ] Perbaiki `authorize` di `auth.ts` (verifikasi password dengan `bcrypt`).
- [ ] Tambahkan autentikasi ke `GET /api/orders`.
- [ ] Buat halaman `/cart` dan `/order`.
- [ ] Buat komponen keranjang (`CartItem`, `CartSummary`).
- [ ] Tambahkan `zod` validation untuk semua input API.
- [ ] Tambahkan rate limiting (`rate-limit` package).

### Sprint 2 — Arsitektur & Kualitas Kode (Minggu 3-4)
**Target:** Kode terstruktur dan mudah dipelihara.
- [ ] Buat `services/` (menuService, orderService, authService).
- [ ] Buat `repositories/` (prisma repository abstraction).
- [ ] Buat `types/` shared antara frontend dan backend.
- [ ] Refactor `MenuPage` dan `api/menu/route.ts` menggunakan service layer.
- [ ] Tambahkan `EmptyState`, `ErrorState`, `LoadingState` komponen.
- [ ] Tambahkan `Suspense` untuk data fetching.

### Sprint 3 — Testing & DevOps (Minggu 5-6)
**Target:** Aplikasi teruji dan siap deploy.
- [ ] Tambahkan `jest` + `vitest` untuk unit test.
- [ ] Tulis unit test untuk `auth.ts`, `api/orders`, `services/`.
- [ ] Tambahkan `Dockerfile` dan `docker-compose.yml`.
- [ ] Buat `.github/workflows/ci.yml` (lint, test, build).
- [ ] Tambahkan `.env.example` yang lengkap.
- [ ] Tambahkan `Sentry` untuk error monitoring.

### Sprint 4 — UX & Fitur Lengkap (Minggu 7-8)
**Target:** Aplikasi profesional dan lengkap.
- [ ] Tambahkan foto produk nyata (atau placeholder profesional).
- [ ] Buat halaman detail menu (`/menu/[slug]`).
- [ ] Buat halaman reservasi meja (`/tables`).
- [ ] Buat dashboard admin (`/admin`).
- [ ] Tambahkan sistem rating (`/rating`).
- [ ] Tambahkan notifikasi (`react-hot-toast` atau `sonner`).
- [ ] Optimasi performa (hapus `force-dynamic`, tambahkan pagination).

---

## 18. PENILAIAN

| Aspek | Skor | Keterangan |
|-------|------|------------|
| Architecture | **3 / 10** | Tidak ada separation of concerns, tidak ada service layer |
| Frontend | **5 / 10** | UI modern tapi tidak profesional, banyak fitur tidak berfungsi |
| Backend | **3 / 10** | API dasar ada tapi tidak aman, tidak lengkap |
| Database | **5 / 10** | Schema baik tapi tidak ada constraint, index kurang |
| Security | **2 / 10** | Authentication bypass, data terbuka, tidak ada rate limiting |
| Performance | **3 / 10** | Tidak ada caching, pagination, lazy loading |
| Maintainability | **2 / 10** | Tidak ada testing, CI/CD, dokumentasi API |
| Scalability | **1 / 10** | Tidak siap untuk 10.000+ user |
| Testing | **0 / 10** | Tidak ada test sama sekali |
| Documentation | **4 / 10** | README cukup tapi tidak lengkap |

**Overall Score: 28 / 100**

---

## 19. TOP 10 MASALAH TERBESAR

1. **Authentication Bypass (`authorize` tidak verifikasi password)** — Siapa saja bisa login sebagai siapa saja. **P0**
2. **`GET /api/orders` Terbuka Tanpa Autentikasi** — Data pelanggan (nama, telepon) terbuka untuk umum. **P0**
3. **Tidak Ada Keranjang dan Halaman Pesanan** — Aplikasi tidak bisa digunakan untuk memesan. **P0**
4. **Tidak Ada Service Layer / Repository Pattern** — Kode sulit dipelihara oleh 20 developer. **P1**
5. **Tidak Ada Testing** — Setiap perubahan berisiko merusak fitur yang sudah ada. **P1**
6. **Tidak Ada Rate Limiting** — API mudah di-DDoS dan di-spam. **P1**
7. **Versi Beta Dependencies (`next-auth` beta, `react` RC)** — Risiko crash dan bug tidak terduga. **P1**
8. **`force-dynamic` Mencegah Caching** — Performa buruk, tidak scalable. **P2**
9. **Tidak Ada Docker / CI/CD** — Deployment manual, risiko human error. **P2**
10. **Tidak Ada Monitoring / Logging** — Bug produksi tidak akan terdeteksi. **P3**

---

## 20. ACTION PLAN — CHECKLIST LANGSUNG

### P0 — Critical (Harus Selesai Minggu Ini)
- [ ] Perbaiki `authorize` di `src/auth.ts` — tambahkan `bcrypt.compare`.
- [ ] Tambahkan `auth()` middleware ke `GET /api/orders`.
- [ ] Buat halaman `/cart` dan `/order`.
- [ ] Buat komponen keranjang (`CartItem`, `CartSummary`).
- [ ] Tambahkan `zod` validation untuk semua input API.

### P1 — High (Minggu 2-3)
- [ ] Buat `services/` dan `repositories/`.
- [ ] Refactor `MenuPage` dan `api/menu/route.ts` menggunakan service layer.
- [ ] Tambahkan `jest` + `vitest`.
- [ ] Tulis unit test untuk `auth.ts` dan `api/orders`.
- [ ] Tambahkan `rate-limit` middleware.

### P2 — Medium (Minggu 4-5)
- [ ] Hapus `force-dynamic` jika tidak perlu.
- [ ] Tambahkan pagination (`cursor`) ke `GET /api/menu` dan `GET /api/orders`.
- [ ] Buat `.env.example` lengkap.
- [ ] Tambahkan `EmptyState`, `ErrorState`, `LoadingState` komponen.

### P3 — Low (Minggu 6-8)
- [ ] Tambahkan `Dockerfile` dan `docker-compose.yml`.
- [ ] Buat `.github/workflows/ci.yml`.
- [ ] Tambahkan `Sentry`.
- [ ] Buat halaman detail menu (`/menu/[slug]`).
- [ ] Buat halaman reservasi meja (`/tables`).
- [ ] Buat dashboard admin (`/admin`).
- [ ] Tambahkan foto produk nyata.
- [ ] Tambahkan notifikasi (`react-hot-toast`).

---

## KESIMPULAN

Project **Pak Resto Unikom** adalah proyek mahasiswa yang memiliki **potensi besar** tapi **belum siap produksi**. UI menggunakan teknologi modern (Next.js 15, Tailwind, shadcn/ui) tapi fungsionalitas utama belum lengkap, keamanan sangat lemah, dan arsitektur belum matang.

**Rekomendasi utama:** Fokus pada **P0** (keamanan dan fungsionalitas dasar) sebelum melanjutkan ke fitur tambahan. Tanpa perbaikan P0, aplikasi tidak bisa digunakan dengan aman.

**Skor Akhir: 28 / 100** — Perlu refactor besar sebelum bisa dianggap sebagai aplikasi produksi.

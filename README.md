## E-Arsip

E-Arsip adalah dashboard Next.js untuk mengelola alur surat masuk dan surat keluar secara elektronik. Aplikasi ini menggunakan React Server Components, React Query untuk pengambilan data, serta MSW (Mock Service Worker) sehingga dapat dijalankan tanpa backend selama pengembangan.

### Fitur Utama
- Autentikasi sederhana dengan konteks klien dan middleware Next.js.
- Halaman dashboard, daftar surat masuk, surat keluar, serta laporan dengan filter dinamis.
- Formulir CRUD surat masuk dengan validasi Zod & React Hook Form.
- API client ter-typed menggunakan Zod untuk memastikan integritas data.
- Mock API lengkap melalui MSW beserta data contoh.

## Persiapan & Menjalankan Aplikasi

```bash
npm install
npm run dev
```

Aplikasi akan tersedia di [http://localhost:3000](http://localhost:3000).

### Kredensial Demo
Mock API menyediakan kredensial berikut untuk pengujian cepat:

| Email               | Password     |
| ------------------- | ------------ |
| `admin@example.com` | `password123`|
| `admin@earsip.com`  | `password`   |

Setelah login Anda akan diarahkan ke dashboard utama.

### Variabel Lingkungan

| Variabel | Deskripsi |
| --- | --- |
| `NEXT_PUBLIC_USE_MOCKS` | Set ke `true` (default) untuk menggunakan MSW. Set ke `false` untuk mengarah ke API nyata. |
| `NEXT_PUBLIC_API_BASE_URL` | Basis URL API eksternal ketika MSW dimatikan. |
| `NEXT_PUBLIC_DEFAULT_PAGE_SIZE` | Ukuran halaman default untuk daftar surat. |

> Untuk menjalankan mock secara otomatis pada mode development, proyek harus dijalankan di browser (tidak berlaku untuk SSR murni).

## Skrip NPM

- `npm run dev` – Menjalankan server pengembangan Next.js.
- `npm run build` – Build produksi.
- `npm run start` – Menjalankan build produksi.
- `npm run lint` – Menjalankan ESLint dengan konfigurasi Next.js + TypeScript.

## Struktur Direktori Ringkas

```
src/
 ├─ app/                 # Halaman Next.js (App Router)
 ├─ components/          # UI & komponen form/layout
 ├─ contexts/            # Context React (contoh: autentikasi)
 ├─ lib/                 # API client, schemas Zod, utilities
 ├─ mocks/               # Setup MSW dan data mock
```

## Catatan Pengembangan
- Data surat masuk/keluar divalidasi dengan `src/lib/schemas` sehingga perubahan struktur API perlu diperbarui di sana.
- Jika terhubung ke API nyata, pastikan endpoint yang dipanggil sesuai dengan yang dimock oleh MSW saat pengembangan.
- Fitur ekspor laporan menggunakan `reportsService.exportReport` dan akan mengunduh file PDF simulasi saat mock aktif.

Selamat berkarya dengan E-Arsip! Jangan ragu untuk menyesuaikan komponen sesuai kebutuhan organisasi Anda.

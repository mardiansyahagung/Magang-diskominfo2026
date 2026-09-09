# 🛡️ Pemantauan Aset Web — Diskominfo Kabupaten Garut

**Repository:** [github.com/mardiansyahagung/Magang-diskominfo2026](https://github.com/mardiansyahagung/Magang-diskominfo2026)

Sistem internal untuk memantau status keamanan aset web milik Pemerintah Kabupaten Garut (situs dinas, kecamatan, puskesmas, dan aplikasi sistem). Dibangun oleh Bidang Persandian dan Keamanan Informasi untuk mendeteksi anomali (seperti indikasi judi online dan kebocoran data), mencatat insiden, serta mengelola korespondensi (persuratan) terkait penanganan insiden dengan dinas terkait.

---

## ✨ Fitur Utama

- **Dashboard Pemantauan** — ringkasan jumlah aset, status aktif/bermasalah, dan anomali terdeteksi, lengkap dengan grafik visual.
- **Riwayat Insiden** — pencatatan lengkap insiden keamanan pada tiap aset web.
- **Persuratan** — arsip surat laporan (surat keluar) ke dinas terkait dan balasan penanganan (surat masuk), saling terhubung dan terkait langsung ke aset yang bermasalah.
- **Perangkat & Alat** — kumpulan tools bantu investigasi (dorking, dsb).
- **Manajemen Pengguna** — kelola akun & peran (admin/user), khusus admin.
- **Log Aktivitas** — audit trail seluruh aksi tambah/edit/hapus data, khusus admin.
- **Export data** ke Excel & PDF.
- Mode terang & gelap (Dark Mode).

---

## 🧱 Tech Stack

**Frontend**

- React 19 + React Router
- Vite
- Tailwind CSS 4
- Recharts (grafik)
- ExcelJS / SheetJS (export Excel)
- jsPDF + jsPDF-AutoTable (export PDF)

**Backend**

- Node.js + Express 5
- MySQL / MariaDB (via `mysql2`)
- express-session (autentikasi berbasis sesi)
- bcryptjs (hash password)
- Multer (upload file, dipakai modul Persuratan)

---

## 📁 Struktur Folder

```
├── src/                        # Kode frontend (React)
│   ├── components/
│   │   ├── dashboard/           # Komponen khusus area dashboard (Sidebar, TopBar, dll)
│   │   └── ...                  # Komponen umum (TabelAset, Modal, StatistikChart, dll)
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   └── App.jsx                  # Routing utama
├── backend-aset/                # Kode backend (Express)
│   ├── server.js                # Entry point backend
│   ├── persuratanRoutes.js      # Modul route Persuratan
│   └── uploads/                 # File hasil upload (scan surat, evidence)
├── sql/
│   └── migration_persuratan.sql # Migrasi tabel surat_keluar & surat_masuk
├── .gitignore
└── README.md
```

---

## 🚀 Instalasi & Menjalankan Project

### 1. Clone repository

```bash
git clone https://github.com/mardiansyahagung/Magang-diskominfo2026.git
cd Magang-diskominfo2026
```

### 2. Install dependency frontend

jalankan prompt ini di folder front-end melalui cmd/git bash

```bash/cmd
npm install
```

### 3. Install dependency backend

jalankan prompt ini di folder backend melalui cmd/git bash

```bash
cd backend-aset
npm install
cd ..
```

### 4. Siapkan database

- Buat database baru di MySQL, misal `db_aset_garut`.
- Import struktur tabel utama yang sudah disediakan di link git repository (db_aset_garut.sql)

### 5. Jalankan backend

```bash
cd backend-aset
npm start
```

### 6. Jalankan frontend

Di terminal terpisah, dari folder root project:

```bash
npm run dev
```

Frontend berjalan di `http://localhost:5173`.

---

## 🗄️ Struktur Database (Ringkas)

| Tabel           | Keterangan                                                             |
| --------------- | ---------------------------------------------------------------------- |
| `aset_web`      | Data domain/subdomain yang dipantau, status aktif, jenis anomali, dll. |
| `users`         | Akun pengguna sistem (admin/user).                                     |
| `log_aktivitas` | Audit trail aksi tambah/edit/hapus pada seluruh modul.                 |
| `surat_keluar`  | Surat laporan insiden yang dikirim ke dinas terkait.                   |
| `surat_masuk`   | Balasan dari dinas terkait, terhubung ke `surat_keluar`.               |

---

## 🔌 API Endpoints (Ringkas)

| Method | Endpoint             | Akses  | Keterangan                         |
| ------ | -------------------- | ------ | ---------------------------------- |
| POST   | `/api/login`         | publik | Login pengguna                     |
| POST   | `/api/logout`        | login  | Logout pengguna                    |
| GET    | `/api/me`            | login  | Cek sesi & profil pengguna aktif   |
| GET    | `/api/aset`          | login  | Daftar aset web                    |
| POST   | `/api/aset`          | admin  | Tambah aset web                    |
| PUT    | `/api/aset/:id`      | admin  | Edit aset web                      |
| DELETE | `/api/aset/:id`      | admin  | Hapus aset web                     |
| GET    | `/api/statistik`     | login  | Ringkasan statistik dashboard      |
| GET    | `/api/surat-keluar`  | login  | Daftar surat keluar                |
| POST   | `/api/surat-keluar`  | admin  | Tambah surat keluar (+upload file) |
| GET    | `/api/surat-masuk`   | login  | Daftar surat masuk                 |
| POST   | `/api/surat-masuk`   | admin  | Tambah surat masuk (+upload file)  |
| GET    | `/api/users`         | admin  | Daftar pengguna                    |
| GET    | `/api/log-aktivitas` | admin  | Daftar log aktivitas               |

_(Daftar lengkap ada di `backend-aset/server.js` dan `backend-aset/persuratanRoutes.js`)_

---

## 👤 Peran Pengguna

| Peran   | Akses                                                                        |
| ------- | ---------------------------------------------------------------------------- |
| `admin` | Akses penuh: tambah/edit/hapus data, kelola pengguna, lihat log aktivitas    |
| `user`  | Hanya bisa melihat data (read-only) pada modul aset, insiden, dan persuratan |

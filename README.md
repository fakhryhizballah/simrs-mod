# Dokumentasi SIMRS-MOD - Views & Features

File ini mendokumentasikan semua fitur dari folder `views/` dalam aplikasi SIMRS-MOD (System Information Management and Reporting System for Medical Unit).

---

## 📁 Struktur Folder Views

```
views/
├── auth/
│   └── login.ejs              # Halaman login autentikasi
├── dashboard/
│   ├── index.ejs              # Dashboard utama dengan statistik
│   ├── menu-grid.ejs          # Grid display menu aplikasi
│   ├── rajal_list.ejs         # Daftar pasien rawat jalan (RAL)
│   ├── inacbg_klaim.ejs       # Search klaim INACBG/ICD-10-CM
│   └── inacbg_klaim_kirim.ejs # Form submit klaim comprehensive
├── layouts/
│   ├── base.ejs               # Footer component template
│   ├── main.ejs               # Parent layout utama untuk SPA
├── menus/
│   └── menu-grid.ejs          # Grid menu dinamis dari backend
├── partials/
│   ├── footer.ejs             # Footer component
│   ├── header.ejs              # Top navigation bar
│   └── navbar.ejs             # Sidebar navigation links
├── rajal/
│   └── soap.ejs               # SOAP note format (Subjective, Objective, Assessment, Plan)
└── submenus/
    └── base-submenu.ejs       # Base template untuk submenu
```

---

## 🔐 Authentication & Login

### `views/auth/login.ejs`

**Fungsi:** Halaman login dengan form autentikasi.

**Fitur:**
| Fitur | Deskripsi |
|-------|-----------|
| Form Input | Fields: username, password (required validation) |
| AJAX Submit | Kirim ke endpoint `/login` dengan payload JSON `{username, password}` |
| Response Handling | SweetAlert2 untuk error message atau redirect ke `/menu` |
| PWA Install | Popup install app dengan tombol Install/Nanti |

**Flow:**
1. User input username & password
2. Form submit dengan `e.preventDefault()` (AJAX mode)
3. Fetch POST `/login` dengan headers `Content-Type: application/json`
4. Check response code:
   - Code 200 → redirect ke `/menu`
   - Error → tampilkan alert di SweetAlert2

---

## 📊 Dashboard & Statistics

### `views/dashboard/index.ejs`

**Fungsi:** Halaman utama dashboard menampilkan statistik ringkas 3 kolom.

| Statistik | Indikator | Warna |
|-----------|-----------|-------|
| Total Pasien Today | Count pasien hari ini | Blue |
| Total Transaksi | Jumlah transaksi | Green |
| Total Laporan | Total laporan tersedia | Purple |

**Layout:** Grid responsif 3 kolom (`grid-cols-3`) dengan card styling shadow.

---

### `views/dashboard/menu-grid.ejs`

**Fungsi:** Display grid menu utama aplikasi.

| Fitur | Deskripsi |
|-------|-----------|
| Layout | Responsive grid (2 col mobile → 3 col desktop) |
| Content | Dinamis dari variabel `dataMenu` (from backend) |
| Styling | Tailwind utility classes |
| Container | Max-width 4xl dengan gap-4 spacing |

---

## 🏥 Menu Management

### `views/menus/menu-grid.ejs`

**Fungsi:** Grid tampilan menu aplikasi dengan hierarchy.

**Fitur:**
- Responsive grid (2-3 kolom)
- Template dinamis dari `dataMenu` JSON
- Header centered dengan judul "Menu Utama"
- Auto-scroll horizontal untuk daftar panjang

---

### `views/submenus/base-submenu.ejs`

**Fungsi:** Base template untuk halaman submenu.

**Fitur:**
- Extend main layout dengan title dari parameter
- Back navigation link ke `/menu` dengan icon SVG arrow-left
- Submenu header dengan judul dinamis `<%= submenuTitle %>`
- Content wrapper dengan shadow & padding
- Max-width 6xl container

---

## 📋 Real Admission List (RAL)

### `views/dashboard/rajal_list.ejs`

**Fungsi:** Tampilkan daftar pasien rawat jalan dengan filter dan tabel.

| Fitur | Detail |
|-------|--------|
| Filter Pola | Poli code (dropdown), Date range (from/until) |
| Stats Counter | Total pasien di current status dengan icon & number |
| Tabel Data | 7 kolom: No.Rawat, JamReg, RM, Nama, GenderBadge, DOB, Dokter |
| Pagination | Header (top) & footer (bottom) pagination rendering |
| Action | Click → save sessionStorage param → redirect ke SOAP page |

**Form Filter:**
```
┌─────────┬──────────────┬──────────────┐
│ Poli    │ Tanggal Awal  │ Tanggal Akhir  │
│ code    │ 2024-02-01    │ 2024-02-01     │
└─────────┴──────────────┴──────────────┘

Stat Counter: "[icon] 0 Pasien Terdaftar"
```

**Table Columns:**
| Col | Header |
|-----|--------|
| 1 | No. Rawat |
| 2 | Jam Registrasi |
| 3 | No. RM (Room Number) |
| 4 | Nama Pasien |
| 5 | Gender badge (L/P) |
| 6 | DOB (Date of Birth) |
| 7 | Dokter Tujuan |

---

### `views/rajal/soap.ejs`

**Fungsi:** Template format SOAP note untuk dokumentasi klinis pasien.

**Structure:**
- Tab-divisions standar SOAP: S.O.A.P.
- Subjective (Keluhan utama)
- Objective (Data pemeriksaan fisik/lab)
- Assessment (Analisis diagnosis)
- Plan (Perluasan rawat/obat)

---

## 📄 Claims & IDRG Management

### `views/dashboard/inacbg_klaim.ejs`

**Fungsi:** Halaman search klaim berdasarkan standar INACBG/ICD-10-CM.

**Status:** File placeholder - masih dalam pengembangan. Konten belum complete.

---

### `views/dashboard/inacbg_klaim_kirim.ejs`

**Fungsi:** Comprehensive form submission untuk data klaim & grouping IDRG.

**Section Breakdown:**

#### Section 1: Identitas & Registrasi
| Input | Default |
|-------|---------|
| No. SEP (Sepeda Angkas) | - |
| No. RM (Room Number) | - |
| Kartu JKN | - |
| Nama Pasien (uppercase) | - |
| Tgl Lahir | - |
| Gender (L=1, P=2) | Default: Male |
| Tgl Masuk/Pulang | - |
| LOS (Length of Stay) | - |
| Dokter Terapis | - |

#### Section 2: Detail Perawatan
| Input | Options |
|-------|---------|
| Jenis Rawat | Inap=1, Ralan=2 |
| Kelas Rawat | 1/2/3 (default: 3) |
| Cara Masuk | GP, Hosp-Trans, MP, Outp, Inp, EMD, Born |
| Discharge Status | Persetujuan, Dirujuk, Meninggal (code 4), Lain-lain |
| Tenses | Systole (default: 110) / Diastole (60) |
| Birth Weight | Gram (default: 0) |

#### Section 3: Indicators & Coder
| Metric | Input Type |
|--------|-------------|
| ADL Sub Acute | Number (default: 0) |
| ADL Chronic | Number (default: 0) |
| ICU Indikator | Number (default: 0) |
| ICU LOS | Number (default: 0) |
| Coder NIK | Readonly (auto-from-backend) |

#### Tarif RS Section (26 items grid)
| Kategori | Label English |
|----------|---------------|
| Non-Bedah | Prosedur Non Bedah |
| Bedah | Prosedur Bedah |
| Konsultasi | Konsultasi |
| Tenaga Ahli | Tenaga Ahli |
| Perawatan | Keperawatan |
| Penunjang | Penunjang |
| Radiologi | Radiologi |
| Rehabilitasi | Rehabilitasi |
| Lab | Laboratorium |
| Kamar | Kamar |
| Obat (general) | Obat |
| Alkes | Alkes |
| BMHP | BMHP |
| Darah | Pelayanan Darah |
| Intensif | Rawat Intensif |
| Kronis/Kemoterapi | Obat Kronis & Kemoterapi |
| Alat/Sewa | Sewa Alat |

#### Additional Info
- Dializer Single Use (1=multiple use default)
- Kantong Darah (default: 0)
- Payor Code: JKN (readonly)

**Form Submit:**
- Button: "Kirim Data Klaim" (blue, hover effect)
- Success: Enable re-grupping button via metadata check

#### IDRG Grouping Section
- **Diagnosa:** Select2 multiple disabled → list selected with tags (dynamic from API)
- **Prosedur:** Table dengan jumlah di kolom ke-2 (dynamic AJAX response)
- Submit Button: "GROUPING IDRG" (disabled until form valid)

---

## 🔧 Layout & Components

### `views/layouts/main.ejs`

**Fungsi:** Parent layout utama untuk semua halaman SPA.

| Fitur | Description |
|-------|-------------|
| Variables Support | Dynamic title, hrefhead array, script array |
| External Libraries | jQuery 3.6 CDN, SweetAlert2 v11, Select2 |
| Custom CSS | Spinner animation keyframes (rotate 0→360deg) |
| Structure | Header → Main → Footer pattern |

```javascript
// Variables passed from backend:
// title      : Page title
// hrefhead   : [css1.css, css2.css]
// script     : ["app1.js", "app2.js"]
// body       : Rendered content (child view result)
```

### `views/layouts/base.ejs`

**Fungsi:** Footer component template.

| Content | Description |
|---------|-------------|
| Copyright Notice | `&copy; {year} SIMRS-ONLY. All rights reserved.` |
| Styling | White bg, shadow, mt-8 margin, gray-600 text |

### `views/partials/header.ejs`

**Fungsi:** Top navigation bar dengan logo/title + nav links.

```html
<nav class="flex gap-4">
  <a href="/" → Dashboard</a>
  <a href="/menu" → Menu</a>
  <a href="/logout" → Logout</a>
</nav>
```

### `views/partials/navbar.ejs`

**Fungsi:** Sidebar navigation menu (dynamic content from backend context).

## 📡 External API Endpoints

The application communicates with a backend API server. The base URL is stored in a cookie named `API_URL` and is used by all JavaScript modules. Below is a summary of the key endpoints that are consumed by the views and public JavaScript files.

| Endpoint | Method | Purpose | Notes |
|----------|--------|---------|-------|
| `/login` | POST | Authenticate user and return JWT token | Used by `views/auth/login.ejs` via AJAX |
| `/api/inacbg/ws` | POST | Generic INACBG web service for searching diagnoses, procedures, and submitting claims | Used by `public/js/diagnosa.js`, `public/js/idrg_klaim.js`, `public/js/inacbg.js`, `public/js/inacbg_klaim.js`, `public/js/inacbg_klaim_kirim.js` |
| `/api/ralan/pemeriksaan` | POST/PUT | Create or update SOAP/CPPT records | Used by `public/js/soap.js` |
| `/api/ralan/pemeriksaan/riwayat` | GET | Retrieve patient visit history | Used by `public/js/soap.js` |
| `/api/ralan/pemeriksaan/berkas` | GET | Retrieve supporting documents for a patient | Used by `public/js/soap.js` |
| `/api/ralan/pemeriksaan` | GET | (Not directly used in current code but available for fetching records) |
```
**Note:** The table above lists only the most frequently used endpoints. The backend may expose additional routes for administrative or reporting purposes.

---

## 🛠 Teknologi & Libraries

| Technology | Purpose | Version |
|------------|---------|---------|
| EJS | Server-side templating | - |
| TailwindCSS | Utility-first CSS framework | CDN latest |
| jQuery | DOM manipulation | 3.6.0 |
| SweetAlert2 | Toast alerts | v11 |
| Select2 | AJAX search for ICD-10 diagnoses | 4.1.0-rc.0 |
| Service Worker | PWA offline support | - |

---

## 📊 File Summary

| Path | Type | Lines Est | Purpose |
|------|------|-----------|---------|
| views/layouts/ base/main | Base Layout | 20-40 | Template parent & footer |
| views/partials/* | Components | 15-25 | Header, navbar, footer parts |
| views/auth/login | Auth | ~85 | Login form dengan AJAX |
| views/menus/menu-grid | Menu Display | ~30 | Grid dari backend JSON |
| views/dashboard/rafal* | RAL Table | 78-290 | Stats, RAL list, claims forms |
| views/rajal/soap | Clinical Notes | Unknown | SOAP format template |

---

## 🔄 Data Flow Architecture

```
User Action
   ↓
View (EJS Template)
   ↓
Controller Handler (Node.js)
   ↓
API Response / AJAX
   ↓
Form Submit via fetch()
   ↓
Backend Processing (routes/index.js)
   ↓
JSON Response { code, data }
```

## 🎨 UI/UX Features

- **Responsive Design:** Mobile-first dengan Tailwind breakpoints
- **Loading States:** Spinner + "Memuat Data..." dengan progress
- **Error Handling:** SweetAlert2 modal untuk user-friendly errors
- **Pagination:** Top & bottom pagination untuk long lists
- **Tagged Inputs:** Select2 dropdown dengan tag display untuk diagnosa/prosedur
- **Auto-fill:** Coder NIK dan data lain auto-populated dari backend

---

*Catatan: Dokumentasi ini mencakup struktur files views di folder `views/`. Detail implementation logic berada di controller file (controllers/index.js, controllers/ajax.js).*
# 📖 Panduan Pengembangan UI: Modul Pemeriksaan Visus dan Refraksi

Dokumen ini berisi panduan teknis dan standar antarmuka (UI/UX) untuk pengembangan halaman pencatatan hasil pemeriksaan mata (Visus dan Refraksi) pada Sistem Informasi Manajemen Rumah Sakit (SIMRS).

## 🛠️ Tech Stack & Standar Spesifikasi
- **Markup:** HTML5 Terstruktur dengan modul EJS (Template Engine)
- **Styling:** Tailwind CSS (Utility-first)
- **Logika Interaksi:** Vanilla JavaScript (ES6) / React.js (Sesuai kebutuhan modul)
- **Pendekatan Desain:** Card-Based UI & Data Matrix Layout
- **Aksesibilitas:** Navigasi keyboard, *screen reader friendly*, kontras warna sesuai WCAG 2.1 AA.
_ **Referensi:** desain sebelumnya

---

## 📐 Arsitektur Tata Letak (Layouting)

Halaman ini dirancang untuk meminimalkan *cognitive load* pada petugas medis (dokter mata/refraksionis) saat memindahkan data dari alat ukur ke dalam sistem. Layout dibagi menjadi beberapa *Card* utama:

### 1. Panel Pasien (Header)
Panel statis di bagian atas untuk memastikan petugas tidak salah memasukkan data ke pasien lain.
- **Isi:** Nama Pasien, Nomor Rekam Medis (RM), Usia, dan Tanggal Pemeriksaan.

### 2. Card Refraksi (Koreksi Lensa) - *Core Component*
Komponen inti berbentuk tabel matriks untuk menginput nilai koreksi lensa.
- **Baris 1 (OD):** Oculus Dexter (Mata Kanan) -> **Warna Aksen: Merah**
- **Baris 2 (OS):** Oculus Sinister (Mata Kiri) -> **Warna Aksen: Biru**
- **Kolom Input:** 
  1. `SPH` (Spherical)
  2. `CYL` (Cylinder)
  3. `AXIS` (Derajat kemiringan, *disabled* jika CYL kosong)
  4. `Visus CC` (Tajam penglihatan dengan koreksi)
  5. `ADD` (Addition, khusus lensa baca)

### 3. Card Tambahan (Footer)
- Input tunggal untuk **PD (Pupillary Distance)**.
- Tombol aksi: **Simpan Data** / **Cetak Resep Kacamata**.

---

## 💻 Panduan Implementasi Komponen

### Tahap 1: Struktur Tabel Matriks (HTML & Tailwind)
Gunakan tag `<table>` untuk kemudahan navigasi *keyboard* (menggunakan tombol `Tab`).

```html
<!-- Contoh Struktur Baris OD (Mata Kanan) -->
<tr class="hover:bg-slate-50 transition-colors">
  <td class="px-4 py-3">
    <!-- Indikator Warna OD (Merah) -->
    <div class="flex items-center gap-2">
      <span class="w-2 h-8 bg-red-500 rounded-full"></span>
      <div>
        <p class="font-bold text-gray-800">OD</p>
        <p class="text-xs text-gray-500">Kanan</p>
      </div>
    </div>
  </td>
  <td class="px-4 py-3">
    <input type="text" id="od-sph" class="w-24 px-3 py-2 border rounded focus:ring-2 focus:ring-red-400">
  </td>
  <!-- ... Lanjutkan untuk input lainnya ... -->
</tr>


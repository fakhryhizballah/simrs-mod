# Progress Aplikasi SIMRS-MOD - 19 Januari 2026

## Perubahan Hari Ini

### 1. Perbaikan Struktur Layout EJS
- Menghapus tag HTML boilerplate (`<html>`, `<head>`, `<body>`) dari file-file view individu (`login.ejs`, `menu-grid.ejs`, `index.ejs`) untuk menghindari duplikasi struktur HTML.
- Menghapus penggunaan `<%- include('../layouts/main') %>` di dalam file view karena menyebabkan nesting layout yang tidak tepat.
- Mengimplementasikan sistem layout yang lebih bersih melalui kontroler.

### 2. Pembaruan Kontroler (`controllers/index.js`)
- Mengubah fungsi `login`, `dashboard`, dan `menu` untuk menggunakan pola rendering bertingkat:
    1. Render file view spesifik (sebagai konten).
    2. Masukkan hasil render tersebut ke dalam variabel `body`.
    3. Render file layout utama (`layouts/main.ejs`) dengan menyisipkan variabel `body`.

### 3. File yang Dimodifikasi
- `controllers/index.js`: Penyesuaian logika rendering layout.
- `views/auth/login.ejs`: Pembersihan boilerplate HTML.
- `views/dashboard/index.ejs`: Penghapusan include layout manual.
- `views/menus/menu-grid.ejs`: Penghapusan include layout manual.

---
*Catatan: Struktur sekarang lebih konsisten dan memudahkan pengelolaan header/footer di satu tempat (`layouts/main.ejs`).*
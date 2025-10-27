# 📁 Family Document Manager

> Sistem Manajemen Berkas Keluarga yang Aman dan Modern

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://your-username.github.io/family-document-manager)
[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-blue?style=for-the-badge&logo=github)](https://pages.github.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-purple?style=for-the-badge)](https://web.dev/progressive-web-apps/)

Aplikasi web modern untuk menyimpan dan mengelola berkas-berkas administrasi penting untuk seluruh anggota keluarga. Dibangun dengan teknologi web terbaru dan dapat diinstall seperti aplikasi native di smartphone.

## ✨ **Demo Live**

🌐 **[Coba Aplikasi Sekarang](https://your-username.github.io/family-document-manager)**

📱 **Install di HP:** Buka link di atas di browser HP, lalu pilih "Add to Home Screen"

## 🎯 **Fitur Utama**

### 🔐 Sistem Login & Registrasi
- Registrasi akun pengguna baru
- Login dengan username dan password
- Session management (24 jam)
- Data berkas terpisah per pengguna
- Logout yang aman

### 📁 Upload Berkas
- Upload berbagai jenis file (PDF, DOC, DOCX, JPG, PNG, TXT)
- Kategorisasi dokumen (KTP, KK, Ijazah, dll.)
- Tambahkan nama dan deskripsi untuk setiap berkas
- Penyimpanan lokal menggunakan localStorage

### 🔍 Pencarian & Filter
- Cari berkas berdasarkan nama atau deskripsi
- Filter berdasarkan kategori
- Tampilan grid yang responsif

### 👁️ Manajemen Berkas
- Lihat preview berkas
- Download berkas asli
- Hapus berkas yang tidak diperlukan
- Informasi detail setiap berkas

### 📱 Progressive Web App (PWA)
- Install seperti aplikasi native
- Berfungsi offline setelah pertama kali dibuka
- Responsive design untuk semua perangkat
- Push notifications (coming soon)

### 🌐 GitHub Pages Integration
- Hosting gratis selamanya
- HTTPS otomatis
- Custom domain support
- Automatic deployment

## Kategori Berkas

- **KTP & Identitas** - Kartu Tanda Penduduk dan dokumen identitas
- **Kartu Keluarga** - Dokumen kartu keluarga
- **Akta Kelahiran** - Akta kelahiran dan dokumen terkait
- **Ijazah & Sertifikat** - Dokumen pendidikan dan sertifikasi
- **Surat Kerja** - Dokumen pekerjaan dan kontrak
- **Dokumen Pajak** - SPT, NPWP, dan dokumen pajak lainnya
- **Asuransi** - Polis dan dokumen asuransi
- **Dokumen Properti** - Sertifikat tanah, IMB, dll.
- **Dokumen Keuangan** - Rekening koran, slip gaji, dll.
- **Lainnya** - Kategori umum untuk dokumen lain

## 🚀 **Quick Start**

### **Akses Online:**
1. Kunjungi: **[https://your-username.github.io/family-document-manager](https://your-username.github.io/family-document-manager)**
2. Daftar akun baru atau login
3. Mulai mengelola berkas keluarga Anda

### **Install di Smartphone:**
1. Buka aplikasi di browser HP
2. Tap menu browser (⋮) → "Add to Home Screen"
3. Aplikasi akan muncul seperti app native

## 📖 **Cara Penggunaan**

1. **Login/Registrasi**
   - Buka `login.html` di browser
   - Untuk pengguna baru: klik "Daftar di sini" dan isi form registrasi
   - Untuk pengguna lama: masukkan username dan password
   - Setelah login berhasil, akan diarahkan ke aplikasi utama

2. **Upload Berkas Baru**
   - Klik "Pilih Berkas" dan pilih file dari komputer
   - Isi nama berkas yang mudah diingat
   - Pilih kategori yang sesuai
   - Tambahkan deskripsi (opsional)
   - Klik "Upload Berkas"

3. **Mencari Berkas**
   - Gunakan kotak pencarian untuk mencari berkas
   - Gunakan dropdown kategori untuk filter
   - Kombinasikan pencarian dan filter untuk hasil yang lebih spesifik

4. **Mengelola Berkas**
   - Klik "Lihat" untuk preview berkas
   - Klik "Download" untuk mengunduh berkas asli
   - Klik "Hapus" untuk menghapus berkas (dengan konfirmasi)

## Teknologi

- **HTML5** - Struktur aplikasi
- **CSS3** - Styling dan responsif design
- **JavaScript** - Logika aplikasi dan manajemen data
- **localStorage** - Penyimpanan data lokal di browser

## Keamanan & Privasi

- Semua data disimpan secara lokal di browser Anda
- Tidak ada data yang dikirim ke server eksternal
- Password di-hash sebelum disimpan
- Session otomatis expired setelah 24 jam
- Data berkas terpisah per pengguna
- Berkas disimpan dalam format base64 di localStorage
- Pastikan untuk backup data secara berkala

## 🛠️ **Setup & Deployment**

### **Deploy ke GitHub Pages:**

1. **Fork Repository:**
   ```bash
   # Clone repository ini
   git clone https://github.com/your-username/family-document-manager.git
   cd family-document-manager
   ```

2. **Push ke GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

3. **Aktifkan GitHub Pages:**
   - Buka repository di GitHub
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: main / (root)
   - Save

4. **Akses Aplikasi:**
   - URL: `https://your-username.github.io/family-document-manager`

### **Local Development:**

1. **Clone & Run:**
   ```bash
   git clone https://github.com/your-username/family-document-manager.git
   cd family-document-manager
   # Buka index.html di browser atau gunakan live server
   ```

2. **Dengan Python:**
   ```bash
   python -m http.server 8000
   # Akses: http://localhost:8000
   ```

3. **Dengan Node.js:**
   ```bash
   npx http-server
   # Akses URL yang ditampilkan
   ```

## Browser Support

- Chrome (Recommended)
- Firefox
- Safari
- Edge

## Batasan

- Ukuran file dibatasi oleh kapasitas localStorage browser (~5-10MB)
- Data akan hilang jika localStorage browser dibersihkan
- Tidak ada sinkronisasi antar perangkat

## Tips Penggunaan

- Gunakan nama berkas yang deskriptif
- Manfaatkan kategori untuk organisasi yang lebih baik
- Backup data secara berkala
- Gunakan deskripsi untuk informasi tambahan yang penting
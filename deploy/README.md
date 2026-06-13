# File Siap Upload ke GitHub Pages

## 📁 Isi Folder

- `index.html` — Aplikasi Quiz lengkap dalam 1 file (HTML + CSS + JavaScript)
- `README.md` — Panduan ini

## 🚀 Cara Upload ke GitHub Pages

### 1. Buat Repository GitHub Baru
1. Buka https://github.com/new
2. Isi nama repository: `quiz-online` (bebas)
3. Pilih **Public**
4. Klik **Create repository**

### 2. Upload File
1. Di repository baru, klik **Add file → Upload files**
2. **Upload hanya file `index.html`** dari folder ini ke root repository
3. Jangan upload folder `src`, `package.json`, dll
4. Klik **Commit changes**

### 3. Aktifkan GitHub Pages
1. Masuk ke **Settings → Pages**
2. Pada bagian **Source**, pilih **Deploy from a branch**
3. Branch: pilih **main**
4. Folder: **/(root)**
5. Klik **Save**

### 4. Tunggu & Akses
- Tunggu 1-2 menit
- Buka link:
  ```
  https://USERNAME.github.io/quiz-online/
  ```
  Ganti `USERNAME` dengan username GitHub Anda.

## ⚙️ Setup Google Sheets

Lihat file `SETUP_GOOGLE_SHEETS.md` di root project untuk kode Apps Script lengkap.

## 💡 Tips

- File `index.html` ini sudah **siap pakai**, tidak perlu install Node.js
- Untuk update soal, cukup edit spreadsheet Google Sheets
- Aplikasi sudah mobile-friendly dan tidak restart saat discroll

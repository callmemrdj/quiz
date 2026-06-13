# Setup Google Sheets Database

## Langkah 1: Buat Google Spreadsheet

Buat Google Spreadsheet baru dengan **2 sheet**:

### Sheet 1: `Soal` (Questions)
| A (soal) | B (opsi_a) | C (opsi_b) | D (opsi_c) | E (opsi_d) | F (jawaban) |
|-----------|-----------|-----------|-----------|-----------|------------|
| Apa ibu kota Indonesia? | Jakarta | Surabaya | Bandung | Semarang | A |
| 2 + 2 = ? | 3 | 4 | 5 | 6 | B |

- Baris 1 adalah header
- Kolom F berisi huruf jawaban benar: A, B, C, atau D

### Sheet 2: `Hasil` (Results)
| A (timestamp) | B (nama) | C (skor) | D (total_soal) | E (persentase) |
|---------------|----------|----------|----------------|----------------|
| (auto) | (auto) | (auto) | (auto) | (auto) |

- Baris 1 adalah header, isi manual headernya

## Langkah 2: Buat Google Apps Script

1. Di Google Spreadsheet, klik **Extensions > Apps Script**
2. Hapus semua code, lalu paste code berikut:

```javascript
const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getQuestions') {
    return getQuestions();
  }
  
  return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  
  if (data.action === 'submitResult') {
    return submitResult(data);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getQuestions() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Soal');
  const data = sheet.getDataRange().getValues();
  
  const questions = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      questions.push({
        id: i,
        soal: data[i][0],
        opsi_a: data[i][1],
        opsi_b: data[i][2],
        opsi_c: data[i][3],
        opsi_d: data[i][4],
        jawaban: data[i][5].toString().toUpperCase().trim()
      });
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: true, questions: questions }))
    .setMimeType(ContentService.MimeType.JSON);
}

function submitResult(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Hasil');
  
  const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  const nama = data.nama;
  const skor = data.skor;
  const totalSoal = data.total_soal;
  const persentase = data.persentase;
  
  sheet.appendRow([timestamp, nama, skor, totalSoal, persentase + '%']);
  
  return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Result saved!' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## Langkah 3: Deploy sebagai Web App

1. Klik **Deploy > New deployment**
2. Pilih type: **Web app**
3. Description: "Quiz API"
4. Execute as: **Me**
5. Who has access: **Anyone**
6. Klik **Deploy**
7. **Copy URL** deployment-nya

## Langkah 4: Masukkan URL ke Aplikasi

Buka aplikasi quiz, masukkan URL Google Apps Script di halaman konfigurasi.

URL format: `https://script.google.com/macros/s/XXXXXXXXXXXX/exec`

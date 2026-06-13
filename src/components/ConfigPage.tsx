import { useState } from 'react';
import { getApiUrl, getTimerDuration } from '../hooks/useQuiz';

interface Props {
  onDone: (url: string, timer: number) => void;
}

export default function ConfigPage({ onDone }: Props) {
  const [url, setUrl] = useState(getApiUrl());
  const [timer, setTimer] = useState(getTimerDuration());
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Masukkan URL Google Apps Script');
      return;
    }
    if (!url.includes('script.google.com')) {
      setError('URL harus berupa URL Google Apps Script yang valid');
      return;
    }
    if (timer < 1 || timer > 180) {
      setError('Durasi timer harus antara 1 - 180 menit');
      return;
    }
    onDone(url.trim(), timer);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
            <svg className="w-10 h-10 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.11v1.093c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.204-.107-.397.165-.71.505-.78.929l-.15.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Konfigurasi Quiz</h1>
          <p className="text-blue-200 text-sm">Hubungkan dengan Google Sheets</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-blue-100 mb-2">
              URL Google Apps Script
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(''); }}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-100 mb-2">
              Durasi Timer (menit)
            </label>
            <input
              type="number"
              value={timer}
              onChange={(e) => { setTimer(Number(e.target.value)); setError(''); }}
              min={1}
              max={180}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-400/40 active:scale-[0.98]"
          >
            Simpan & Lanjutkan
          </button>

          <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl px-4 py-3">
            <p className="text-blue-200 text-xs leading-relaxed">
              💡 <strong>Petunjuk:</strong> Buat Google Spreadsheet dengan sheet "Soal" dan "Hasil", 
              lalu deploy Apps Script sebagai Web App. Lihat file <code className="bg-white/10 px-1 rounded">SETUP_GOOGLE_SHEETS.md</code> untuk panduan lengkap.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

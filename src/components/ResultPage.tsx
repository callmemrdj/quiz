import type { QuizResult } from '../types';

interface Props {
  result: QuizResult;
  submitStatus: string;
  onReset: () => void;
}

function getGrade(persentase: number): { label: string; color: string; emoji: string; message: string } {
  if (persentase >= 90) return { label: 'Luar Biasa!', color: 'text-green-300', emoji: '🏆', message: 'Penguasaan materi sangat baik.' };
  if (persentase >= 75) return { label: 'Bagus!', color: 'text-blue-300', emoji: '⭐', message: 'Penguasaan materi sudah baik.' };
  if (persentase >= 60) return { label: 'Cukup', color: 'text-yellow-300', emoji: '📚', message: 'Masih perlu belajar lebih giat.' };
  if (persentase >= 40) return { label: 'Kurang', color: 'text-orange-300', emoji: '💪', message: 'Tingkatkan belajar Anda.' };
  return { label: 'Perlu Peningkatan', color: 'text-red-300', emoji: '📖', message: 'Perbanyak latihan dan belajar.' };
}

export default function ResultPage({ result, submitStatus, onReset }: Props) {
  const persentaseNum = parseFloat(result.persentase);
  const grade = getGrade(persentaseNum);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (persentaseNum / 100) * circumference;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Result Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-white/5 px-6 py-5 border-b border-white/10 text-center">
            <p className="text-blue-300 text-sm mb-1">Hasil Quiz</p>
            <h1 className="text-white text-xl font-bold">{result.nama}</h1>
          </div>

          {/* Score Circle */}
          <div className="px-6 py-8 text-center">
            <div className="relative inline-flex items-center justify-center mb-5">
              <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60" cy="60" r="54"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                />
                <circle
                  cx="60" cy="60" r="54"
                  fill="none"
                  stroke={persentaseNum >= 75 ? '#22c55e' : persentaseNum >= 50 ? '#eab308' : '#ef4444'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl mb-1">{grade.emoji}</span>
                <span className="text-2xl font-bold text-white">{result.persentase}%</span>
              </div>
            </div>

            <h2 className={`text-xl font-bold ${grade.color} mb-1`}>{grade.label}</h2>
            <p className="text-blue-200 text-sm">{grade.message}</p>
          </div>

          {/* Stats */}
          <div className="px-6 pb-6">
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                <p className="text-2xl font-bold text-white">{result.skor}</p>
                <p className="text-blue-300 text-xs mt-0.5">Benar</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                <p className="text-2xl font-bold text-white">{result.total_soal - result.skor}</p>
                <p className="text-blue-300 text-xs mt-0.5">Salah</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                <p className="text-2xl font-bold text-white">{result.total_soal}</p>
                <p className="text-blue-300 text-xs mt-0.5">Total</p>
              </div>
            </div>

            {/* Submit Status */}
            {submitStatus && (
              <div className={`rounded-xl px-4 py-3 mb-5 text-sm ${
                submitStatus.includes('berhasil') || submitStatus.includes('saved')
                  ? 'bg-green-500/20 border border-green-400/30 text-green-200'
                  : submitStatus.includes('Gagal') 
                  ? 'bg-red-500/20 border border-red-400/30 text-red-200'
                  : 'bg-blue-500/20 border border-blue-400/30 text-blue-200'
              }`}>
                {submitStatus.includes('berhasil') || submitStatus.includes('saved') ? '✅ ' : 
                 submitStatus.includes('Gagal') ? '❌ ' : '⏳ '}
                {submitStatus}
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={onReset}
              className="w-full py-3.5 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-400/40 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
              Mulai Quiz Baru
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-blue-300/40 text-xs mt-4">
          Hasil telah disimpan ke database
        </p>
      </div>
    </div>
  );
}

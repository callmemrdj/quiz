import { useState, useCallback, useEffect } from 'react';
import type { Question, UserAnswer } from '../types';

interface Props {
  userName: string;
  questions: Question[];
  answers: UserAnswer[];
  currentIndex: number;
  timeLeft: number;
  onSelectAnswer: (questionId: number, answer: string) => void;
  onGoToQuestion: (index: number) => void;
  onFinish: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function QuizPage({
  userName,
  questions,
  answers,
  currentIndex,
  timeLeft,
  onSelectAnswer,
  onGoToQuestion,
  onFinish,
}: Props) {
  const [showNav, setShowNav] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers.find(a => a.questionId === currentQuestion?.id);
  const answeredCount = answers.length;
  const totalQuestions = questions.length;
  const isUrgent = timeLeft <= 60;
  const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  // Prevent accidental page close during quiz
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleSelectOption = useCallback((option: string) => {
    if (currentQuestion) {
      onSelectAnswer(currentQuestion.id, option);
    }
  }, [currentQuestion, onSelectAnswer]);

  const handleFinishClick = () => {
    if (answeredCount < totalQuestions) {
      setShowConfirm(true);
    } else {
      setShowConfirm(true);
    }
  };

  const options = currentQuestion ? [
    { key: 'A', text: currentQuestion.opsi_a },
    { key: 'B', text: currentQuestion.opsi_b },
    { key: 'C', text: currentQuestion.opsi_c },
    { key: 'D', text: currentQuestion.opsi_d },
  ] : [];

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 flex flex-col">
      {/* Header - Fixed */}
      <div className="sticky top-0 z-30 bg-blue-900/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">{userName.charAt(0).toUpperCase()}</span>
              </div>
              <span className="text-blue-200 text-sm truncate">{userName}</span>
            </div>
            
            {/* Timer */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-sm font-bold ${
              isUrgent 
                ? 'bg-red-500/20 text-red-300 border border-red-400/30 animate-pulse' 
                : 'bg-white/10 text-white border border-white/20'
            }`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-400 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-blue-300 text-xs whitespace-nowrap">
              {currentIndex + 1}/{totalQuestions}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-5">
        {/* Question Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              Soal {currentIndex + 1}
            </span>
            {currentAnswer && (
              <span className="bg-green-500/20 text-green-300 text-xs px-2.5 py-1 rounded-full border border-green-400/30">
                ✓ Terjawab
              </span>
            )}
          </div>
          <p className="text-white text-base leading-relaxed whitespace-pre-wrap">{currentQuestion.soal}</p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {options.map(({ key, text }) => {
            const isSelected = currentAnswer?.answer === key;
            return (
              <button
                key={key}
                onClick={() => handleSelectOption(key)}
                className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 flex items-start gap-3 active:scale-[0.98] ${
                  isSelected
                    ? 'bg-blue-500/30 border-blue-400/50 text-white shadow-lg shadow-blue-500/10'
                    : 'bg-white/5 border-white/15 text-blue-100 hover:bg-white/10 hover:border-white/25'
                }`}
              >
                <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                  isSelected
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-blue-300'
                }`}>
                  {key}
                </span>
                <span className="pt-1 text-sm leading-relaxed">{text}</span>
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => onGoToQuestion(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="flex-1 py-3 bg-white/10 hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-white/10 text-white rounded-xl border border-white/20 transition-all flex items-center justify-center gap-1 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Sebelumnya
          </button>
          
          {currentIndex < totalQuestions - 1 ? (
            <button
              onClick={() => onGoToQuestion(currentIndex + 1)}
              className="flex-1 py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-xl transition-all flex items-center justify-center gap-1 text-sm font-medium shadow-lg shadow-blue-500/20"
            >
              Berikutnya
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleFinishClick}
              className="flex-1 py-3 bg-green-500 hover:bg-green-400 text-white rounded-xl transition-all flex items-center justify-center gap-1 text-sm font-bold shadow-lg shadow-green-500/20"
            >
              Selesai
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
        </div>

        {/* Question Navigator Toggle */}
        <button
          onClick={() => setShowNav(!showNav)}
          className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-blue-200 rounded-xl border border-white/10 transition-all text-sm flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
          Navigasi Soal ({answeredCount}/{totalQuestions} terjawab)
          <svg className={`w-4 h-4 transition-transform ${showNav ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Question Navigator Grid */}
        {showNav && (
          <div className="mt-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4">
            <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = answers.some(a => a.questionId === q.id);
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => { onGoToQuestion(idx); setShowNav(false); }}
                    className={`aspect-square rounded-lg text-sm font-bold flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                        : isAnswered
                        ? 'bg-green-500/30 text-green-300 border border-green-400/30'
                        : 'bg-white/5 text-blue-300 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-green-500/30 border border-green-400/30" />
                <span className="text-blue-300 text-xs">Terjawab</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-white/5 border border-white/10" />
                <span className="text-blue-300 text-xs">Belum</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-blue-500 ring-2 ring-blue-300" />
                <span className="text-blue-300 text-xs">Saat ini</span>
              </div>
            </div>
          </div>
        )}

        {/* Finish button if not on last question */}
        {currentIndex < totalQuestions - 1 && (
          <button
            onClick={handleFinishClick}
            className="w-full mt-3 py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-300 rounded-xl border border-green-400/20 transition-all text-sm font-medium"
          >
            Selesaikan Quiz Sekarang
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowConfirm(false)}>
          <div className="bg-blue-900 border border-white/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-white text-lg font-bold mb-1">Selesaikan Quiz?</h3>
              <p className="text-blue-200 text-sm">
                {answeredCount < totalQuestions 
                  ? `Anda baru menjawab ${answeredCount} dari ${totalQuestions} soal. Soal yang tidak dijawab akan dianggap salah.`
                  : `Anda telah menjawab semua ${totalQuestions} soal. Kirim jawaban Anda?`
                }
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl border border-white/20 text-sm font-medium transition-all"
              >
                Kembali
              </button>
              <button
                onClick={() => { setShowConfirm(false); onFinish(); }}
                className="flex-1 py-2.5 bg-green-500 hover:bg-green-400 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-green-500/20"
              >
                Ya, Kirim!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

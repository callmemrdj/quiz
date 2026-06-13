import { useState, useCallback, useRef, useEffect } from 'react';
import type { Question, UserAnswer, QuizResult, AppPhase } from '../types';

const STORAGE_KEY = 'quiz_app_state';
const API_URL_KEY = 'quiz_api_url';
const TIMER_KEY = 'quiz_timer_duration';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface SavedState {
  phase: AppPhase;
  userName: string;
  questions: Question[];
  answers: UserAnswer[];
  currentIndex: number;
  timeLeft: number;
  startTime: number;
  result: QuizResult | null;
}

function saveState(state: Partial<SavedState>) {
  try {
    const existing = loadState();
    const merged = { ...existing, ...state };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (e) {
    // ignore
  }
}

function loadState(): SavedState | null {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // ignore
  }
  return null;
}

function clearState() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function getApiUrl(): string {
  return localStorage.getItem(API_URL_KEY) || '';
}

export function setApiUrl(url: string) {
  localStorage.setItem(API_URL_KEY, url);
}

export function getTimerDuration(): number {
  const saved = localStorage.getItem(TIMER_KEY);
  return saved ? parseInt(saved, 10) : 30;
}

export function setTimerDuration(minutes: number) {
  localStorage.setItem(TIMER_KEY, String(minutes));
}

export function useQuiz() {
  const savedState = loadState();

  const [phase, setPhase] = useState<AppPhase>(
    savedState?.phase === 'quiz' ? 'quiz' : 
    savedState?.phase === 'result' ? 'result' :
    getApiUrl() ? 'register' : 'config'
  );
  const [userName, setUserName] = useState(savedState?.userName || '');
  const [questions, setQuestions] = useState<Question[]>(savedState?.questions || []);
  const [answers, setAnswers] = useState<UserAnswer[]>(savedState?.answers || []);
  const [currentIndex, setCurrentIndex] = useState(savedState?.currentIndex || 0);
  const [timeLeft, setTimeLeft] = useState(savedState?.timeLeft || 0);
  const [result, setResult] = useState<QuizResult | null>(savedState?.result || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitStatus, setSubmitStatus] = useState('');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSubmitRef = useRef(false);
  const isSubmittingRef = useRef(false);

  // Save state on changes (for scroll/refresh persistence)
  useEffect(() => {
    if (phase === 'quiz') {
      saveState({ phase, userName, questions, answers, currentIndex, timeLeft });
    } else if (phase === 'result') {
      saveState({ phase, userName, result });
    }
  }, [phase, userName, questions, answers, currentIndex, timeLeft, result]);

  const calculateResult = useCallback((qs: Question[], ans: UserAnswer[]): QuizResult => {
    let skor = 0;
    qs.forEach((q) => {
      const userAns = ans.find(a => a.questionId === q.id);
      if (userAns && userAns.answer.toUpperCase() === q.jawaban.toUpperCase()) {
        skor++;
      }
    });
    const totalSoal = qs.length;
    const persentase = totalSoal > 0 ? ((skor / totalSoal) * 100).toFixed(1) : '0';
    return { nama: userName, skor, total_soal: totalSoal, persentase };
  }, [userName]);

  const submitToSheet = useCallback(async (quizResult: QuizResult) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    
    const apiUrl = getApiUrl();
    if (!apiUrl) {
      isSubmittingRef.current = false;
      return;
    }

    setSubmitStatus('Mengirim hasil ke database...');

    try {
      await fetch(apiUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submitResult',
          nama: quizResult.nama,
          skor: quizResult.skor,
          total_soal: quizResult.total_soal,
          persentase: quizResult.persentase,
        }),
      });
      setSubmitStatus('Hasil berhasil dikirim!');
    } catch (err) {
      setSubmitStatus('Gagal mengirim hasil. Silakan coba lagi.');
      console.error('Submit error:', err);
    } finally {
      isSubmittingRef.current = false;
    }
  }, []);

  const finishQuiz = useCallback(async (qs?: Question[], ans?: UserAnswer[]) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    const finalQs = qs || questions;
    const finalAns = ans || answers;
    const quizResult = calculateResult(finalQs, finalAns);
    
    setResult(quizResult);
    setPhase('submitting');
    
    await submitToSheet(quizResult);
    
    setPhase('result');
    saveState({ phase: 'result', userName, result: quizResult });
  }, [questions, answers, calculateResult, submitToSheet, userName]);

  // Timer effect
  useEffect(() => {
    if (phase !== 'quiz') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - auto submit
          if (!autoSubmitRef.current) {
            autoSubmitRef.current = true;
            setTimeout(() => finishQuiz(), 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [phase, finishQuiz]);

  const fetchQuestions = useCallback(async (name?: string) => {
    const apiUrl = getApiUrl();
    if (!apiUrl) {
      setError('URL API belum dikonfigurasi');
      return;
    }

    setLoading(true);
    setError('');

    const currentName = name || userName;

    try {
      const response = await fetch(`${apiUrl}?action=getQuestions`);
      const data = await response.json();
      
      if (data.success && data.questions.length > 0) {
        const shuffled = shuffleArray(data.questions as Question[]);
        setQuestions(shuffled);
        setAnswers([]);
        setCurrentIndex(0);
        autoSubmitRef.current = false;
        isSubmittingRef.current = false;
        const duration = getTimerDuration() * 60;
        setTimeLeft(duration);
        setPhase('quiz');
        saveState({
          phase: 'quiz',
          userName: currentName,
          questions: shuffled as Question[],
          answers: [],
          currentIndex: 0,
          timeLeft: duration,
          startTime: Date.now()
        });
      } else {
        setError('Tidak ada soal ditemukan di spreadsheet.');
      }
    } catch (err) {
      setError('Gagal mengambil soal. Periksa URL API dan koneksi internet.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [userName]);

  const selectAnswer = useCallback((questionId: number, answer: string) => {
    setAnswers((prev) => {
      const existing = prev.findIndex(a => a.questionId === questionId);
      const newAnswers = [...prev];
      if (existing >= 0) {
        newAnswers[existing] = { questionId, answer };
      } else {
        newAnswers.push({ questionId, answer });
      }
      return newAnswers;
    });
  }, []);

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
    }
  }, [questions.length]);

  const configDone = useCallback((url: string, timer: number) => {
    setApiUrl(url);
    setTimerDuration(timer);
    setPhase('register');
  }, []);

  const startQuiz = useCallback((name: string) => {
    setUserName(name);
    fetchQuestions(name);
  }, [fetchQuestions]);

  const resetQuiz = useCallback(() => {
    clearState();
    autoSubmitRef.current = false;
    isSubmittingRef.current = false;
    setPhase('register');
    setQuestions([]);
    setAnswers([]);
    setCurrentIndex(0);
    setTimeLeft(0);
    setResult(null);
    setSubmitStatus('');
    setError('');
  }, []);

  const goToConfig = useCallback(() => {
    setPhase('config');
  }, []);

  return {
    phase,
    userName,
    questions,
    answers,
    currentIndex,
    timeLeft,
    result,
    loading,
    error,
    submitStatus,
    configDone,
    startQuiz,
    selectAnswer,
    goToQuestion,
    finishQuiz,
    resetQuiz,
    goToConfig,
    setUserName,
  };
}

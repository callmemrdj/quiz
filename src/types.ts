export interface Question {
  id: number;
  soal: string;
  opsi_a: string;
  opsi_b: string;
  opsi_c: string;
  opsi_d: string;
  jawaban: string;
}

export interface UserAnswer {
  questionId: number;
  answer: string;
}

export interface QuizResult {
  nama: string;
  skor: number;
  total_soal: number;
  persentase: string;
}

export type AppPhase = 'config' | 'register' | 'quiz' | 'result' | 'submitting';

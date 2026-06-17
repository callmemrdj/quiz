// ============================================
// KONFIGURASI - GANTI DENGAN URL ANDA
// ============================================
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwVHbZJkbPtkfLo0SHfQo2RjarTfcGFmQ7P7j85Igfy-Jc-fjqLm6i4LBOChNPlutn9Zg/exec';
const QUIZ_DURATION = 30 * 60;

// ============================================
// STATE MANAGEMENT
// ============================================
let questions = [];
let userAnswers = {};
let timer = null;
let timeRemaining = QUIZ_DURATION;
let userName = '';
let isSubmitted = false;

// ============================================
// UTILITY FUNCTIONS
// ============================================
function $(id) {
  return document.getElementById(id);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function showPage(pageId) {
  ['landingPage', 'loadingPage', 'quizPage', 'resultPage'].forEach((id) => {
    $(id).classList.add('hidden');
  });
  $(pageId).classList.remove('hidden');
  $(pageId).classList.add('fade-in');
}

function openModal(id) {
  $(id).classList.add('active');
}

function closeModal() {
  document.querySelectorAll('.modal-overlay').forEach((m) => m.classList.remove('active'));
}

// ============================================
// FETCH QUESTIONS
// ============================================
async function fetchQuestions() {
  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?action=getSoal`);
    const result = await response.json();

    if (result.success && result.data) {
      questions = result.data;
      renderQuestions();
      showPage('quizPage');
      startTimer();
    } else {
      throw new Error('Gagal memuat soal');
    }
  } catch (error) {
    console.error('Error:', error);
    $('loadingPage').innerHTML = `
                    <div class="error-message">
                        <p>❌ Gagal memuat soal dari database</p>
                        <p style="font-size: 0.85rem; margin-top: 10px;">${error.message}</p>
                        <button class="btn btn-primary" onclick="location.reload()" style="margin-top: 15px;">Coba Lagi</button>
                    </div>
                `;
  }
}

// ============================================
// RENDER QUESTIONS - FIXED
// ============================================
function renderQuestions() {
  const container = $('questionsContainer');
  container.innerHTML = '';

  $('totalQuestions').textContent = questions.length;

  questions.forEach((q, index) => {
    const card = document.createElement('div');
    card.className = 'card slide-in';
    card.style.animationDelay = `${index * 0.05}s`;

    let content = `
                    <span class="question-number">Soal ${q.no || index + 1}</span>
                    <div class="question-text">${q.pertanyaan}</div>
                `;

    if (q.tipe === 'pilihan_ganda') {
      const options = ['a', 'b', 'c', 'd'];
      const optionLabels = [q.pilihan_a, q.pilihan_b, q.pilihan_c, q.pilihan_d];

      content += `<div class="options" data-qindex="${index}">`;
      options.forEach((opt, i) => {
        if (optionLabels[i]) {
          content += `
                                <div class="option" data-value="${opt}" data-qindex="${index}">
                                    <span class="option-indicator"></span>
                                    <span class="option-text">${optionLabels[i]}</span>
                                </div>
                            `;
        }
      });
      content += '</div>';
    } else if (q.tipe === 'isian') {
      content += `
                        <input type="text" 
                               class="input-field" 
                               id="input-${index}" 
                               placeholder="Ketik jawaban Anda..." 
                               oninput="saveInput(${index}, this.value)"
                               autocomplete="off">
                        <div class="input-hint">💡 Beberapa alternatif jawaban mungkin diterima</div>
                    `;
    }

    card.innerHTML = content;
    container.appendChild(card);
  });

  // Attach event listeners after DOM insertion
  attachOptionListeners();
  updateProgress();
}

// ============================================
// OPTION SELECTION - FIXED
// ============================================
function attachOptionListeners() {
  document.querySelectorAll('.option').forEach((option) => {
    // Remove any existing listeners by cloning
    const newOption = option.cloneNode(true);
    option.parentNode.replaceChild(newOption, option);

    newOption.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const qIndex = parseInt(this.dataset.qindex);
      const value = this.dataset.value;

      selectOption(qIndex, value);
    });
  });
}

function selectOption(qIndex, value) {
  // Save answer
  userAnswers[qIndex] = value;

  // Find the options container for this question
  const optionsContainer = document.querySelector(`.options[data-qindex="${qIndex}"]`);
  if (!optionsContainer) return;

  // Remove selected class from all options in this question
  optionsContainer.querySelectorAll('.option').forEach((opt) => {
    opt.classList.remove('selected');
  });

  // Add selected class to clicked option
  const selectedOption = optionsContainer.querySelector(`.option[data-value="${value}"]`);
  if (selectedOption) {
    selectedOption.classList.add('selected');
  }

  updateProgress();
}

function saveInput(qIndex, value) {
  userAnswers[qIndex] = value.trim();
  updateProgress();
}

function updateProgress() {
  const answered = Object.keys(userAnswers).filter((k) => userAnswers[k] !== '').length;
  $('currentQuestion').textContent = answered;
}

// ============================================
// TIMER
// ============================================
function startTimer() {
  updateTimerDisplay();

  timer = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();

    if (timeRemaining <= 0) {
      clearInterval(timer);
      openModal('timeUpModal');
    }
  }, 1000);
}

function updateTimerDisplay() {
  const display = $('timerText');
  const timerContainer = $('timerDisplay');

  display.textContent = formatTime(timeRemaining);

  timerContainer.classList.remove('warning', 'danger');

  if (timeRemaining <= 60) {
    timerContainer.classList.add('danger');
  } else if (timeRemaining <= 300) {
    timerContainer.classList.add('warning');
  }
}

// ============================================
// START QUIZ
// ============================================
function startQuiz() {
  const name = $('userName').value.trim();

  if (!name) {
    alert('Silakan masukkan nama Anda terlebih dahulu!');
    $('userName').focus();
    return;
  }

  userName = name;
  showPage('loadingPage');
  fetchQuestions();
}

// ============================================
// CONFIRMATION
// ============================================
function confirmSubmit() {
  const answered = Object.keys(userAnswers).filter((k) => userAnswers[k] !== '').length;
  const total = questions.length;
  const unanswered = total - answered;

  let text = '';
  if (unanswered > 0) {
    text = `Anda belum menjawab ${unanswered} soal dari ${total} soal. Yakin ingin mengirim?`;
  } else {
    text = 'Semua soal telah dijawab. Yakin ingin mengirim jawaban?';
  }

  $('confirmText').textContent = text;
  openModal('confirmModal');
}

function forceSubmit() {
  closeModal();
  submitQuiz();
}

// ============================================
// SUBMIT & SCORING
// ============================================
async function submitQuiz() {
  if (isSubmitted) return;
  isSubmitted = true;

  clearInterval(timer);
  closeModal();

  let correct = 0;
  const total = questions.length;

  questions.forEach((q, index) => {
    const answer = (userAnswers[index] || '').toString().trim().toLowerCase();

    if (q.tipe === 'pilihan_ganda') {
      if (answer === q.jawaban_benar.toString().trim().toLowerCase()) {
        correct++;
      }
    } else if (q.tipe === 'isian') {
      const correctAnswers = q.jawaban_benar
        .toString()
        .toLowerCase()
        .split(',')
        .map((s) => s.trim());
      const alternatif = q.alternatif_jawaban || [];
      const allValidAnswers = [...correctAnswers, ...alternatif];

      if (allValidAnswers.includes(answer)) {
        correct++;
      }
    }
  });

  const score = correct;
  const percentage = Math.round((correct / total) * 100);

  await sendResults(score, percentage);
  showResults(score, percentage, correct, total);
}

async function sendResults(score, percentage) {
  const data = {
    nama: userName,
    skor: score,
    persentase: percentage + '%',
    tanggal: new Date().toLocaleDateString('id-ID'),
    waktu_selesai: new Date().toLocaleTimeString('id-ID'),
  };

  try {
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Error sending results:', error);
  }
}

function showResults(score, percentage, correct, total) {
  showPage('resultPage');

  $('resultName').textContent = userName;
  $('resultScore').textContent = score;
  $('resultCorrect').textContent = correct;
  $('resultTotal').textContent = total;
  $('scorePercent').textContent = percentage + '%';

  setTimeout(() => {
    const circle = $('scoreCircle');
    const circumference = 2 * Math.PI * 90;
    const offset = circumference - (percentage / 100) * circumference;
    circle.style.strokeDashoffset = offset;
  }, 300);
}

// ============================================
// KEYBOARD SUPPORT
// ============================================
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !$('landingPage').classList.contains('hidden')) {
    startQuiz();
  }
});

// ============================================
// PREVENT SCROLL REFRESH (iOS)
// ============================================
let touchStartY = 0;

document.addEventListener(
  'touchstart',
  (e) => {
    touchStartY = e.touches[0].clientY;
  },
  { passive: true },
);

document.addEventListener(
  'touchmove',
  (e) => {
    const touchY = e.touches[0].clientY;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

    if (scrollTop <= 0 && touchY > touchStartY) {
      e.preventDefault();
    }
  },
  { passive: false },
);

document.body.style.overscrollBehaviorY = 'none';

// Manuel Neuer Fan Portal - Interactive Engine

document.addEventListener('DOMContentLoaded', () => {

  // ================= 1. Sound FX Generator (Web Audio API) =================
  const audioCtx = (window.AudioContext || window.webkitAudioContext) ? new (window.AudioContext || window.webkitAudioContext)() : null;

  function playTone(freq, type, duration) {
    if (!audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.log('Audio disabled');
    }
  }

  function playSaveSound() {
    // Whistle/Cheer high chirp
    playTone(587.33, 'triangle', 0.15);
    setTimeout(() => playTone(880, 'sine', 0.25), 100);
  }

  function playGoalSound() {
    // Low buzzer
    playTone(180, 'sawtooth', 0.35);
  }

  // ================= 2. Mobile Menu Toggle =================
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const menuIcon = document.getElementById('menuIcon');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      if (mobileMenu.classList.contains('hidden')) {
        menuIcon.classList.replace('fa-xmark', 'fa-bars');
      } else {
        menuIcon.classList.replace('fa-bars', 'fa-xmark');
      }
    });

    document.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        menuIcon.classList.replace('fa-xmark', 'fa-bars');
      });
    });
  }

  // ================= 3. Biography Tabs =================
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');

      tabBtns.forEach(b => {
        b.classList.remove('active', 'text-white');
        b.classList.add('text-gray-400');
      });
      btn.classList.add('active', 'text-white');
      btn.classList.remove('text-gray-400');

      tabPanes.forEach(pane => {
        if (pane.id === targetId) {
          pane.classList.remove('hidden');
          pane.classList.add('grid');
        } else {
          pane.classList.add('hidden');
          pane.classList.remove('grid');
        }
      });
    });
  });

  // ================= 4. Number Counters with IntersectionObserver =================
  const counters = document.querySelectorAll('.counter');
  let hasAnimatedCounters = false;

  const countUpObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimatedCounters) {
        hasAnimatedCounters = true;
        counters.forEach(counter => {
          const target = +counter.getAttribute('data-target');
          const duration = 1800; // ms
          const stepTime = 20;
          const totalSteps = duration / stepTime;
          const increment = target / totalSteps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              counter.innerText = target;
              clearInterval(timer);
            } else {
              counter.innerText = Math.ceil(current);
            }
          }, stepTime);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.querySelector('.counter');
  if (statsSection) {
    countUpObserver.observe(statsSection.closest('section'));
  }

  // ================= 5. Penalty Shootout Mini-Game =================
  let savesCount = 0;
  let goalsConceded = 0;
  let streak = 0;
  let isGameBusy = false;

  const savesEl = document.getElementById('gameScoreSaves');
  const goalsEl = document.getElementById('gameScoreGoals');
  const streakEl = document.getElementById('gameStreak');
  const gameMsgEl = document.getElementById('gameMessage');
  const keeperAvatar = document.getElementById('keeperAvatar');
  const ballIndicator = document.getElementById('ballIndicator');
  const resetGameBtn = document.getElementById('resetGameBtn');
  const zoneBtns = document.querySelectorAll('.goal-zone');

  const zoneCoordinates = {
    'top-left': { x: -140, y: -45, rot: -30 },
    'top-center': { x: 0, y: -50, rot: 0 },
    'top-right': { x: 140, y: -45, rot: 30 },
    'bottom-left': { x: -120, y: 35, rot: -45 },
    'bottom-center': { x: 0, y: 30, rot: 0 },
    'bottom-right': { x: 120, y: 35, rot: 45 },
  };

  const zonesList = Object.keys(zoneCoordinates);

  zoneBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isGameBusy) return;
      const userSelectedZone = btn.getAttribute('data-zone');
      playPenaltyTurn(userSelectedZone);
    });
  });

  function playPenaltyTurn(userZone) {
    isGameBusy = true;
    gameMsgEl.innerText = 'Zarba yo\'llandi...!';
    gameMsgEl.className = 'text-sm sm:text-base font-bold text-yellow-300 px-4 py-1.5 rounded-full bg-gray-950/90 border border-yellow-500/50 shadow-md animate-pulse';

    // Random shooter target zone
    const randomShooterZone = zonesList[Math.floor(Math.random() * zonesList.length)];
    const userCoord = zoneCoordinates[userZone];
    const ballCoord = zoneCoordinates[randomShooterZone];

    // Animate Keeper dive
    keeperAvatar.style.setProperty('--dive-x', `${userCoord.x}px`);
    keeperAvatar.style.setProperty('--dive-y', `${userCoord.y}px`);
    keeperAvatar.style.setProperty('--dive-rot', `${userCoord.rot}deg`);
    keeperAvatar.classList.remove('animate-bounce');
    keeperAvatar.classList.add('keeper-dive');

    // Animate Ball
    ballIndicator.style.setProperty('--target-x', `${ballCoord.x}px`);
    ballIndicator.style.setProperty('--target-y', `${ballCoord.y}px`);
    ballIndicator.classList.remove('scale-0', 'opacity-0');
    ballIndicator.classList.add('ball-animating');

    // Evaluate result after animation finishes
    setTimeout(() => {
      const isSaved = (userZone === randomShooterZone);

      if (isSaved) {
        savesCount++;
        streak++;
        playSaveSound();
        gameMsgEl.innerHTML = `<span class="text-emerald-400">🔥 AJOYIB SEYV!</span> Manuel Neuer to'pni qaytardi!`;
        gameMsgEl.className = 'text-sm sm:text-base font-bold text-emerald-400 px-4 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-500 shadow-md';
      } else {
        goalsConceded++;
        streak = 0;
        playGoalSound();
        const zoneNamesUz = {
          'top-left': 'Yuqori Chap',
          'top-center': 'Markaz Yuqori',
          'top-right': 'Yuqori O\'ng',
          'bottom-left': 'Pastki Chap',
          'bottom-center': 'Pastki Markaz',
          'bottom-right': 'Pastki O\'ng'
        };
        gameMsgEl.innerHTML = `<span class="text-red-400">⚽ GOL!</span> Hujumchi <i>${zoneNamesUz[randomShooterZone]}</i> burchagiga tepdi.`;
        gameMsgEl.className = 'text-sm sm:text-base font-bold text-red-400 px-4 py-1.5 rounded-full bg-red-950/90 border border-red-500 shadow-md';
      }

      savesEl.innerText = savesCount;
      goalsEl.innerText = goalsConceded;
      streakEl.innerText = streak;

      // Reset keeper position after delay
      setTimeout(() => {
        keeperAvatar.classList.remove('keeper-dive');
        keeperAvatar.style.transform = 'none';
        keeperAvatar.classList.add('animate-bounce');
        ballIndicator.classList.remove('ball-animating');
        ballIndicator.classList.add('scale-0', 'opacity-0');
        isGameBusy = false;
      }, 1400);

    }, 550);
  }

  if (resetGameBtn) {
    resetGameBtn.addEventListener('click', () => {
      savesCount = 0;
      goalsConceded = 0;
      streak = 0;
      savesEl.innerText = '0';
      goalsEl.innerText = '0';
      streakEl.innerText = '0';
      gameMsgEl.innerText = 'Hisob yangilandi. Qaytadan urinib ko\'ring!';
      gameMsgEl.className = 'text-sm sm:text-base font-bold text-white px-4 py-1.5 rounded-full bg-gray-950/90 border border-gray-700 shadow-md';
    });
  }

  // ================= 6. Manuel Neuer Quiz System =================
  const quizData = [
    {
      question: "Manuel Neuer 2014-yilgi Jahon Chempionatida qaysi terma jamoaga qarshi 'Sweeper-Keeper' mahoratini eng yuqori darajada ko'rsatgan?",
      options: [
        "Braziliya (7:1 hisobidagi yarim final)",
        "Jazoir (1/8 final o'yini)",
        "Argentina (Final)",
        "Fransiya (1/4 final)"
      ],
      correct: 1,
      explanation: "Jazoirga qarshi o'yinda Neuer 19 marta jarima maydonidan chiqib himoyachi kabi o'ynagan."
    },
    {
      question: "Manuel Neuer professional futboldagi faoliyatini qaysi klubda boshlagan?",
      options: [
        "Borussia Dortmund",
        "Bayern Munich",
        "Schalke 04",
        "VfB Stuttgart"
      ],
      correct: 2,
      explanation: "U 1991-yildan 2011-yilgacha o'zining ona shahri klubi 'Schalke 04' safida to'p surgan."
    },
    {
      question: "Neuer faoliyati davomida 'IFFHS Dunyoning Eng Yaxshi Darvozaboni' unvoniga necha marta loyiq ko'rilgan?",
      options: [
        "3 marta",
        "4 marta",
        "5 marta",
        "6 marta"
      ],
      correct: 2,
      explanation: "Neuer 5 marta (2013, 2014, 2015, 2016, 2020) dunyoning eng yaxshi darvozaboni deb topilgan (Iker Kasilyas va Buffon bilan teng rekord)."
    },
    {
      question: "Manuel Neuer 2014-yilgi 'Oltin to'p' (Ballon d'Or) so'rovnomasida qaysi o'rinni egallagan?",
      options: [
        "1-o'rin (G'olib bo'lgan)",
        "2-o'rin (Messi ortida)",
        "3-o'rin (Ronaldu va Messidan keyin)",
        "5-o'rin"
      ],
      correct: 2,
      explanation: "Neuer 2014-yilda Ronaldu va Messidan so'ng 3-o'rinni egalladi, bu darvozabonlar uchun ulkan natijadir."
    },
    {
      question: "Neuer Bayern Munich bilan necha marotaba 'Trebl' (mavsumda barcha 3 asosiy kubok) qayd etgan?",
      options: [
        "1 marta (2013)",
        "2 marta (2013 va 2020)",
        "3 marta",
        "Hech qachon"
      ],
      correct: 1,
      explanation: "Manuel Neuer tarixdagi ikki karra Trebl yutgan sanoqli posbonlardan biridir (2013 va 2020 yillarda)."
    }
  ];

  let currentQuestionIndex = 0;
  let quizScore = 0;
  let answerLocked = false;

  const quizQuestionTitle = document.getElementById('quizQuestionTitle');
  const quizOptionsContainer = document.getElementById('quizOptionsContainer');
  const quizProgressText = document.getElementById('quizProgressText');
  const quizProgressBar = document.getElementById('quizProgressBar');
  const quizQuestionBox = document.getElementById('quizQuestionBox');
  const quizResultBox = document.getElementById('quizResultBox');
  const quizScoreTitle = document.getElementById('quizScoreTitle');
  const quizRankText = document.getElementById('quizRankText');
  const quizRestartBtn = document.getElementById('quizRestartBtn');

  function loadQuizQuestion() {
    answerLocked = false;
    const currentQ = quizData[currentQuestionIndex];
    quizQuestionTitle.innerText = `${currentQuestionIndex + 1}. ${currentQ.question}`;
    quizProgressText.innerText = `Savol: ${currentQuestionIndex + 1} / ${quizData.length}`;
    quizProgressBar.style.width = `${((currentQuestionIndex + 1) / quizData.length) * 100}%`;

    quizOptionsContainer.innerHTML = '';

    currentQ.options.forEach((optText, index) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt-btn w-full text-left p-4 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700/80 text-white font-medium text-sm flex items-start gap-3';
      btn.innerHTML = `
        <span class="w-6 h-6 rounded-full bg-gray-800 text-xs flex items-center justify-center font-bold text-gray-300 shrink-0 border border-gray-700">
          ${String.fromCharCode(65 + index)}
        </span>
        <span class="leading-relaxed">${optText}</span>
      `;

      btn.addEventListener('click', () => {
        if (answerLocked) return;
        selectQuizAnswer(index, btn);
      });

      quizOptionsContainer.appendChild(btn);
    });
  }

  function selectQuizAnswer(selectedIndex, buttonElement) {
    answerLocked = true;
    const currentQ = quizData[currentQuestionIndex];
    const isCorrect = (selectedIndex === currentQ.correct);

    const allButtons = quizOptionsContainer.querySelectorAll('.quiz-opt-btn');

    if (isCorrect) {
      quizScore++;
      buttonElement.classList.add('correct');
      playSaveSound();
    } else {
      buttonElement.classList.add('wrong');
      allButtons[currentQ.correct].classList.add('correct');
      playGoalSound();
    }

    setTimeout(() => {
      currentQuestionIndex++;
      if (currentQuestionIndex < quizData.length) {
        loadQuizQuestion();
      } else {
        showQuizResults();
      }
    }, 1200);
  }

  function showQuizResults() {
    quizQuestionBox.classList.add('hidden');
    quizResultBox.classList.remove('hidden');

    quizScoreTitle.innerText = `Natijangiz: ${quizScore} / ${quizData.length}`;

    if (quizScore === 5) {
      quizRankText.innerText = "🏆 SIZ HAQIQIY NEUER MUTAXASSISISIZ! Manuel Neuerning faoliyatini 100% bilasiz, siz haqiqiy Der Titan muxlisisiz!";
    } else if (quizScore >= 3) {
      quizRankText.innerText = "👏 Ajoyib natija! Siz Manuel Neuer haqida juda ko'p ma'lumotga egasiz va uning o'yinlarini muntazam kuzatasiz.";
    } else {
      quizRankText.innerText = "⚽ Yomon emas! Sahifamizdagi tarjimai hol va yutuqlar bo'limlarini o'qib chiqib, yana bir bor sinab ko'rishingiz mumkin.";
    }
  }

  if (quizRestartBtn) {
    quizRestartBtn.addEventListener('click', () => {
      currentQuestionIndex = 0;
      quizScore = 0;
      quizResultBox.classList.add('hidden');
      quizQuestionBox.classList.remove('hidden');
      loadQuizQuestion();
    });
  }

  // Initial Quiz load
  if (quizQuestionTitle) {
    loadQuizQuestion();
  }

  // ================= 7. Quotes Modal =================
  const famousQuotes = [
    "Men xatoga yo'l qo'yishdan qo'rqmayman. Agar siz to'p ortidan yugurishda 1 soniya ikkilansangiz, raqib allaqachon gol urgan bo'ladi. Dadillik — darvozabonning bosh quroli!",
    "Mening vazifam faqat darvoza to'sini ostida turish emas. Men butun jamoamga nafas beraman, ularning orqa tarafini to'liq qoplab turaman.",
    "Braziliyadagi 2014-yilgi Jahon Kubogi — bu bizning orzularimizning eng yuksak cho'qqisi bo'ldi. O'sha oltin kubokni qo'lga olgan lahzani hech qachon unutmayman.",
    "Har bir og'ir jarohat — bu sizning o'yinni qanchalik sevishingizni sinaydigan imtihon. Men har gal maydonga yanada kuchliroq bo'lib qaytganman."
  ];

  let currentQuoteIndex = 0;
  const quoteSoundBtn = document.getElementById('quoteSoundBtn');
  const quoteModal = document.getElementById('quoteModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const nextQuoteBtn = document.getElementById('nextQuoteBtn');
  const modalQuoteContent = document.getElementById('modalQuoteContent');

  function openQuoteModal() {
    quoteModal.classList.remove('hidden');
    setTimeout(() => {
      quoteModal.classList.remove('opacity-0');
    }, 10);
    modalQuoteContent.innerText = famousQuotes[currentQuoteIndex];
  }

  function closeQuoteModal() {
    quoteModal.classList.add('opacity-0');
    setTimeout(() => {
      quoteModal.classList.add('hidden');
    }, 300);
  }

  if (quoteSoundBtn) {
    quoteSoundBtn.addEventListener('click', openQuoteModal);
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeQuoteModal);
  }

  if (quoteModal) {
    quoteModal.addEventListener('click', (e) => {
      if (e.target === quoteModal) closeQuoteModal();
    });
  }

  if (nextQuoteBtn) {
    nextQuoteBtn.addEventListener('click', () => {
      currentQuoteIndex = (currentQuoteIndex + 1) % famousQuotes.length;
      modalQuoteContent.innerText = famousQuotes[currentQuoteIndex];
    });
  }

});

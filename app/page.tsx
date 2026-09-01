'use client';

import React, { useState, useMemo, useCallback, useSyncExternalStore } from 'react';
import { VOCABULARY_LIST, VocabularyWord, UNITS } from '@/lib/vocabularyData';
import { ProgressHeader } from '@/components/ProgressHeader';
import { WordCard } from '@/components/WordCard';
import { QuizScreen } from '@/components/QuizScreen';
import { WordListModal } from '@/components/WordListModal';
import { SessionSummaryModal } from '@/components/SessionSummaryModal';
import { ChatAssistant } from '@/components/ChatAssistant';
import { soundManager } from '@/lib/soundEffects';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, BookOpen, GraduationCap, ArrowRight, RotateCcw } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const subscribeStorage = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('grade6_storage_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('grade6_storage_change', callback);
  };
};

const notifyStorageChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('grade6_storage_change'));
  }
};

export default function EnglishWordApp() {
  const { user, syncProgress } = useAuth();

  // Unit & Word Selection State
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [activeWordIndex, setActiveWordIndex] = useState<number>(0);
  
  // 5-Word Cycle State
  const [cycleWords, setCycleWords] = useState<VocabularyWord[]>([]);
  const [cycleEvaluations, setCycleEvaluations] = useState<{ isCorrect: boolean; answer: string }[]>([]);
  const [isQuizMode, setIsQuizMode] = useState<boolean>(false);

  // SSR-safe external store for localStorage (guarantees zero hydration mismatch)
  const masteredStorageRaw = useSyncExternalStore(
    subscribeStorage,
    () => (typeof window !== 'undefined' ? localStorage.getItem('grade6_eng_mastered') || '[]' : '[]'),
    () => '[]'
  );

  const totalStudiedStorageRaw = useSyncExternalStore(
    subscribeStorage,
    () => (typeof window !== 'undefined' ? localStorage.getItem('grade6_eng_total') || '0' : '0'),
    () => '0'
  );

  // When user logs in, populate localStorage with database profile if empty
  React.useEffect(() => {
    if (user) {
      if (user.masteredWordIds && user.masteredWordIds.length > 0) {
        try {
          const currentLocal = JSON.parse(localStorage.getItem('grade6_eng_mastered') || '[]');
          const combined = Array.from(new Set([...currentLocal, ...user.masteredWordIds]));
          localStorage.setItem('grade6_eng_mastered', JSON.stringify(combined));
        } catch {
          localStorage.setItem('grade6_eng_mastered', JSON.stringify(user.masteredWordIds));
        }
      }
      if (user.totalStudied > 0) {
        const localTotal = parseInt(localStorage.getItem('grade6_eng_total') || '0', 10) || 0;
        if (user.totalStudied > localTotal) {
          localStorage.setItem('grade6_eng_total', user.totalStudied.toString());
        }
      }
      notifyStorageChange();
    }
  }, [user]);

  const masteredWordIds = useMemo<string[]>(() => {
    try {
      const parsed = JSON.parse(masteredStorageRaw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [masteredStorageRaw]);

  const totalStudiedCount = useMemo<number>(() => {
    const val = parseInt(totalStudiedStorageRaw, 10);
    return isNaN(val) ? 0 : val;
  }, [totalStudiedStorageRaw]);

  // Session-specific Progression Metrics
  const [quizzesCompletedCount, setQuizzesCompletedCount] = useState<number>(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [reviewedWordIds, setReviewedWordIds] = useState<string[]>([]);

  // Sound and Modals
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isWordListOpen, setIsWordListOpen] = useState<boolean>(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Filtered vocabulary based on unit
  const activeVocabulary = useMemo(() => {
    if (selectedUnit === 'all') return VOCABULARY_LIST;
    return VOCABULARY_LIST.filter((w) => w.unitId === selectedUnit);
  }, [selectedUnit]);

  const updateMasteredWords = useCallback((updater: (prev: string[]) => string[]) => {
    try {
      const current = JSON.parse(localStorage.getItem('grade6_eng_mastered') || '[]');
      const next = updater(Array.isArray(current) ? current : []);
      localStorage.setItem('grade6_eng_mastered', JSON.stringify(next));
      notifyStorageChange();
    } catch {
      // Ignore
    }
  }, []);

  const incrementTotalStudied = useCallback(() => {
    try {
      const current = parseInt(localStorage.getItem('grade6_eng_total') || '0', 10) || 0;
      localStorage.setItem('grade6_eng_total', (current + 1).toString());
      notifyStorageChange();
    } catch {
      // Ignore
    }
  }, []);

  // Handle word selection
  const currentWord = useMemo(() => {
    if (activeVocabulary.length === 0) return VOCABULARY_LIST[0];
    return activeVocabulary[activeWordIndex % activeVocabulary.length];
  }, [activeVocabulary, activeWordIndex]);

  // Toggle sound
  const handleToggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    soundManager.setSoundEnabled(newState);
  };

  // Switch Unit
  const handleSelectUnit = (unitId: string) => {
    setSelectedUnit(unitId);
    setActiveWordIndex(0);
    setCycleWords([]);
    setCycleEvaluations([]);
    setIsQuizMode(false);
  };

  // Evaluate student answer for current word card
  const handleAnswerEvaluated = (isCorrect: boolean, studentAnswer: string) => {
    incrementTotalStudied();
    let nextStreak = streak;
    let nextMastered = masteredWordIds;
    let nextReviewed = reviewedWordIds;

    if (isCorrect) {
      setCorrectAnswersCount((prev) => prev + 1);
      nextStreak = streak + 1;
      setStreak(nextStreak);
      if (!masteredWordIds.includes(currentWord.id)) {
        nextMastered = [...masteredWordIds, currentWord.id];
        updateMasteredWords((prev) => (prev.includes(currentWord.id) ? prev : [...prev, currentWord.id]));
      }
    } else {
      nextStreak = 0;
      setStreak(0);
      if (!reviewedWordIds.includes(currentWord.id)) {
        nextReviewed = [...reviewedWordIds, currentWord.id];
        setReviewedWordIds((prev) => [...prev, currentWord.id]);
      }
    }

    setCycleEvaluations((prev) => [...prev, { isCorrect, answer: studentAnswer }]);

    // Sync to PostgreSQL if user is logged in
    if (user) {
      syncProgress({
        totalStudied: totalStudiedCount + 1,
        streak: nextStreak,
        correctAnswers: correctAnswersCount + (isCorrect ? 1 : 0),
        masteredWordIds: nextMastered,
        reviewedWordIds: nextReviewed,
      });
    }
  };

  // Move to next word or trigger Quiz on 5th word
  const handleNextWord = () => {
    const updatedCycle = [...cycleWords, currentWord];
    setCycleWords(updatedCycle);

    if (updatedCycle.length >= 5) {
      // 5 kelime tamamlandı -> Mini Quiz ekranına geç!
      setIsQuizMode(true);
    } else {
      // Bir sonraki kelimeye geç
      setActiveWordIndex((prev) => (prev + 1) % activeVocabulary.length);
    }
  };

  // Complete Quiz handler
  const handleCompleteQuiz = (score: number, totalQuestions: number) => {
    const nextQuizzesCount = quizzesCompletedCount + 1;
    setQuizzesCompletedCount(nextQuizzesCount);
    
    if (user) {
      syncProgress({
        quizzesCompleted: nextQuizzesCount,
      });
    }

    // Reset cycle for the next 5 words
    setCycleWords([]);
    setCycleEvaluations([]);
    setIsQuizMode(false);
    // Advance to next word pool
    setActiveWordIndex((prev) => (prev + 1) % activeVocabulary.length);
  };

  // Restart the same 5-word quiz
  const handleRestartQuiz = () => {
    // Keep the same cycle words but restart quiz mode
    setIsQuizMode(false);
    setTimeout(() => {
      setIsQuizMode(true);
    }, 50);
  };

  // Direct practice selection from dictionary
  const handleSelectWordFromList = (word: VocabularyWord) => {
    const foundIdx = activeVocabulary.findIndex((w) => w.id === word.id);
    if (foundIdx !== -1) {
      setActiveWordIndex(foundIdx);
    } else {
      setSelectedUnit('all');
      const allIdx = VOCABULARY_LIST.findIndex((w) => w.id === word.id);
      setActiveWordIndex(allIdx !== -1 ? allIdx : 0);
    }
    setIsQuizMode(false);
  };

  return (
    <div className="min-h-screen bg-orange-50/70 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Header & Sticky Progress Tracker */}
      <ProgressHeader
        currentCycleCount={cycleWords.length}
        totalStudied={totalStudiedCount}
        streak={streak}
        selectedUnit={selectedUnit}
        onSelectUnit={handleSelectUnit}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenWordList={() => setIsWordListOpen(true)}
        onFinishSession={() => setIsSummaryOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        masteredCount={masteredWordIds.length}
      />

      {/* Main Learning Stage */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-4 sm:py-8 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {isQuizMode ? (
            <motion.div
              key="quiz-screen"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
            >
              <QuizScreen
                quizWords={cycleWords}
                onCompleteQuiz={handleCompleteQuiz}
                onRestartCycle={handleRestartQuiz}
              />
            </motion.div>
          ) : (
            <motion.div
              key={`word-card-${currentWord.id}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <WordCard
                wordData={currentWord}
                onAnswerEvaluated={handleAnswerEvaluated}
                onNextWord={handleNextWord}
                wordNumberInCycle={cycleWords.length + 1}
                totalStudied={totalStudiedCount}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Vibrant Palette Footer Bar */}
      <footer className="w-full bg-slate-900 border-t border-slate-800 px-6 sm:px-10 py-4 text-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Real-time stats indicators */}
          <div className="flex items-center gap-6 sm:gap-8 flex-wrap justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399]"></div>
              <span className="text-xs font-black text-slate-300 uppercase tracking-widest">
                DOĞRU: {correctAnswersCount}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-rose-400 rounded-full shadow-[0_0_8px_#fb7185]"></div>
              <span className="text-xs font-black text-slate-300 uppercase tracking-widest">
                ÖĞRENİLİYOR: {reviewedWordIds.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-400 rounded-full shadow-[0_0_8px_#fbbf24]"></div>
              <span className="text-xs font-black text-slate-300 uppercase tracking-widest">
                QUİZ: {quizzesCompletedCount}
              </span>
            </div>
          </div>

          {/* Quick links & shortcuts */}
          <div className="flex items-center gap-4 text-xs font-bold text-slate-400 flex-wrap justify-center">
            <span className="hidden md:inline text-slate-500">
              KLAVYE: ENTER (Kontrol Et)
            </span>
            <button
              onClick={() => setIsWordListOpen(true)}
              className="text-orange-400 hover:text-orange-300 transition-colors cursor-pointer hover:underline"
            >
              Kelime Defteri ({masteredWordIds.length}/{VOCABULARY_LIST.length})
            </button>
            <span>•</span>
            <button
              onClick={() => setIsSummaryOpen(true)}
              className="text-slate-300 hover:text-white transition-colors cursor-pointer hover:underline"
            >
              Mola &amp; Özet
            </button>
          </div>
        </div>
      </footer>

      {/* Word List / Dictionary Modal */}
      <WordListModal
        isOpen={isWordListOpen}
        onClose={() => setIsWordListOpen(false)}
        masteredWordIds={masteredWordIds}
        reviewedWordIds={reviewedWordIds}
        onSelectWordToPractice={handleSelectWordFromList}
      />

      {/* Session Summary / Break Modal */}
      <SessionSummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        onContinue={() => setIsSummaryOpen(false)}
        totalWordsStudied={totalStudiedCount}
        quizzesCompleted={quizzesCompletedCount}
        correctAnswersCount={correctAnswersCount}
        streak={streak}
      />

      {/* AI English Tutor Chat Assistant */}
      <ChatAssistant
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onOpen={() => setIsChatOpen(true)}
        currentWord={isQuizMode ? undefined : currentWord}
      />
    </div>
  );
}

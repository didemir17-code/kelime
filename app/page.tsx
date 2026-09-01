'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { VOCABULARY_LIST, VocabularyWord, UNITS } from '@/lib/vocabularyData';
import { ProgressHeader } from '@/components/ProgressHeader';
import { WordCard } from '@/components/WordCard';
import { QuizScreen } from '@/components/QuizScreen';
import { WordListModal } from '@/components/WordListModal';
import { SessionSummaryModal } from '@/components/SessionSummaryModal';
import { soundManager } from '@/lib/soundEffects';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, BookOpen, GraduationCap, ArrowRight, RotateCcw } from 'lucide-react';

export default function EnglishWordApp() {
  // Unit & Word Selection State
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [activeWordIndex, setActiveWordIndex] = useState<number>(0);
  
  // 5-Word Cycle State
  const [cycleWords, setCycleWords] = useState<VocabularyWord[]>([]);
  const [cycleEvaluations, setCycleEvaluations] = useState<{ isCorrect: boolean; answer: string }[]>([]);
  const [isQuizMode, setIsQuizMode] = useState<boolean>(false);

  // Overall Progression Metrics
  const [totalStudiedCount, setTotalStudiedCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('grade6_eng_total');
        if (saved) return parseInt(saved, 10);
      } catch {
        // ignore
      }
    }
    return 0;
  });
  const [quizzesCompletedCount, setQuizzesCompletedCount] = useState<number>(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [masteredWordIds, setMasteredWordIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('grade6_eng_mastered');
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [];
  });
  const [reviewedWordIds, setReviewedWordIds] = useState<string[]>([]);

  // Sound and Modals
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isWordListOpen, setIsWordListOpen] = useState<boolean>(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState<boolean>(false);

  // Filtered vocabulary based on unit
  const activeVocabulary = useMemo(() => {
    if (selectedUnit === 'all') return VOCABULARY_LIST;
    return VOCABULARY_LIST.filter((w) => w.unitId === selectedUnit);
  }, [selectedUnit]);

  // Save progress changes
  useEffect(() => {
    try {
      localStorage.setItem('grade6_eng_mastered', JSON.stringify(masteredWordIds));
      localStorage.setItem('grade6_eng_total', totalStudiedCount.toString());
    } catch {
      // Ignore
    }
  }, [masteredWordIds, totalStudiedCount]);

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
    setTotalStudiedCount((prev) => prev + 1);
    if (isCorrect) {
      setCorrectAnswersCount((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      if (!masteredWordIds.includes(currentWord.id)) {
        setMasteredWordIds((prev) => [...prev, currentWord.id]);
      }
    } else {
      setStreak(0);
      if (!reviewedWordIds.includes(currentWord.id)) {
        setReviewedWordIds((prev) => [...prev, currentWord.id]);
      }
    }

    setCycleEvaluations((prev) => [...prev, { isCorrect, answer: studentAnswer }]);
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
    setQuizzesCompletedCount((prev) => prev + 1);
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
    </div>
  );
}

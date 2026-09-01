'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { VocabularyWord, VOCABULARY_LIST } from '@/lib/vocabularyData';
import { soundManager } from '@/lib/soundEffects';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Volume2, 
  ArrowRight, 
  RotateCcw, 
  Sparkles,
  Award,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QuizScreenProps {
  quizWords: VocabularyWord[];
  onCompleteQuiz: (score: number, totalQuestions: number) => void;
  onRestartCycle: () => void;
}

interface QuizQuestion {
  id: number;
  type: 'tr_to_en' | 'en_to_tr' | 'fill_blank' | 'audio_listen' | 'clue_match';
  targetWord: VocabularyWord;
  prompt: string;
  subPrompt?: string;
  options: string[];
  correctAnswer: string;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
  quizWords,
  onCompleteQuiz,
  onRestartCycle,
}) => {
  // Generate 5 questions from the 5 quiz words
  const questions: QuizQuestion[] = useMemo(() => {
    if (!quizWords || quizWords.length === 0) return [];

    // Distractor pool
    const allDistractorWords = VOCABULARY_LIST.filter(
      (w) => !quizWords.some((qw) => qw.id === w.id)
    );

    return quizWords.map((word, index) => {
      const otherWords = quizWords.filter((w) => w.id !== word.id);
      
      // Select 3 distractors
      const pool = [...otherWords, ...allDistractorWords].sort(() => 0.5 - Math.random());
      
      if (index === 0) {
        // Türkçe -> İngilizce
        const distractors = pool.slice(0, 3).map((w) => w.word);
        const options = [word.word, ...distractors].sort(() => 0.5 - Math.random());
        return {
          id: index + 1,
          type: 'tr_to_en',
          targetWord: word,
          prompt: `"${word.meaning}" kelimesinin İngilizce karşılığı hangisidir?`,
          options,
          correctAnswer: word.word,
        };
      } else if (index === 1) {
        // İngilizce -> Türkçe
        const distractors = pool.slice(0, 3).map((w) => w.meaning);
        const options = [word.meaning, ...distractors].sort(() => 0.5 - Math.random());
        return {
          id: index + 1,
          type: 'en_to_tr',
          targetWord: word,
          prompt: `"${word.word}" kelimesinin Türkçe anlamı nedir?`,
          subPrompt: `Telaffuz: ${word.pronunciation}`,
          options,
          correctAnswer: word.meaning,
        };
      } else if (index === 2) {
        // Boşluk doldurma
        const distractors = pool.slice(0, 3).map((w) => w.word);
        const options = [word.word, ...distractors].sort(() => 0.5 - Math.random());
        return {
          id: index + 1,
          type: 'fill_blank',
          targetWord: word,
          prompt: `Cümledeki boşluğa hangi kelime gelmelidir?`,
          subPrompt: word.questionSentence,
          options,
          correctAnswer: word.word,
        };
      } else if (index === 3) {
        // Dinle ve Bul
        const distractors = pool.slice(0, 3).map((w) => w.word);
        const options = [word.word, ...distractors].sort(() => 0.5 - Math.random());
        return {
          id: index + 1,
          type: 'audio_listen',
          targetWord: word,
          prompt: `Ses kaydını dinleyin ve telaffuz edilen kelimeyi seçin:`,
          options,
          correctAnswer: word.word,
        };
      } else {
        // İpucu / Tanım Eşleştirme
        const distractors = pool.slice(0, 3).map((w) => w.word);
        const options = [word.word, ...distractors].sort(() => 0.5 - Math.random());
        return {
          id: index + 1,
          type: 'clue_match',
          targetWord: word,
          prompt: `İpucu: "${word.clue || word.sampleSentenceTr}"`,
          subPrompt: `Bu ipucu hangi 6. sınıf kelimesini anlatmaktadır?`,
          options,
          correctAnswer: word.word,
        };
      }
    });
  }, [quizWords]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answersHistory, setAnswersHistory] = useState<{ isCorrect: boolean; word: VocabularyWord }[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQ = questions[currentIdx];

  // Auto-speak audio for listening questions
  useEffect(() => {
    if (currentQ && currentQ.type === 'audio_listen') {
      soundManager.speak(currentQ.targetWord.word, 'en-US');
    }
  }, [currentIdx, currentQ]);

  const handleSelectOption = (option: string) => {
    if (isAnswered || !currentQ) return;

    setSelectedAnswer(option);
    setIsAnswered(true);

    const isCorrect = option === currentQ.correctAnswer;

    if (isCorrect) {
      soundManager.playCorrect();
      setScore((prev) => prev + 1);
    } else {
      soundManager.playWrong();
    }

    setAnswersHistory((prev) => [
      ...prev,
      { isCorrect, word: currentQ.targetWord },
    ]);
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      // Quiz finished
      setQuizFinished(true);
      soundManager.playFanfare();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Ignore confetti error
      }
    }
  };

  if (!currentQ && !quizFinished) {
    return (
      <div className="text-center py-12 text-slate-500">
        Quiz yükleniyor...
      </div>
    );
  }

  // Quiz Finished Results View
  if (quizFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    let badgeTitle = '6. Sınıf Kelime Şampiyonu!';
    let badgeColor = 'from-amber-400 to-orange-500 text-white';
    let feedback = 'Mükemmel bir başarı! 5 kelimenin hepsini hafızana kazıdın.';

    if (percentage === 100) {
      badgeTitle = '🏆 Kusursuz 5/5 Şampiyon!';
      badgeColor = 'from-emerald-400 to-teal-600 text-white';
      feedback = 'Tebrikler! 6. sınıf kelime bilgin tam puan aldı!';
    } else if (percentage >= 80) {
      badgeTitle = '⭐ Yıldız Öğrenci (4/5)';
      badgeColor = 'from-indigo-500 to-purple-600 text-white';
      feedback = 'Harika bir performans! Çok az hatayla tamamladın.';
    } else if (percentage >= 60) {
      badgeTitle = '🌱 İyi İlerleme (3/5)';
      badgeColor = 'from-sky-500 to-blue-600 text-white';
      feedback = 'Güzel çalışma! Birkaç tekrarla daha da yükseleceksin.';
    } else {
      badgeTitle = '💪 Gayretli Öğrenci';
      badgeColor = 'from-amber-500 to-rose-500 text-white';
      feedback = 'Her deneme seni daha iyi yapar! Tekrar ederek güçleneceksin.';
    }

    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-4 sm:py-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[32px] sm:rounded-[40px] border border-orange-100 border-b-8 border-slate-200 shadow-[0_20px_50px_rgba(249,115,22,0.15)] overflow-hidden text-center"
        >
          {/* Header Banner */}
          <div className="bg-slate-900 text-white px-6 py-8 space-y-3 relative overflow-hidden">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30 transform -rotate-3 mx-auto">
              <Trophy className="w-9 h-9" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Mini Quiz Tamamlandı! 🏆
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-semibold">
              5 kelimelik çalışma döngüsünü başarıyla bitirdin
            </p>
          </div>

          <div className="p-6 sm:p-10 space-y-6">
            {/* Score Pill & Badge */}
            <div className="space-y-3">
              <div className="inline-block px-6 py-2.5 rounded-2xl text-base sm:text-lg font-black bg-orange-50 border-2 border-orange-200 text-slate-900 shadow-2xs">
                Skor: <span className="text-orange-600 font-black text-2xl">{score}</span> / {questions.length} Doğru (%{percentage})
              </div>
              <div>
                <div className={`px-5 py-2.5 rounded-2xl bg-linear-to-r ${badgeColor} font-black text-sm shadow-md inline-block`}>
                  {badgeTitle}
                </div>
              </div>
              <p className="text-sm sm:text-base text-slate-600 font-bold max-w-md mx-auto">
                {feedback}
              </p>
            </div>

            {/* Word Review Table */}
            <div className="text-left space-y-3 pt-4 border-t-2 border-slate-100">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Çalışılan 5 Kelime Özeti:
              </h3>
              <div className="divide-y divide-slate-100 rounded-2xl border-2 border-slate-200 overflow-hidden bg-slate-50 shadow-2xs">
                {quizWords.map((word) => {
                  const historyItem = answersHistory.find((h) => h.word.id === word.id);
                  const isCorrect = historyItem ? historyItem.isCorrect : true;

                  return (
                    <div
                      key={word.id}
                      className="p-3.5 sm:p-4 flex items-center justify-between bg-white hover:bg-orange-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {isCorrect ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="w-6 h-6 text-rose-500 shrink-0" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-base sm:text-lg">
                              {word.word}
                            </span>
                            <span className="text-xs text-indigo-600 font-mono font-bold">
                              {word.pronunciation}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 font-semibold">{word.meaning}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => soundManager.speak(word.word, 'en-US')}
                        className="p-2.5 rounded-xl border-2 border-slate-200 hover:border-orange-300 text-orange-600 bg-white hover:bg-orange-50 transition-all cursor-pointer shadow-2xs"
                        title="Telaffuzu Dinle"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                id="btn-restart-quiz"
                onClick={onRestartCycle}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-black text-slate-700 bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 rounded-2xl transition-all cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Bu 5 Kelimeyi Tekrar Et</span>
              </button>

              <button
                id="btn-next-cycle"
                onClick={() => onCompleteQuiz(score, questions.length)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-sm sm:text-base font-black text-white bg-emerald-500 hover:bg-emerald-600 shadow-[0_6px_0_#059669] active:translate-y-1 active:shadow-none rounded-2xl transition-all cursor-pointer"
              >
                <span>Yeni 5 Kelimeye Başla</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 sm:py-6">
      <motion.div
        key={currentIdx}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-[32px] sm:rounded-[40px] border border-orange-100 border-b-8 border-slate-200 shadow-[0_20px_50px_rgba(249,115,22,0.15)] overflow-hidden"
      >
        {/* Top Quiz Header */}
        <div className="bg-slate-900 text-white px-6 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black text-sm shadow-md transform -rotate-3">
              🏆
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-white tracking-tight">
                MİNİ QUIZ
              </h3>
              <p className="text-xs text-orange-300 font-bold uppercase tracking-wider">
                5 Kelime Değerlendirmesi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black bg-indigo-600 text-white px-3.5 py-1.5 rounded-xl shadow-xs">
              Soru {currentIdx + 1} / {questions.length}
            </span>
          </div>
        </div>

        {/* Progress Line */}
        <div className="w-full bg-slate-100 h-2">
          <div
            className="bg-emerald-400 h-2 transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="p-6 sm:p-10 space-y-6">
          {/* Question Banner */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
              <span>{currentQ.targetWord.unitEmoji}</span>
              <span>{currentQ.targetWord.unitName}</span>
            </div>

            <h3 className="text-lg sm:text-2xl font-black text-slate-800 tracking-tight">
              {currentQ.prompt}
            </h3>

            {currentQ.subPrompt && (
              <div className="bg-orange-50/60 border-2 border-orange-100 p-4 rounded-2xl text-slate-800 text-sm sm:text-base font-bold">
                {currentQ.subPrompt}
              </div>
            )}

            {currentQ.type === 'audio_listen' && (
              <div className="flex items-center justify-center py-2">
                <button
                  onClick={() => soundManager.speak(currentQ.targetWord.word, 'en-US')}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 text-orange-900 font-black text-sm sm:text-base transition-all cursor-pointer shadow-2xs"
                >
                  <Volume2 className="w-5 h-5 text-orange-600" />
                  <span>Tekrar Dinle 🔊</span>
                </button>
              </div>
            )}
          </div>

          {/* 4 Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {currentQ.options.map((option, optIdx) => {
              const letter = String.fromCharCode(65 + optIdx); // A, B, C, D
              let btnStyle = 'bg-slate-50 hover:bg-orange-50/70 border-slate-200 hover:border-orange-300 text-slate-800 shadow-2xs';

              if (isAnswered) {
                if (option === currentQ.correctAnswer) {
                  btnStyle = 'bg-emerald-500 border-emerald-600 text-white shadow-[0_4px_0_#059669] font-black';
                } else if (option === selectedAnswer) {
                  btnStyle = 'bg-rose-500 border-rose-600 text-white font-black';
                } else {
                  btnStyle = 'bg-slate-100 border-slate-200 text-slate-400 opacity-50';
                }
              }

              return (
                <button
                  key={option}
                  onClick={() => handleSelectOption(option)}
                  disabled={isAnswered}
                  className={`p-4 sm:p-5 rounded-2xl border-3 text-left flex items-center gap-3.5 transition-all cursor-pointer text-base sm:text-lg font-bold active:scale-[0.98] ${btnStyle}`}
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-black/10 font-black text-sm shrink-0">
                    {letter}
                  </span>
                  <span className="flex-1 break-words">{option}</span>
                  {isAnswered && option === currentQ.correctAnswer && (
                    <CheckCircle2 className="w-6 h-6 text-white shrink-0" />
                  )}
                  {isAnswered && option === selectedAnswer && option !== currentQ.correctAnswer && (
                    <XCircle className="w-6 h-6 text-white shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Answer Feedback Banner & Next Button */}
          <AnimatePresence>
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  selectedAnswer === currentQ.correctAnswer
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                <div className="flex items-center gap-3 text-sm sm:text-base font-bold">
                  {selectedAnswer === currentQ.correctAnswer ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                      <span>Harika! Doğru cevap verdin (+20 Puan) ⭐</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                      <span>
                        Doğru cevap: <strong className="font-black underline">{currentQ.correctAnswer}</strong>
                      </span>
                    </>
                  )}
                </div>

                <button
                  id="btn-quiz-next"
                  onClick={handleNextQuestion}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm sm:text-base shadow-[0_4px_0_#4338ca] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                >
                  <span>{currentIdx + 1 === questions.length ? 'Sonuçları Gör 🏆' : 'Sonraki Soru'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

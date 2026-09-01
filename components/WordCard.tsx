'use client';

import React, { useState, useEffect, useRef } from 'react';
import { VocabularyWord, MOTIVATION_MESSAGES, GENTLE_CORRECTIONS } from '@/lib/vocabularyData';
import { soundManager } from '@/lib/soundEffects';
import { 
  Volume2, 
  Send, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  RotateCcw,
  Lightbulb,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WordCardProps {
  wordData: VocabularyWord;
  onAnswerEvaluated: (isCorrect: boolean, studentAnswer: string) => void;
  onNextWord: () => void;
  wordNumberInCycle: number; // 1 to 5
  totalStudied: number;
}

export const WordCard: React.FC<WordCardProps> = ({
  wordData,
  onAnswerEvaluated,
  onNextWord,
  wordNumberInCycle,
  totalStudied,
}) => {
  const [studentInput, setStudentInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [revealedHint, setRevealedHint] = useState(false);
  const [hintLevel, setHintLevel] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input field smoothly on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const cleanString = (str: string) => {
    return str
      .trim()
      .toLocaleLowerCase('tr-TR')
      .replace(/ı/g, 'i')
      .replace(/İ/g, 'i')
      .replace(/ç/g, 'c')
      .replace(/ş/g, 's')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ö/g, 'o')
      .replace(/[^a-z0-9]/g, '');
  };

  const handleCheckAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (status !== 'idle' || !studentInput.trim()) return;

    const cleanedUser = cleanString(studentInput);
    const cleanedTarget = cleanString(wordData.word);

    const isCorrect = cleanedUser === cleanedTarget;

    if (isCorrect) {
      soundManager.playCorrect();
      const randomMotivation = MOTIVATION_MESSAGES[Math.floor(Math.random() * MOTIVATION_MESSAGES.length)];
      setFeedbackMessage(randomMotivation);
      setStatus('correct');
      onAnswerEvaluated(true, studentInput.trim());
    } else {
      soundManager.playWrong();
      const randomCorrection = GENTLE_CORRECTIONS[Math.floor(Math.random() * GENTLE_CORRECTIONS.length)];
      setFeedbackMessage(randomCorrection);
      setStatus('wrong');
      onAnswerEvaluated(false, studentInput.trim());
    }
  };

  const handleSpeakWord = (textToSpeak: string) => {
    setIsSpeaking(true);
    soundManager.speak(textToSpeak, 'en-US');
    setTimeout(() => setIsSpeaking(false), 1200);
  };

  const handleGiveHint = () => {
    setRevealedHint(true);
    setHintLevel((prev) => Math.min(prev + 1, 3));
  };

  const handleRetry = () => {
    setStatus('idle');
    setStudentInput('');
    inputRef.current?.focus();
  };

  // Render question with highlight/fill visual
  const parts = wordData.questionSentence.split('________');

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 sm:py-6">
      {/* Quiz Countdown Alert */}
      <div className="mb-4 flex items-center justify-between">
        <div className="bg-amber-100 border-2 border-amber-300 text-amber-900 px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-2xs">
          <span className="text-base sm:text-lg">🎯</span>
          <span>
            {wordNumberInCycle === 5
              ? "🏆 Bu kelimeden sonra Mini Quiz başlıyor!"
              : `Quiz'e Son ${5 - wordNumberInCycle + 1} Kelime!`}
          </span>
        </div>

        <div className="text-xs font-black text-orange-600 bg-orange-100 px-3 py-1.5 rounded-xl uppercase tracking-wider">
          #{totalStudied + 1} • {wordData.unitEmoji} {wordData.unitName}
        </div>
      </div>

      <motion.div
        key={wordData.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full bg-white rounded-[32px] sm:rounded-[40px] shadow-[0_20px_50px_rgba(249,115,22,0.15)] p-6 sm:p-10 flex flex-col items-center border border-orange-100/80 border-b-8 border-slate-200 relative overflow-hidden"
      >
        {/* Category / Unit Badge */}
        <div className="bg-orange-100 text-orange-600 px-6 py-2 rounded-full font-black text-xs sm:text-sm mb-4 sm:mb-6 uppercase tracking-widest flex items-center gap-2">
          <span>{wordData.unitEmoji}</span>
          <span>{wordData.unitName?.toUpperCase() || '6. SINIF KELİME'}</span>
        </div>

        {/* 🇬🇧 English Word Display in Large Bold Display Typography */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2 flex-wrap text-center">
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-800 tracking-tighter">
            {wordData.word.toUpperCase()}
          </h2>
          <button
            id={`speak-word-${wordData.id}`}
            onClick={() => handleSpeakWord(wordData.word)}
            className={`p-3 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer shadow-2xs ${
              isSpeaking
                ? 'bg-orange-500 text-white border-orange-500 scale-110'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-orange-50 hover:border-orange-300'
            }`}
            title="Telaffuzu Dinle"
          >
            <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
          </button>
        </div>

        {/* 🇹🇷 Meaning & 🔊 Pronunciation Badge */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-4 sm:mb-6">
          <div className="bg-orange-50 border-2 border-orange-200 text-orange-900 px-4 py-1.5 rounded-xl font-bold text-sm sm:text-base flex items-center gap-1.5">
            <span className="text-base" title="Türkçe">🇹🇷</span>
            <span>{wordData.meaning}</span>
          </div>

          <div className="bg-slate-50 border-2 border-slate-200 text-slate-700 px-4 py-1.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5">
            <span>🔊</span>
            <span className="font-mono text-indigo-600">{wordData.pronunciation}</span>
          </div>

          {wordData.clue && (
            <div className="bg-amber-50 border-2 border-amber-200 text-amber-900 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{wordData.clue}</span>
            </div>
          )}
        </div>

        {/* 💡 Example Sentence */}
        <div className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 sm:p-5 mb-6 text-center">
          <p className="text-slate-600 text-base sm:text-lg font-medium italic mb-1">
            &quot;{wordData.sampleSentenceEn}&quot;
          </p>
          <p className="text-slate-400 text-xs sm:text-sm font-semibold">
            &quot;{wordData.sampleSentenceTr}&quot;
          </p>
        </div>

        {/* ✍️ Boşluk Doldurma Sorusu */}
        <div className="w-full flex flex-col gap-3">
          <div className="flex items-center justify-between px-2">
            <label htmlFor="student-answer-input" className="text-xs sm:text-sm font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>✍️ Boşluk Doldurma</span>
            </label>
            <span className="text-xs text-slate-400 font-bold">
              Cümleyi tamamlayan kelimeyi yazın
            </span>
          </div>

          {/* Fill the blank visual sentence */}
          <div className="bg-orange-50/50 border-2 border-orange-100 rounded-2xl p-4 text-center text-slate-800 text-sm sm:text-base font-bold">
            <span>{parts[0]}</span>
            <span className="inline-block px-3 py-1 mx-1.5 font-black text-indigo-700 bg-indigo-100 border-2 border-indigo-300 rounded-xl">
              {status === 'correct'
                ? wordData.word
                : status === 'wrong'
                ? wordData.word
                : studentInput || '___________'}
            </span>
            <span>{parts[1]}</span>
          </div>

          {/* Form and 3D Action Controls */}
          <form onSubmit={handleCheckAnswer} className="w-full flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <input
                id="student-answer-input"
                ref={inputRef}
                type="text"
                value={studentInput}
                onChange={(e) => setStudentInput(e.target.value)}
                disabled={status === 'correct'}
                placeholder="Buraya yazın (Örn: BREAKFAST)..."
                autoComplete="off"
                spellCheck={false}
                className={`flex-1 bg-slate-50 border-4 rounded-2xl px-5 py-4 sm:py-5 text-lg sm:text-xl font-bold text-slate-700 outline-none transition-all ${
                  status === 'correct'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                    : status === 'wrong'
                    ? 'border-rose-400 bg-rose-50 text-slate-900'
                    : 'border-slate-100 focus:border-indigo-500'
                }`}
              />

              {status === 'idle' && (
                <button
                  type="submit"
                  disabled={!studentInput.trim()}
                  className={`px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-black text-base sm:text-xl transition-all cursor-pointer ${
                    studentInput.trim()
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_6px_0_#059669] active:translate-y-1 active:shadow-none'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  KONTROL ET
                </button>
              )}
            </div>

            {/* Hint & Helper row */}
            {status === 'idle' && (
              <div className="flex items-center justify-between px-2 text-xs">
                <button
                  type="button"
                  onClick={handleGiveHint}
                  className="inline-flex items-center gap-1.5 text-orange-600 hover:text-orange-700 font-bold cursor-pointer bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3 py-1.5 rounded-xl transition-all"
                >
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>
                    {hintLevel === 0
                      ? '💡 İpucu Al'
                      : hintLevel === 1
                      ? 'Harf İpucu 2'
                      : 'Daha Fazla İpucu'}
                  </span>
                </button>

                {revealedHint && (
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200">
                    {hintLevel === 1 && `İlk harf: "${wordData.word[0]}" (${wordData.word.length} harf)`}
                    {hintLevel === 2 && `Başlangıç: "${wordData.word.slice(0, 2)}..." (${wordData.word.length} harfli)`}
                    {hintLevel >= 3 && `Kalıp: ${wordData.word.replace(/[A-Z]/g, (char, i) => (i % 2 === 0 ? char : '_'))}`}
                  </span>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Evaluation Banner */}
        <AnimatePresence>
          {status !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`w-full mt-6 rounded-2xl p-5 border-2 transition-all ${
                status === 'correct'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-amber-50 border-amber-300 text-amber-950'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {status === 'correct' ? (
                    <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                  ) : (
                    <HelpCircle className="w-7 h-7 text-amber-600 shrink-0" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-base sm:text-lg">
                      {status === 'correct' ? 'Tebrikler!' : 'Nazik Hatırlatma'}
                    </h4>
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-white border border-slate-200">
                      {status === 'correct' ? '+10 Puan ⭐' : 'Öğrenme Fırsatı'}
                    </span>
                  </div>

                  <p className="text-sm font-bold leading-relaxed">
                    {feedbackMessage}
                  </p>

                  {status === 'wrong' && (
                    <div className="bg-white rounded-xl p-3.5 border-2 border-amber-200 text-xs sm:text-sm space-y-1 font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">Senin yazdığın:</span>
                        <span className="line-through text-rose-600 font-mono font-bold">
                          {studentInput || '(Boş)'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-800 font-black">Doğru Cevap:</span>
                        <span className="text-emerald-700 font-mono font-black text-base tracking-wider bg-emerald-100 px-2 py-0.5 rounded-md">
                          {wordData.word}
                        </span>
                        <span className="text-slate-600 font-bold">
                          ({wordData.meaning})
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-3 flex-wrap">
                    {status === 'wrong' && (
                      <button
                        onClick={handleRetry}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-100 border-2 border-slate-300 rounded-xl transition-all cursor-pointer shadow-2xs"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Tekrar Dene</span>
                      </button>
                    )}

                    <button
                      id="btn-next-word"
                      onClick={onNextWord}
                      className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 text-xs sm:text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-[0_4px_0_#4338ca] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                    >
                      <span>
                        {wordNumberInCycle === 5 ? '🏆 5. Kelime Bitti! Quiz\'e Geç' : 'Sonraki Kelime'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quick Action Icons Bar */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => handleSpeakWord(wordData.word)}
          className="bg-white border-2 border-slate-200 hover:border-orange-400 p-4 rounded-2xl hover:bg-orange-50 transition-all shadow-xs cursor-pointer"
          title="Kelimeyi Dinle"
        >
          <span className="text-2xl">🔊</span>
        </button>
        <button
          onClick={handleGiveHint}
          className="bg-white border-2 border-slate-200 hover:border-amber-400 p-4 rounded-2xl hover:bg-amber-50 transition-all shadow-xs cursor-pointer"
          title="İpucu Al"
        >
          <span className="text-2xl">💡</span>
        </button>
        <button
          onClick={onNextWord}
          className="bg-white border-2 border-slate-200 hover:border-indigo-400 p-4 rounded-2xl hover:bg-indigo-50 transition-all shadow-xs cursor-pointer"
          title="Kelimeyi Atla / Sonraki"
        >
          <span className="text-2xl">⏭️</span>
        </button>
      </div>
    </div>
  );
};

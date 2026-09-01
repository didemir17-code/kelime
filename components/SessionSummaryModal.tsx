'use client';

import React from 'react';
import { Trophy, Award, Flame, Coffee, Sparkles, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface SessionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  totalWordsStudied: number;
  quizzesCompleted: number;
  correctAnswersCount: number;
  streak: number;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  isOpen,
  onClose,
  onContinue,
  totalWordsStudied,
  quizzesCompleted,
  correctAnswersCount,
  streak,
}) => {
  if (!isOpen) return null;

  const accuracy = totalWordsStudied > 0 ? Math.round((correctAnswersCount / totalWordsStudied) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[32px] sm:rounded-[40px] border border-orange-100 border-b-8 border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden text-center"
      >
        {/* Banner */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 space-y-3 relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-400/30 transform -rotate-3">
            <Trophy className="w-9 h-9" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Harika Bir Çalışmaydı! 🌟
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-semibold">
            Bugün 6. sınıf İngilizce kelime hedeflerine bir adım daha yaklaştın.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-orange-50 border-2 border-orange-200 p-4 rounded-2xl text-left shadow-2xs">
              <span className="text-xs text-orange-600 font-black uppercase tracking-wider block">Çalışılan Kelime</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalWordsStudied}</span>
            </div>

            <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl text-left shadow-2xs">
              <span className="text-xs text-amber-600 font-black uppercase tracking-wider block">Tamamlanan Quiz</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{quizzesCompleted} 🏆</span>
            </div>

            <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-2xl text-left shadow-2xs">
              <span className="text-xs text-emerald-600 font-black uppercase tracking-wider block">Doğruluk Oranı</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900">%{accuracy}</span>
            </div>

            <div className="bg-indigo-50 border-2 border-indigo-200 p-4 rounded-2xl text-left shadow-2xs">
              <span className="text-xs text-indigo-600 font-black uppercase tracking-wider block">En Yüksek Seri</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{streak} 🔥</span>
            </div>
          </div>

          <div className="bg-orange-50/70 border-2 border-orange-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 font-bold text-left flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-black text-slate-900">Öğretmen Tavsiyesi:</strong>
              Öğrendiğin kelimeleri aklında tutmak için yarın tekrar mini quiz çözebilir veya yeni ünite temalarıyla devam edebilirsin!
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3.5 text-xs sm:text-sm font-black text-slate-700 bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 rounded-2xl transition-all cursor-pointer shadow-2xs"
            >
              Mola Ver (Bitir)
            </button>
            <button
              onClick={onContinue}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-xs sm:text-sm font-black text-white bg-emerald-500 hover:bg-emerald-600 shadow-[0_5px_0_#059669] active:translate-y-1 active:shadow-none rounded-2xl transition-all cursor-pointer"
            >
              <span>Çalışmaya Devam Et</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

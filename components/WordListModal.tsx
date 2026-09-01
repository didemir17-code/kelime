'use client';

import React, { useState } from 'react';
import { VocabularyWord, VOCABULARY_LIST, UNITS } from '@/lib/vocabularyData';
import { soundManager } from '@/lib/soundEffects';
import { 
  X, 
  Search, 
  Volume2, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  HelpCircle,
  Filter
} from 'lucide-react';

interface WordListModalProps {
  isOpen: boolean;
  onClose: () => void;
  masteredWordIds: string[];
  reviewedWordIds: string[];
  onSelectWordToPractice?: (word: VocabularyWord) => void;
}

export const WordListModal: React.FC<WordListModalProps> = ({
  isOpen,
  onClose,
  masteredWordIds,
  reviewedWordIds,
  onSelectWordToPractice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'mastered' | 'review'>('all');

  if (!isOpen) return null;

  const filteredWords = VOCABULARY_LIST.filter((w) => {
    // Unit filter
    if (selectedUnitFilter !== 'all' && w.unitId !== selectedUnitFilter) {
      return false;
    }
    // Status filter
    if (statusFilter === 'mastered' && !masteredWordIds.includes(w.id)) {
      return false;
    }
    if (statusFilter === 'review' && (!reviewedWordIds.includes(w.id) || masteredWordIds.includes(w.id))) {
      return false;
    }
    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        w.word.toLowerCase().includes(q) ||
        w.meaning.toLowerCase().includes(q) ||
        w.sampleSentenceEn.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] sm:rounded-[36px] border border-orange-100 border-b-8 border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-orange-500 flex items-center justify-center text-white font-black shadow-md transform -rotate-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                6. Sınıf Kelime Defterim &amp; Sözlük
              </h2>
              <p className="text-xs text-orange-200 font-bold uppercase tracking-wider">
                Toplam {VOCABULARY_LIST.length} kelime • {masteredWordIds.length} Öğrenildi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filters Bar */}
        <div className="p-4 sm:p-5 bg-orange-50/50 border-b border-orange-100 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Kelime veya Türkçe anlam ara..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-slate-200 hover:border-orange-300 focus:border-orange-500 rounded-xl text-sm font-bold text-slate-700 outline-hidden transition-all shadow-2xs"
              />
            </div>

            {/* Unit Dropdown */}
            <select
              value={selectedUnitFilter}
              onChange={(e) => setSelectedUnitFilter(e.target.value)}
              className="w-full sm:w-auto text-xs sm:text-sm font-bold bg-white border-2 border-slate-200 hover:border-orange-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-hidden focus:border-orange-500 cursor-pointer shadow-2xs"
            >
              {UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.emoji} {u.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="text-slate-500 font-black uppercase tracking-wider">Filtrele:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer shadow-2xs ${
                statusFilter === 'all'
                  ? 'bg-orange-500 text-white shadow-orange-500/30'
                  : 'bg-white border-2 border-slate-200 text-slate-700 hover:bg-orange-50'
              }`}
            >
              Tümü ({VOCABULARY_LIST.length})
            </button>
            <button
              onClick={() => setStatusFilter('mastered')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                statusFilter === 'mastered'
                  ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                  : 'bg-white border-2 border-slate-200 text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Öğrenilenler ({masteredWordIds.length})</span>
            </button>
          </div>
        </div>

        {/* Word List Scroll Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          {filteredWords.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Search className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-base font-bold text-slate-500">Aramanızla eşleşen kelime bulunamadı.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredWords.map((word) => {
                const isMastered = masteredWordIds.includes(word.id);
                return (
                  <div
                    key={word.id}
                    className="p-4 bg-white rounded-2xl border-2 border-slate-200 hover:border-orange-300 transition-all flex items-start justify-between gap-3 shadow-2xs hover:shadow-xs group"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs">{word.unitEmoji}</span>
                        <span className="font-black text-slate-900 text-base sm:text-lg tracking-tight">
                          {word.word}
                        </span>
                        <span className="text-xs text-indigo-600 font-mono font-bold">
                          {word.pronunciation}
                        </span>
                        {isMastered && (
                          <span className="inline-flex items-center text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            Öğrenildi
                          </span>
                        )}
                      </div>

                      <div className="text-xs sm:text-sm font-bold text-slate-700">
                        {word.meaning}
                      </div>

                      <p className="text-xs text-slate-400 italic line-clamp-1">
                        &quot;{word.sampleSentenceEn}&quot;
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => soundManager.speak(word.word, 'en-US')}
                        className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer shadow-2xs"
                        title="Telaffuzu Dinle"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      {onSelectWordToPractice && (
                        <button
                          onClick={() => {
                            onSelectWordToPractice(word);
                            onClose();
                          }}
                          className="px-3 py-1.5 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all cursor-pointer shadow-2xs"
                        >
                          Çalış
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white p-4 sm:p-5 border-t border-orange-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">
            {filteredWords.length} kelime gösteriliyor
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-xs sm:text-sm font-black text-slate-700 bg-slate-100 border-2 border-slate-300 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

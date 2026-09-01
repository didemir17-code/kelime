'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UNITS } from '@/lib/vocabularyData';
import { Volume2, VolumeX, BookOpen, Coffee, Award, Flame, CheckCircle2, User as UserIcon, LogIn, LogOut, ChevronDown, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

interface ProgressHeaderProps {
  currentCycleCount: number; // 0 to 5
  totalStudied: number;
  streak: number;
  selectedUnit: string;
  onSelectUnit: (unitId: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenWordList: () => void;
  onFinishSession: () => void;
  onOpenChat: () => void;
  masteredCount: number;
}

export const ProgressHeader: React.FC<ProgressHeaderProps> = ({
  currentCycleCount,
  totalStudied,
  streak,
  selectedUnit,
  onSelectUnit,
  soundEnabled,
  onToggleSound,
  onOpenWordList,
  onFinishSession,
  onOpenChat,
  masteredCount,
}) => {
  const currentUnitObj = UNITS.find((u) => u.id === selectedUnit);

  return (
    <header className="w-full bg-white px-4 sm:px-8 py-4 border-b border-orange-100 shadow-sm sticky top-0 z-30">
      <div className="max-w-6xl mx-auto flex flex-col gap-3">
        {/* Top bar: Brand & Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="bg-orange-500 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 transform -rotate-3 shrink-0">
              <span className="text-white font-black text-xl sm:text-2xl">A</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black text-slate-800 tracking-tight">
                  KELİME KAHRAMANI
                </h1>
                <span className="bg-orange-100 text-orange-600 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider">
                  6. Sınıf MEB
                </span>
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                {currentUnitObj ? `${currentUnitObj.emoji} ${currentUnitObj.title}` : 'TÜM 6. SINIF ÜNİTELERİ'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap self-end sm:self-auto">
            {/* Unit Selector */}
            <div className="relative">
              <select
                id="unit-selector"
                value={selectedUnit}
                onChange={(e) => onSelectUnit(e.target.value)}
                className="text-xs sm:text-sm font-bold bg-slate-50 border-2 border-slate-200 hover:border-orange-400 text-slate-800 rounded-xl px-3 py-2 pr-8 focus:outline-hidden focus:border-orange-500 cursor-pointer transition-colors shadow-2xs"
                title="Ünite / Tema Seçin"
              >
                {UNITS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.emoji} {u.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Word List / Defterim button */}
            <button
              id="btn-open-wordlist"
              onClick={onOpenWordList}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 border-2 border-transparent rounded-xl transition-all cursor-pointer shadow-2xs"
              title="Öğrendiğim Kelimeler"
            >
              <BookOpen className="w-4 h-4 text-orange-500" />
              <span>Kelimelerim ({masteredCount})</span>
            </button>

            {/* AI Assistant Chat Button */}
            <button
              id="btn-header-open-chat"
              onClick={onOpenChat}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-orange-800 bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 rounded-xl transition-all cursor-pointer shadow-2xs"
              title="AI İngilizce Öğretmenine Sor"
            >
              <span className="text-sm">🤖</span>
              <span>AI Öğretmen</span>
            </button>

            {/* Sound Toggle */}
            <button
              id="btn-toggle-sound"
              onClick={onToggleSound}
              className={`p-2 sm:p-2.5 rounded-xl border-2 transition-all cursor-pointer shadow-2xs ${
                soundEnabled
                  ? 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
                  : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'
              }`}
              title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* User Auth Profile / Login Button */}
            <UserAuthButton />

            {/* Finish / Break button */}
            <button
              id="btn-finish-session"
              onClick={onFinishSession}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 rounded-xl transition-all cursor-pointer shadow-2xs"
              title="Çalışmayı Sonlandır / Mola Ver"
            >
              <Coffee className="w-3.5 h-3.5 text-amber-700" />
              <span>Mola Ver</span>
            </button>
          </div>
        </div>

        {/* Bottom bar: Cycle & Progress */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-orange-50">
          {/* 5-step cycle indicator */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                🏆 Mini Quiz:
              </span>
              <span className="text-xs font-black text-orange-700 bg-orange-100 px-2 py-0.5 rounded-lg border border-orange-200">
                {currentCycleCount} / 5 Kelime
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((step) => {
                const isCompleted = step <= currentCycleCount;
                const isCurrent = step === currentCycleCount + 1;
                return (
                  <div
                    key={step}
                    className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-black transition-all duration-300 ${
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-xs scale-105 shadow-emerald-500/30'
                        : isCurrent
                        ? 'bg-orange-500 text-white ring-4 ring-orange-200 animate-pulse'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Metric Badges */}
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 px-4 py-1.5 rounded-xl text-white font-bold flex items-center gap-2 shadow-xs shadow-indigo-600/20 text-xs sm:text-sm">
              <span className="text-base sm:text-lg font-black">{totalStudied}</span>
              <span className="text-indigo-200 text-xs uppercase font-bold">Çalışılan</span>
            </div>

            <div className="flex items-center gap-1.5 bg-amber-100 border-2 border-amber-300 text-amber-900 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black shadow-2xs">
              <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span>{streak} Seri 🔥</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const UserAuthButton: React.FC = () => {
  const { user, openLoginModal, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <button
        id="btn-login-header"
        onClick={openLoginModal}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/20 border border-emerald-400/30"
        title="Öğrenci Girişi veya Kayıt"
      >
        <LogIn className="w-4 h-4" />
        <span>Giriş Yap</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-orange-50 border-2 border-slate-200 hover:border-orange-300 rounded-xl transition-all cursor-pointer shadow-2xs"
        title="Profil Menüsü"
      >
        <span className="text-lg leading-none">{user.avatar || '🦊'}</span>
        <span className="text-xs sm:text-sm font-black text-slate-800 max-w-[100px] truncate">
          {user.name}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{user.avatar || '🦊'}</span>
              <div className="overflow-hidden">
                <p className="text-xs font-black text-slate-800 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 font-medium truncate">{user.email}</p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-50 flex items-center justify-between text-[10px] font-black text-slate-500">
              <span>🌟 Öğrenilen: {user.masteredWordIds?.length || 0}</span>
              <span>🔥 Seri: {user.streak || 0}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setDropdownOpen(false);
              logout();
            }}
            className="w-full mt-1.5 flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      )}
    </div>
  );
};


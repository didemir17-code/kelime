'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon, Sparkles, LogIn, UserPlus, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const AVATARS = ['🦊', '🦁', '🐼', '🚀', '🌟', '🦉', '🦄', '⚡', '🎮', '🎨', '🐯', '🐬'];

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalMode, closeAuthModal, openLoginModal, openRegisterModal, login, register } = useAuth();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🦊');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const isLogin = authModalMode === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || 'Giriş yapılamadı.');
        } else {
          resetForm();
        }
      } else {
        const res = await register(name, email, password, selectedAvatar);
        if (!res.success) {
          setError(res.error || 'Kayıt yapılamadı.');
        } else {
          resetForm();
        }
      }
    } catch {
      setError('Beklenmeyen bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setError(null);
  };

  const switchMode = (mode: 'login' | 'register') => {
    setError(null);
    if (mode === 'login') openLoginModal();
    else openRegisterModal();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-[28px] sm:rounded-[36px] border border-orange-100 border-b-8 border-slate-200 shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white relative">
            <button
              onClick={closeAuthModal}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
                {isLogin ? '🔑' : selectedAvatar}
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-white">
                  {isLogin ? 'Öğrenci Girişi' : 'Yeni Öğrenci Kaydı'}
                </h2>
                <p className="text-xs text-orange-100 font-bold">
                  {isLogin ? 'İlerlemeni kaydet ve kaldığın yerden devam et!' : 'Kelime Kahramanı macerana şimdi katıl!'}
                </p>
              </div>
            </div>

            {/* Mode Switch Tabs */}
            <div className="flex gap-2 mt-5 bg-black/20 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isLogin ? 'bg-white text-orange-600 shadow-md' : 'text-white/80 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Giriş Yap</span>
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  !isLogin ? 'bg-white text-orange-600 shadow-md' : 'text-white/80 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Kayıt Ol</span>
              </button>
            </div>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50 border-2 border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {!isLogin && (
              <>
                {/* Name */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Adın / Takma Adın
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Örn: Ayşe veya Can"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-orange-500 rounded-2xl text-sm font-bold text-slate-800 outline-hidden transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {/* Avatar Selection */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Avatarını Seç</span>
                    <span className="text-[11px] font-normal text-slate-400">Profil resmin</span>
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {AVATARS.map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setSelectedAvatar(av)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 transition-all cursor-pointer ${
                          selectedAvatar === av
                            ? 'bg-orange-500 text-white scale-110 shadow-md ring-2 ring-orange-300'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                E-posta Adresi
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ogrenci@okul.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-orange-500 rounded-2xl text-sm font-bold text-slate-800 outline-hidden transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Şifre {isLogin ? '' : '(en az 6 karakter)'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-orange-500 rounded-2xl text-sm font-bold text-slate-800 outline-hidden transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 active:translate-y-0.5 text-white font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_0_#c2410c] active:shadow-none transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {isLogin ? <LogIn className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  <span>{isLogin ? 'Giriş Yap' : 'Hesabımı Oluştur'}</span>
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-center text-xs text-slate-500 font-bold">
            {isLogin ? (
              <span>
                Hesabın yok mu?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="text-orange-600 font-black hover:underline cursor-pointer"
                >
                  Hemen Ücretsiz Kayıt Ol
                </button>
              </span>
            ) : (
              <span>
                Zaten bir hesabın var mı?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-orange-600 font-black hover:underline cursor-pointer"
                >
                  Giriş Yap
                </button>
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

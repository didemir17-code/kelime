'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Send,
  X,
  Bot,
  User,
  Sparkles,
  Volume2,
  Trash2,
  Minimize2,
  Maximize2,
  HelpCircle,
  BookOpen,
  Lightbulb,
} from 'lucide-react';
import { VocabularyWord } from '@/lib/vocabularyData';
import { soundManager } from '@/lib/soundEffects';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatAssistantProps {
  currentWord?: VocabularyWord;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

let messageSeq = 0;
const createMessageId = (prefix: string) => {
  messageSeq += 1;
  return `${prefix}-${messageSeq}`;
};

const getNowTime = () => {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

export function ChatAssistant({ currentWord, isOpen, onClose, onOpen }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '👋 Hello! Ben senin 6. Sınıf İngilizce Öğretmen Asistanınım. Kelimeler, anlamlar, telaffuzlar veya gramer hakkında aklına takılan her şeyi sorabilirsin. Birlikte pratik yapalım mı?',
      timestamp: 'Şimdi',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, isOpen, isMinimized]);

  // Send message to server-side Next.js route: /api/chat
  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || isLoading) return;

    const userMessage: Message = {
      id: createMessageId('user'),
      role: 'user',
      content: messageContent,
      timestamp: getNowTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      // Direct fetch call to server endpoint POST /api/chat (no AI SDK imported in client)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          messages: messages.concat(userMessage).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          currentWord: currentWord
            ? {
                word: currentWord.word,
                meaning: currentWord.meaning,
                unitName: currentWord.unitName,
              }
            : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const assistantMessage: Message = {
        id: createMessageId('assistant'),
        role: 'assistant',
        content: data.text || 'Yanıt alınamadı. Lütfen tekrar dene.',
        timestamp: getNowTime(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage: Message = {
        id: createMessageId('err'),
        role: 'assistant',
        content: 'Bağlantı sırasında bir hata oluştu. Lütfen biraz sonra tekrar deneyin.',
        timestamp: getNowTime(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: 'Sohbet temizlendi! 🌟 Yeni bir soru sormak veya pratik yapmak ister misin?',
        timestamp: 'Şimdi',
      },
    ]);
  };

  // Quick suggestion chips based on active context
  const quickPrompts = currentWord
    ? [
        `"${currentWord.word}" ile 2 örnek cümle ver`,
        `"${currentWord.word}" kelimesinin zıt/eş anlamlısı var mı?`,
        `"${currentWord.word}" kelimesini nasıl doğru okurum?`,
        `Bana 6. sınıf seviyesinde bir soru sor`,
      ]
    : [
        'Bana 6. sınıf seviyesinde bir soru sor',
        'Simple Present Tense nasıl kullanılır?',
        'Hava durumu ve duygular kelimeleri nelerdir?',
        'İngilizce günlük rutin cümleleri kuralım',
      ];

  return (
    <>
      {/* Floating Toggle Button (visible when chat is closed or minimized) */}
      {(!isOpen || isMinimized) && (
        <motion.button
          id="btn-open-ai-chat"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (isMinimized) {
              setIsMinimized(false);
            } else {
              onOpen();
            }
          }}
          className="fixed bottom-6 right-6 z-40 bg-linear-to-r from-orange-500 to-amber-500 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-[0_10px_25px_rgba(249,115,22,0.4)] border-2 border-orange-300 flex items-center gap-2.5 font-black text-sm cursor-pointer hover:from-orange-600 hover:to-amber-600 transition-all"
        >
          <div className="relative">
            <Bot className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></span>
          </div>
          <span className="hidden sm:inline">AI Öğretmenime Sor</span>
        </motion.button>
      )}

      {/* Main Chat Dialog */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[28px] sm:rounded-[36px] border border-orange-100 border-b-8 border-slate-200 shadow-2xl w-full max-w-2xl h-[85vh] sm:h-[80vh] flex flex-col overflow-hidden"
            >
              {/* Chat Header */}
              <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white font-black shadow-md transform -rotate-3">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                        AI İngilizce Öğretmeni
                      </h2>
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        6. SINIF MEB
                      </span>
                    </div>
                    <p className="text-xs text-orange-200 font-bold">
                      {currentWord ? `Aktif Kelime: ${currentWord.word}` : 'Soru sor, cümle kur, pratik yap!'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-slate-300">
                  <button
                    onClick={handleClearHistory}
                    className="p-2 rounded-xl hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                    title="Sohbeti Temizle"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="p-2 rounded-xl hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                    title="Küçült"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                    title="Kapat"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Current Context Sub-header */}
              {currentWord && (
                <div className="bg-orange-50 px-4 py-2 border-b border-orange-100 flex items-center justify-between text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-orange-500" />
                    <span>Şu anki kart:</span>
                    <span className="font-black text-slate-900 uppercase">{currentWord.word}</span>
                    <span className="text-slate-500">({currentWord.meaning})</span>
                  </div>
                  <button
                    onClick={() => soundManager.speak(currentWord.word, 'en-US')}
                    className="flex items-center gap-1 text-orange-600 hover:underline cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Dinle</span>
                  </button>
                </div>
              )}

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-orange-50/20">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}

                      <div
                        className={`max-w-[82%] sm:max-w-[75%] rounded-2xl p-3.5 sm:p-4 text-sm font-medium shadow-2xs ${
                          isUser
                            ? 'bg-emerald-600 text-white rounded-tr-xs font-semibold'
                            : 'bg-white text-slate-800 border-2 border-slate-200 rounded-tl-xs'
                        }`}
                      >
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                        </div>

                        <div
                          className={`mt-2 flex items-center justify-between text-[10px] ${
                            isUser ? 'text-emerald-200' : 'text-slate-400'
                          }`}
                        >
                          <span>{msg.timestamp}</span>
                          {!isUser && (
                            <button
                              onClick={() => soundManager.speak(msg.content, 'en-US')}
                              className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 ml-3 font-bold cursor-pointer"
                              title="Mesajı Sesli Dinle"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Seslendir</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {isUser && (
                        <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 justify-start"
                  >
                    <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-xs shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white border-2 border-slate-200 rounded-2xl rounded-tl-xs p-4 shadow-2xs flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></div>
                      <span className="text-xs font-bold text-slate-500 ml-1">Öğretmen yazıyor...</span>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestions */}
              <div className="bg-white px-4 py-2 border-t border-slate-100 overflow-x-auto flex items-center gap-2 no-scrollbar">
                <span className="text-[11px] font-black text-slate-400 uppercase shrink-0 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  Öneriler:
                </span>
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isLoading}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 transition-colors whitespace-nowrap cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Bir soru sor veya İngilizce mesaj yaz..."
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-200 hover:border-orange-300 focus:border-orange-500 rounded-2xl text-sm font-bold text-slate-800 outline-hidden transition-all shadow-2xs disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 active:translate-y-0.5 text-white font-black text-sm flex items-center gap-2 shadow-[0_4px_0_#c2410c] active:shadow-none transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Gönder</span>
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { AuthProvider } from '@/lib/AuthContext';
import { AuthModal } from '@/components/AuthModal';

export const metadata: Metadata = {
  title: '6. Sınıf İngilizce Kelime Dünyası',
  description: '6. sınıf MEB müfredatına uygun interaktif İngilizce kelime kartları, boşluk doldurma alıştırmaları ve 5 kelimede bir mini quiz uygulaması.',
  openGraph: {
    title: '6. Sınıf İngilizce Kelime Dünyası',
    description: '6. sınıf MEB müfredatına uygun interaktif İngilizce kelime kartları, boşluk doldurma alıştırmaları ve 5 kelimede bir mini quiz uygulaması.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '6. Sınıf İngilizce Kelime Dünyası',
    description: '6. sınıf MEB müfredatına uygun interaktif İngilizce kelime kartları, boşluk doldurma alıştırmaları ve 5 kelimede bir mini quiz uygulaması.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-orange-50/70 text-slate-900 antialiased selection:bg-orange-500 selection:text-white" suppressHydrationWarning>
        <AuthProvider>
          {children}
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}


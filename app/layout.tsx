import './globals.css';
import type { Metadata } from 'next';
import { PiProvider } from './components/pi-provider';
import { ErrorBoundary } from './components/error-boundary';

export const metadata: Metadata = {
  title: 'PiWorker-OS | Sovereign Agent Economy',
  description: 'Autonomous Venture Holding Protocol - MAS-ZERO',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="tech-grid min-h-screen bg-[#080808] text-white selection:bg-[#39FF14] selection:text-black">
        <ErrorBoundary>
          <PiProvider>
            {/* Quantum Mirror Overlay */}
            <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-transparent via-[#080808]/50 to-[#080808] opacity-50" />
            
            <main className="relative z-10">
              {children}
            </main>

            {/* Ambient Glow */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#39FF14]/5 blur-[120px] rounded-full pointer-events-none" />
          </PiProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

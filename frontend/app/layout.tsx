import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth-context';
import { Navbar } from '../components/Navbar';

export const metadata: Metadata = {
  title: 'BloodBridge — District Blood Donor Matching Platform',
  description: 'Connecting hospitals and verified blood donors through intelligent, real-time matching.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900 selection:bg-rose-500 selection:text-white min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <div className="flex-1">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

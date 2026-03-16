import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: '背书记忆',
  description: 'Agent 背书记忆 Web',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}

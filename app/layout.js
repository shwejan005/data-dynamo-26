'use client';

import './globals.css';
import { League_Spartan } from 'next/font/google';
import ReactLenis from '@studio-freight/react-lenis';
import ConvexClerkProvider from '@/components/provider/ConvexClientProvider';

const font = League_Spartan({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <ConvexClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${font.className} antialiased`} suppressHydrationWarning>
          <ReactLenis root>
            <main>{children}</main>
          </ReactLenis>
        </body>
      </html>
    </ConvexClerkProvider>
  );
}
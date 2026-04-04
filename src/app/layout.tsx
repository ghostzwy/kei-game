/**
 * Root Layout with Theme and Providers
 * Kei Dashboard v3.0 - Professional C2 Command Center
 */

import type { Metadata } from "next";
import { FirebaseProvider } from "@/providers/FirebaseProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: 'Kei Dashboard v3.0 - Command & Control Center',
  description: 'Professional-grade real-time monitoring and command execution dashboard',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  } as any,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#0a0b10" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Roboto+Mono:wght@400;500;700&display=swap"
          rel="preconnect"
        />
      </head>
      <body className="bg-gradient-to-br from-[#020617] via-[#0a0b10] to-[#020617] text-white antialiased font-mono overflow-x-hidden">
        <FirebaseProvider>
          {children}
        </FirebaseProvider>
      </body>
    </html>
  );
}

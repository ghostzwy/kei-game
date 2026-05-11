/**
 * Root Layout with Theme and Providers
 * Kei Dashboard v3.0 - Professional C2 Command Center
 */

import type { Metadata } from "next";
import { FirebaseProvider } from "@/providers/FirebaseProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: 'KEI OS — Command & Control Center',
  description: 'Military-grade real-time device monitoring and command execution dashboard',
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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#030712" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#030712] text-white antialiased overflow-x-hidden">
        <FirebaseProvider>
          {children}
        </FirebaseProvider>
      </body>
    </html>
  );
}

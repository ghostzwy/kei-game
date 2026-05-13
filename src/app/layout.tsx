/**
 * Root Layout with Theme and Providers
 * Kei Dashboard v3.0 - Professional C2 Command Center
 */

import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { FirebaseProvider } from "@/providers/FirebaseProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#030712] text-white antialiased font-sans overflow-x-hidden">
        <FirebaseProvider>
          {children}
        </FirebaseProvider>
      </body>
    </html>
  );
}


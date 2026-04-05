/**
 * Overwatch Dashboard Layout
 * Flying Bird Admin Monitoring System
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Users,
  Camera,
  MapPin,
  MessageSquare,
  Settings,
  LogOut,
} from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Dash', href: '/dashboard', shortcut: '🏠' },
  { icon: Users, label: 'Target', href: '/dashboard/target', shortcut: '👥' },
  { icon: Camera, label: 'Cam', href: '/dashboard/camera', shortcut: '📷' },
  { icon: MapPin, label: 'GPS', href: '/dashboard/map', shortcut: '📍' },
  { icon: MessageSquare, label: 'Logs', href: '/dashboard/logs', shortcut: '💬' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedTarget] = React.useState('SM-G998B');

  const handleLogout = () => {
    localStorage.removeItem('kei_user');
    document.cookie = 'auth_token=; path=/; max-age=0';
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-mono">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#020617] border-r border-emerald-500/30 flex flex-col p-4">
        {/* Header */}
        <div className="pb-6 border-b border-emerald-500/30">
          <h1 className="text-sm font-bold text-emerald-400 tracking-wider uppercase">
            ◆ OVERWATCH v1.0
          </h1>
          <p className="text-xs text-emerald-500/60 mt-2">[Admin]</p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-400">Status: 🟢 Connected</span>
          </div>
        </div>

        {/* Target Info */}
        <div className="mt-6 mb-6 p-3 border border-emerald-500/30 bg-emerald-500/5 rounded">
          <p className="text-xs text-emerald-500/60">Target:</p>
          <p className="text-sm text-emerald-400 font-bold font-mono mt-1">{selectedTarget}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded text-xs transition-all border',
                  isActive
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/20'
                    : 'border-emerald-500/20 text-emerald-500/70 hover:border-emerald-400 hover:text-emerald-400'
                )}
              >
                <Icon size={16} />
                <span className="font-semibold">[{item.label.toUpperCase()}]</span>
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="my-4 border-t border-emerald-500/20" />

        {/* Setup & Exit */}
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2 rounded text-xs border border-emerald-500/20 text-emerald-500/70 hover:border-emerald-400 hover:text-emerald-400 transition-all"
        >
          <Settings size={16} />
          <span className="font-semibold">[⚙️ SETUP]</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded text-xs border border-red-500/30 text-red-400/70 hover:border-red-400 hover:text-red-400 transition-all mt-2"
        >
          <LogOut size={16} />
          <span className="font-semibold">[EXIT]</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="ml-64">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}


/**
 * Overwatch Dashboard Layout
 * Premium C2 Admin Panel — Glassmorphism + Cyberpunk
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Crosshair,
  Camera,
  MapPin,
  ScrollText,
  Settings,
  LogOut,
  Zap,
  Shield,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Crosshair, label: 'Targets', href: '/dashboard/target' },
  { icon: Camera, label: 'Camera', href: '/dashboard/camera' },
  { icon: MapPin, label: 'GPS Track', href: '/dashboard/map' },
  { icon: ScrollText, label: 'Logs', href: '/dashboard/logs' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('kei_user');
    document.cookie = 'auth_token=; path=/; max-age=0';
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* Mobile menu toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/20 backdrop-blur-xl text-emerald-400 hover:bg-slate-800 transition-colors"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed left-0 top-0 h-screen z-50
          w-[260px] flex flex-col
          bg-[#030712]/95 backdrop-blur-2xl
          border-r border-emerald-500/10
          transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* ── Brand ── */}
        <div className="px-5 pt-7 pb-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Shield size={20} className="text-black" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#030712] animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-wide">KEI OS</h1>
              <p className="text-[10px] text-emerald-400/60 font-mono uppercase tracking-[0.2em]">C2 Command Center</p>
            </div>
          </div>
        </div>

        {/* ── Status bar ── */}
        <div className="mx-5 mb-5 px-3.5 py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-sm shadow-emerald-400" />
              <span className="text-[11px] text-emerald-400/80 font-medium">System Online</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">v3.0</span>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="mx-5 mb-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500/80 font-semibold">Navigation</p>
        </div>

        {/* ── Nav Items ── */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-emerald-500/15 text-emerald-400 shadow-sm shadow-emerald-500/10 border border-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                  }
                `}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <ChevronRight size={14} className="text-emerald-500/60" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Bottom section ── */}
        <div className="px-3 pb-5 space-y-1.5">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent mb-3" />

          <Link
            href="/dashboard/command-center"
            onClick={() => setSidebarOpen(false)}
            className={`
              group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200
              ${pathname === '/dashboard/command-center'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }
            `}
          >
            <Settings size={18} strokeWidth={1.8} />
            <span className="flex-1">Command Center</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/[0.06] border border-transparent transition-all duration-200"
          >
            <LogOut size={18} strokeWidth={1.8} />
            <span className="flex-1 text-left">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="lg:ml-[260px] min-h-screen">
        <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

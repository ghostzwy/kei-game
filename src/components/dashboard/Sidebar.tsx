/**
 * Sidebar Navigation Component
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, LogOut, Zap, MapPin, Terminal, Settings } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Zap },
  { href: '/dashboard/command-center', label: 'Command Center', icon: Menu },
  { href: '/dashboard/map', label: 'Target Map', icon: MapPin },
  { href: '/dashboard/terminal', label: 'Activity Terminal', icon: Terminal },
  { href: '/dashboard/logs', label: 'System Logs', icon: Settings },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    localStorage.removeItem('kei_user');
    document.cookie = 'auth_token=; path=/; max-age=0';
    window.location.href = '/auth/login';
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#161b22] border border-[#00ff41]/30 rounded hover:bg-[#1f262d]"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-64 bg-[#0a0b10] border-r border-[#00ff41]/20 flex flex-col transition-transform duration-300 z-40',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b border-[#00ff41]/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#00ff41] rounded flex items-center justify-center">
              <Zap size={20} className="text-[#0a0b10]" />
            </div>
            <h1 className="text-xl font-bold text-[#00ff41]">KEI OS</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">C2 Admin Terminal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-md transition-all',
                  isActive
                    ? 'bg-[#00ff41] text-[#0a0b10] shadow-md shadow-[#00ff41]/50'
                    : 'text-gray-400 hover:text-[#00ff41] hover:bg-[#00ff41]/10'
                )}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-[#00ff41]/20">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

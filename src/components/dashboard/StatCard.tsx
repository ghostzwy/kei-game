/**
 * Dashboard Statistics Cards - Professional Matrix/Neon Theme
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import { Activity, Zap, AlertCircle, TrendingUp, Wifi, Database } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  isPulse?: boolean;
  isLoading?: boolean;
  subtitle?: string;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  trendLabel,
  isPulse = false,
  isLoading = false,
  subtitle,
}: StatCardProps) {
  return (
    <div className="h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="relative overflow-hidden border-[#00ff41]/30 hover:border-[#00ff41]/60 transition-colors duration-300">
        {isPulse && (
          <>
            <div className="absolute inset-0 animate-pulse bg-[#00ff41]/10 pointer-events-none" />
            <div className="absolute top-0 right-0 w-1 h-8 bg-[#00ff41] animate-pulse" />
          </>
        )}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-gray-400">
              {title}
            </CardTitle>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className="text-[#00ff41] transition-transform hover:scale-110">
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="font-mono">
            {isLoading ? (
              <div className="h-8 bg-gray-700 rounded animate-pulse" />
            ) : (
              <div className="text-3xl font-bold text-[#00ff41] select-none">{value}</div>
            )}
          </div>
          {trend !== undefined && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <p className={cn('text-xs font-mono pt-2 tracking-wide', trend > 0 ? 'text-green-400' : 'text-red-400')}>
                <span>{trend > 0 ? '↑' : '↓'}</span> {Math.abs(trend)}% {trendLabel}
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
      </motion.div>
    </div>
  );
}

interface DashboardStatsProps {
  totalDevices?: number;
  activeDevices?: number;
  averageBattery?: number;
  activeSessions?: number;
  totalStorage?: number;
  usedStorage?: number;
  isLoading?: boolean;
}

export function DashboardStats({
  totalDevices = 0,
  activeDevices = 0,
  averageBattery = 0,
  activeSessions = 0,
  totalStorage = 0,
  usedStorage = 0,
  isLoading = false,
}: DashboardStatsProps) {
  const storageUsagePercent = totalStorage > 0 ? Math.round((usedStorage / totalStorage) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        initial="hidden"
        animate="visible"
      >
      <StatCard
        title="Total Devices"
        value={totalDevices}
        icon={<Database size={20} />}
        isLoading={isLoading}
        trend={totalDevices > 0 ? 5 : 0}
        trendLabel="vs last week"
      />
      <StatCard
        title="Active Sessions"
        value={activeDevices}
        icon={<Activity size={20} />}
        isPulse={activeDevices > 0}
        isLoading={isLoading}
        trend={activeDevices > 0 ? 3 : -2}
        trendLabel="online now"
        subtitle="Real-time connected devices"
      />
      <StatCard
        title="Avg Battery"
        value={`${averageBattery}%`}
        icon={<TrendingUp size={20} />}
        isLoading={isLoading}
        trend={averageBattery > 50 ? 2 : -5}
        trendLabel="battery health"
      />
      <StatCard
        title="Active Sessions"
        value={activeSessions}
        icon={<Wifi size={20} />}
        isPulse={activeSessions > 0}
        isLoading={isLoading}
        trend={activeSessions > 0 ? 8 : 0}
        trendLabel="connections"
      />
      <StatCard
        title="Storage Usage"
        value={`${storageUsagePercent}%`}
        icon={<Database size={20} />}
        isLoading={isLoading}
        subtitle={`${usedStorage}MB / ${totalStorage}MB`}
        trend={storageUsagePercent > 80 ? 15 : 2}
        trendLabel="capacity"
      />
      <StatCard
        title="Pending Commands"
        value="0"
        icon={<AlertCircle size={20} />}
        isLoading={isLoading}
        trend={0}
        trendLabel="in queue"
      />
      </motion.div>
    </div>
  );
}

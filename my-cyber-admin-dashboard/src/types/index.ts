export interface Target {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  batteryLevel: number; // Percentage from 0 to 100
  lastSeen: Date; // Timestamp of the last seen time
}

export interface Command {
  id: string;
  targetId: string;
  command: string;
  timestamp: Date; // Timestamp of when the command was issued
  status: 'pending' | 'executed' | 'failed';
}
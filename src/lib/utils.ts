/**
 * Utility helper functions
 */

/**
 * Format timestamp to "time ago" format (e.g., "2 minutes ago")
 */
export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;

  return new Date(timestamp).toLocaleDateString();
}

/**
 * Format battery percentage with color
 */
export function getBatteryColor(percentage: number): string {
  if (percentage > 75) return '#00ff41'; // Neon Green
  if (percentage > 50) return '#90ee90'; // Light Green
  if (percentage > 25) return '#ffa500'; // Orange
  return '#ff4444'; // Red
}

/**
 * Format device status with appropriate styling
 */
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    online: '#00ff41', // Neon Green
    offline: '#ff4444', // Red
    idle: '#ffff00', // Yellow
    active: '#00ccff', // Cyan
  };
  return statusColors[status] || '#888888';
}

/**
 * Truncate string to specified length
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Format coordinates to readable format
 */
export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

/**
 * Generate a random device ID (for testing)
 */
export function generateDeviceId(): string {
  return `DEV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

/**
 * Check if device is considered active
 */
export function isDeviceActive(device: any): boolean {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  return device.lastSeen > fiveMinutesAgo && device.status === 'online';
}

/**
 * Convert bytes to human-readable format
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * Math.pow(10, dm)) / Math.pow(10, dm) + ' ' + sizes[i];
}

/**
 * Toast notifications provider setup
 * Note: Sonner is commented in the CommandCenter component for future use
 * To enable: npm install sonner
 */

'use client';

// Example placeholder for toast function
export const toast = {
  success: (message: string) => console.log('✓', message),
  error: (message: string) => console.error('✗', message),
  info: (message: string) => console.info('ℹ', message),
  warning: (message: string) => console.warn('!', message),
};

// When sonner is installed, replace above with:
// import { Toaster, toast } from 'sonner';
// export { Toaster, toast };

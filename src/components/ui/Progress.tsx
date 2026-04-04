/**
 * Progress bar component (Shadcn/UI style)
 */

import React from 'react';
import { cn } from '@/lib/cn';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    let barColor = '#00ff41'; // Default neon green
    if (percentage < 25) barColor = '#ff4444'; // Red
    else if (percentage < 50) barColor = '#ffa500'; // Orange
    else if (percentage < 75) barColor = '#90ee90'; // Light green

    return (
      <div
        ref={ref}
        className={cn(
          'relative h-2 w-full overflow-hidden rounded-full bg-[#0a0b10] border border-[#00ff41]/20',
          className
        )}
        {...props}
      >
        <div
          className="h-full transition-all shadow-sm"
          style={{
            width: `${percentage}%`,
            backgroundColor: barColor,
            boxShadow: `0 0 10px ${barColor}80`,
          }}
        />
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };

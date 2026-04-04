/**
 * Custom Button component (Shadcn/UI style)
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default:
          'bg-[#00ff41] text-[#0a0b10] hover:bg-[#00dd33] shadow-sm shadow-[#00ff41]/50',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        outline:
          'border border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41]/10 shadow-sm shadow-[#00ff41]/20',
        secondary:
          'bg-[#161b22] text-[#00ff41] border border-[#00ff41]/30 hover:bg-[#1f262d] shadow-sm',
        ghost: 'hover:bg-[#00ff41]/10 text-[#00ff41]',
        link: 'text-[#00ff41] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded px-3 text-xs',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);

Button.displayName = 'Button';

export { Button, buttonVariants };

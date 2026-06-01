import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-slate-700/60 bg-slate-950',
          'px-3 py-2 text-sm text-slate-100',
          'placeholder:text-slate-600',
          'transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#274993]/45 focus-visible:border-[#274993]/50',
          'hover:border-slate-600',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };

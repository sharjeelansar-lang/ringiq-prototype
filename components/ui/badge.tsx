import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:     'border-[#274993]/20 bg-[#274993]/10 text-[#5B7BD8]',
        secondary:   'border-slate-700/60 bg-slate-800 text-slate-300',
        destructive: 'border-red-500/20 bg-red-500/10 text-red-400',
        success:     'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
        warning:     'border-amber-500/20 bg-amber-500/10 text-amber-400',
        outline:     'border-slate-700/60 text-slate-400',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

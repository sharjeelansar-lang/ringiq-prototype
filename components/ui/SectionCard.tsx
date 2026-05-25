import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  accentColor?: string;
  children: ReactNode;
}

export function SectionCard({ title, subtitle, icon: Icon, accentColor = 'cyan', children }: SectionCardProps) {
  const accentMap: Record<string, string> = {
    cyan: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    violet: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
    emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    amber: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    rose: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
  };

  const accent = accentMap[accentColor] ?? accentMap.cyan;

  return (
    <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800/60 bg-slate-900/40">
        <div className={`flex items-center justify-center w-8 h-8 rounded-lg border ${accent}`}>
          <Icon size={15} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {children}
      </div>
    </div>
  );
}

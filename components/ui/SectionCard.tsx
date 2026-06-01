import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  accentColor?: string;
  children: ReactNode;
}

const accentMap: Record<string, { bg: string; border: string; text: string }> = {
  teal:    { bg: '#EEF4FF', border: '#D8E5FF', text: '#274993' },
  cyan:    { bg: '#EEF4FF', border: '#D8E5FF', text: '#274993' },
  violet:  { bg: '#F5F3FF', border: '#DDD6FE', text: '#7C3AED' },
  emerald: { bg: '#ECFDF5', border: '#A7F3D0', text: '#059669' },
  amber:   { bg: '#FFFBEB', border: '#FDE68A', text: '#D97706' },
  rose:    { bg: '#FFF1F2', border: '#FECDD3', text: '#E11D48' },
};

export function SectionCard({ title, subtitle, icon: Icon, accentColor = 'teal', children }: SectionCardProps) {
  const accent = accentMap[accentColor] ?? accentMap.teal;

  return (
    <div style={{
      borderRadius: 12, border: '1px solid #E2E8F0',
      background: '#FFFFFF', overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 20px', borderBottom: '1px solid #E2E8F0',
        background: '#F8FAFC',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: accent.bg, border: `1px solid ${accent.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={15} style={{ color: accent.text }} />
        </div>
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', margin: 0 }}>{title}</h3>
          {subtitle && <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{subtitle}</p>}
        </div>
      </div>
      <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {children}
      </div>
    </div>
  );
}

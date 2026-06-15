'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, Play, Square } from 'lucide-react';
import { type S4 } from '@/types/onboard';
import { VOICES, INTEREST_OPTIONS } from '@/lib/onboard';
import { ObField } from '@/components/onboard/ObField/ObField';
import { cn } from '@/lib/utils';

export function Step4Form({
  data, toggle, onChange, showNotes = true,
}: {
  data: S4; toggle: (id: string) => void; onChange: (d: S4) => void; showNotes?: boolean;
}) {
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [loadingVoice, setLoadingVoice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => { audioRef.current?.pause(); }, []);

  const handlePlay = (voiceId: string, src: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (playingVoice === voiceId) {
      setPlayingVoice(null);
      return;
    }
    setLoadingVoice(voiceId);
    const audio = new Audio(src);
    audioRef.current = audio;
    audio.addEventListener('canplay', () => {
      setLoadingVoice(null);
      setPlayingVoice(voiceId);
      audio.play().catch(() => setPlayingVoice(null));
    });
    audio.addEventListener('ended', () => setPlayingVoice(null));
    audio.addEventListener('error', () => { setLoadingVoice(null); setPlayingVoice(null); });
    audio.load();
  };

  return (
    <div className="flex flex-col gap-3.5">
      <div>
        <label className="mb-[7px] block text-[13px] font-bold text-mid">Choose Iris&rsquo;s voice</label>
        <p className="mb-3 text-[13px] text-muted-foreground">
          Preview each voice, then select the one that fits your practice.
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {VOICES.map(({ id, name, tone, desc, sample }) => {
            const on        = data.voice === id;
            const isPlaying = playingVoice === id;
            const isLoading = loadingVoice === id;
            return (
              <div
                key={id}
                role="radio"
                aria-checked={on}
                tabIndex={0}
                onClick={() => onChange({ ...data, voice: id })}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange({ ...data, voice: id }); } }}
                className={cn(
                  'flex cursor-pointer items-center gap-3.5 rounded-xl border-[1.5px] border-border bg-input-bg px-3 py-2.5 text-left font-[inherit] transition-[border-color,background-color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15',
                  on && 'border-primary bg-accent shadow-[0_0_0_3px_rgba(39,73,147,0.08)]'
                )}
              >
                <div className={cn('flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 border-border bg-transparent transition-colors duration-150', on && 'border-primary bg-primary')}>
                  {on && <div className="h-[7px] w-[7px] rounded-full bg-white" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-teal">{tone}</div>
                  <div className={cn('mb-0.5 text-sm font-bold text-foreground transition-colors duration-150', on && 'text-primary')}>{name}</div>
                  <div className="text-xs leading-snug text-muted-foreground">{desc}</div>
                </div>
                <button
                  type="button"
                  className={cn(
                    'ml-1.5 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-border bg-background p-0 transition-colors duration-150 hover:border-primary hover:bg-accent',
                    on && 'border-primary/35 bg-primary/10 hover:border-primary hover:bg-primary/20',
                    isPlaying && 'border-primary bg-primary'
                  )}
                  onClick={(e) => { e.stopPropagation(); handlePlay(id, sample); }}
                  aria-label={isPlaying ? 'Stop sample' : 'Play voice sample'}
                >
                  {isLoading ? (
                    <Loader2 size={13} className={cn('animate-spin', on ? 'text-primary' : 'text-muted-foreground')} />
                  ) : isPlaying ? (
                    <Square size={10} className="fill-current text-white" />
                  ) : (
                    <Play size={12} className={cn('ml-px fill-current', on ? 'text-primary' : 'text-light')} />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <label className="mb-[7px] block text-[13px] font-bold text-mid">What matters most to your practice?</label>
        <p className="mb-3 text-[13px] text-muted-foreground">Select all that apply</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {INTEREST_OPTIONS.map(({ id, label, icon: Icon }) => {
            const on = data.interests.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggle(id)}
                className={cn(
                  'flex cursor-pointer items-center gap-2.5 rounded-xl border-[1.5px] border-border bg-input-bg px-3.5 py-3 text-left font-[inherit] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15',
                  on && 'border-primary bg-accent'
                )}
              >
                <div className={cn('flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-background transition-colors duration-150', on && 'bg-primary')}>
                  <Icon size={13} className={on ? 'text-white' : 'text-muted-foreground'} />
                </div>
                <span className={cn('text-[13px] font-medium leading-snug text-foreground transition-colors duration-150', on && 'text-primary')}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {showNotes && (
        <ObField label="Anything else? (optional)">
          <div className="flex min-h-[92px] items-start gap-2.5 rounded-xl border-[1.5px] border-border bg-input-bg px-3.5 transition-[border-color,box-shadow,background-color] duration-150 focus-within:border-primary focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(39,73,147,0.1)]">
            <textarea
              value={data.notes}
              onChange={(e) => onChange({ ...data, notes: e.target.value })}
              placeholder="Special requirements, questions, or context you'd like us to know…"
              className="min-h-[66px] min-w-0 flex-1 resize-y border-0 bg-transparent py-3.5 font-[inherit] text-[15px] leading-relaxed text-foreground outline-none placeholder:text-light"
            />
          </div>
        </ObField>
      )}
    </div>
  );
}

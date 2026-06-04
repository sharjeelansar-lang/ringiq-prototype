'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, Play, Square } from 'lucide-react';
import { type S4 } from '@/types/onboard';
import { VOICES, INTEREST_OPTIONS } from '@/lib/onboard';
import { ObField } from '@/components/onboard/ObField/ObField';

export function Step4Form({
  data, toggle, onChange,
}: {
  data: S4; toggle: (id: string) => void; onChange: (d: S4) => void;
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
    <div className="ob-fields">
      <div>
        <label className="ob-label">Choose Iris&rsquo;s voice</label>
        <p style={{ fontSize: 13, color: 'var(--muted-foreground)', margin: '0 0 12px' }}>
          Preview each voice, then select the one that fits your practice.
        </p>
        <div className="ob-voice-list">
          {VOICES.map(({ id, name, tone, desc, sample }) => {
            const on        = data.voice === id;
            const isPlaying = playingVoice === id;
            const isLoading = loadingVoice === id;
            const iconColor = isPlaying ? '#fff' : on ? 'var(--primary)' : 'var(--light)';
            return (
              <div
                key={id}
                role="radio"
                aria-checked={on}
                tabIndex={0}
                onClick={() => onChange({ ...data, voice: id })}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange({ ...data, voice: id }); } }}
                className={`ob-voice-card${on ? ' on' : ''}`}
              >
                <div className="ob-voice-radio">
                  {on && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="ob-voice-tone">{tone}</div>
                  <div className="ob-voice-name">{name}</div>
                  <div className="ob-voice-desc">{desc}</div>
                </div>
                <button
                  type="button"
                  className={`ob-voice-play${isPlaying ? ' playing' : ''}`}
                  onClick={(e) => { e.stopPropagation(); handlePlay(id, sample); }}
                  aria-label={isPlaying ? 'Stop sample' : 'Play voice sample'}
                >
                  {isLoading ? (
                    <Loader2 size={13} style={{ animation: 'ob-spin 1s linear infinite', color: on ? 'var(--primary)' : 'var(--muted-foreground)' }} />
                  ) : isPlaying ? (
                    <Square size={10} color={iconColor} fill={iconColor} />
                  ) : (
                    <Play size={12} color={iconColor} fill={iconColor} style={{ marginLeft: 1 }} />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <label className="ob-label">What matters most to your practice?</label>
        <p style={{ fontSize: 13, color: 'var(--muted-foreground)', margin: '0 0 12px' }}>Select all that apply</p>
        <div className="ob-interest-grid">
          {INTEREST_OPTIONS.map(({ id, label, icon: Icon }) => {
            const on = data.interests.includes(id);
            return (
              <button key={id} type="button" onClick={() => toggle(id)} className={`ob-int-btn${on ? ' on' : ''}`}>
                <div className="ob-int-icon">
                  <Icon size={13} style={{ color: on ? '#fff' : 'var(--muted-foreground)' }} />
                </div>
                <span className="ob-int-lbl">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <ObField label="Anything else? (optional)">
        <div className="ob-frame textarea">
          <textarea
            value={data.notes}
            onChange={(e) => onChange({ ...data, notes: e.target.value })}
            placeholder="Special requirements, questions, or context you'd like us to know…"
            className="ob-textarea"
          />
        </div>
      </ObField>
    </div>
  );
}

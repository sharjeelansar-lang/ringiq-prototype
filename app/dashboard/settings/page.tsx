'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User, Mail, Phone, Briefcase, Lock, Eye, EyeOff,
  CheckCircle2, AlertCircle, Loader2, Shield, KeyRound,
  Fingerprint, Pencil,
} from 'lucide-react';
import { Sidebar } from '@/components/dashboard/Sidebar';

interface UserProfile {
  userId: string;
  email:  string;
  name:   string;
  title:  string;
  phone:  string;
}

const T = {
  bg:      '#F7F6F3',
  surface: '#FFFFFF',
  border:  '#E2E8F0',
  navy:    '#0F172A',
  mid:     '#1E293B',
  muted:   '#64748B',
  light:   '#94A3B8',
  teal:    '#274993',
  tealFd:  '#EEF4FF',
  tealBd:  '#D8E5FF',
  hover:   '#F8FAFC',
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? 'A';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function FieldLabel({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: 5,
      fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
      textTransform: 'uppercase', color: T.muted,
      marginBottom: 6,
    }}>
      <Icon size={9} style={{ color: T.light, flexShrink: 0 }} />
      {children}
    </label>
  );
}

function InputField({
  value, onChange, placeholder, type = 'text', disabled = false,
  suffix, required,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  suffix?: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      background: disabled ? T.hover : T.surface,
      border: `1.5px solid ${T.border}`,
      borderRadius: 8, padding: '0 12px',
      transition: 'border-color 0.15s',
      opacity: disabled ? 0.7 : 1,
    }}
    onFocusCapture={e => { if (!disabled) (e.currentTarget as HTMLDivElement).style.borderColor = `${T.teal}80`; }}
    onBlurCapture={e => { (e.currentTarget as HTMLDivElement).style.borderColor = T.border; }}
    >
      <input
        type={type}
        value={value}
        onChange={onChange ? e => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        style={{
          flex: 1, background: 'transparent', border: 'none', outline: 'none',
          fontSize: 13, color: disabled ? T.muted : T.navy,
          padding: '9px 0', fontFamily: 'inherit',
          cursor: disabled ? 'default' : 'text',
        }}
      />
      {suffix}
    </div>
  );
}

function StatusPill({ type, msg }: { type: 'success' | 'error'; msg: string }) {
  const isSuccess = type === 'success';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7,
      padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
      border: `1px solid ${isSuccess ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
      background: isSuccess ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
      color: isSuccess ? '#059669' : '#DC2626',
    }}>
      {isSuccess ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
      {msg}
    </div>
  );
}

function TealBtn({ loading, label, type = 'submit' }: { loading: boolean; label: string; type?: 'submit' | 'button' }) {
  return (
    <button
      type={type}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700,
        background: '#274993', color: '#fff', border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
        boxShadow: '0 4px 14px rgba(39,73,147,0.25)',
        fontFamily: 'inherit', transition: 'opacity 0.15s',
      }}
    >
      {loading ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={12} />}
      {loading ? 'Saving…' : label}
    </button>
  );
}

function Card({
  title, description, icon: Icon, action, children,
}: {
  title: string; description: string; icon: React.ElementType;
  action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      borderRadius: 12, border: `1px solid ${T.border}`,
      background: T.surface, overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 20px', borderBottom: `1px solid ${T.border}`,
        background: T.hover, flexShrink: 0,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: T.tealFd, border: `1px solid ${T.tealBd}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={14} style={{ color: T.teal }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: T.navy, margin: 0 }}>{title}</h2>
          <p style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{description}</p>
        </div>
        {action}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '16px 20px' }}>{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();

  const [profile,        setProfile]        = useState<UserProfile | null>(null);
  const [name,           setName]           = useState('');
  const [title,          setTitle]          = useState('');
  const [phone,          setPhone]          = useState('');
  const [isEditing,      setIsEditing]      = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileStatus,  setProfileStatus]  = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const [currentPw,   setCurrentPw]   = useState('');
  const [newPw,       setNewPw]       = useState('');
  const [confirmPw,   setConfirmPw]   = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [pwLoading,   setPwLoading]   = useState(false);
  const [pwStatus,    setPwStatus]    = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(json => {
        if (!json.success) { router.push('/login'); return; }
        const u: UserProfile = json.user;
        setProfile(u); setName(u.name); setTitle(u.title); setPhone(u.phone);
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const cancelEdit = () => {
    if (!profile) return;
    setIsEditing(false);
    setName(profile.name); setTitle(profile.title); setPhone(profile.phone);
    setProfileStatus(null);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true); setProfileStatus(null);
    try {
      const res  = await fetch('/api/auth/profile', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, title, phone }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setProfileStatus({ type: 'error', msg: json.error ?? 'Failed to save' });
      } else {
        setProfileStatus({ type: 'success', msg: 'Profile updated successfully' });
        setProfile(prev => prev ? { ...prev, name, title, phone } : prev);
        setIsEditing(false);
      }
    } catch { setProfileStatus({ type: 'error', msg: 'Unable to reach the server' }); }
    finally   { setProfileLoading(false); }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwStatus(null);
    if (newPw !== confirmPw) { setPwStatus({ type: 'error', msg: 'Passwords do not match' }); return; }
    if (newPw.length < 8)    { setPwStatus({ type: 'error', msg: 'Min. 8 characters required' }); return; }
    setPwLoading(true);
    try {
      const res  = await fetch('/api/auth/password', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setPwStatus({ type: 'error', msg: json.error ?? 'Failed to update password' });
      } else {
        setPwStatus({ type: 'success', msg: 'Password changed successfully' });
        setCurrentPw(''); setNewPw(''); setConfirmPw('');
      }
    } catch { setPwStatus({ type: 'error', msg: 'Unable to reach the server' }); }
    finally   { setPwLoading(false); }
  };

  if (!profile) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: T.bg, overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={20} style={{ color: T.light, animation: 'spin 1s linear infinite' }} />
        </div>
      </div>
    );
  }

  const avatarLabel = initials(name || 'Admin');

  return (
    <div style={{ display: 'flex', height: '100vh', background: T.bg, overflow: 'hidden' }}>
      <Sidebar />

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden' }}>

        {/* Header */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 32px', borderBottom: `1px solid ${T.border}`,
          background: 'rgba(247,246,243,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          flexShrink: 0,
        }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: T.navy, letterSpacing: '-0.02em', margin: 0 }}>Settings</h1>
            <p style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Manage your account and credentials</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: T.light, fontFamily: 'var(--font-geist-mono)' }}>
            <Shield size={10} />
            <span>JWT · AES-256</span>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Identity strip */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 20px', borderRadius: 12,
              border: `1px solid ${T.border}`, background: T.surface,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: '#fff', userSelect: 'none',
                background: `linear-gradient(135deg, ${T.teal} 0%, #18336F 100%)`,
              }}>
                {avatarLabel}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: T.navy, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                  {name || 'Admin'}
                </p>
                <p style={{ fontSize: 12, color: T.muted, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile.email}
                </p>
              </div>
              {title && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px', borderRadius: 6,
                  background: T.hover, border: `1px solid ${T.border}`,
                }}>
                  <Briefcase size={10} style={{ color: T.muted }} />
                  <span style={{ fontSize: 11, color: T.muted, fontWeight: 500 }}>{title}</span>
                </div>
              )}
              <div style={{ width: 1, height: 24, background: T.border, flexShrink: 0 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'block' }} />
                <span style={{ fontSize: 10, color: '#059669', fontWeight: 500, fontFamily: 'var(--font-geist-mono)' }}>Active</span>
              </div>
              <div style={{ flexShrink: 0 }}>
                <Fingerprint size={14} style={{ color: T.light }} />
              </div>
            </div>

            {/* Two-column cards */}
            <div className="dash-two-col" style={{ gap: 16 }}>

              {/* Profile card */}
              <Card
                title="Profile Information"
                description="Update display name, title, and contact"
                icon={User}
                action={
                  !isEditing ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                        color: T.muted, background: T.surface, border: `1.5px solid ${T.border}`,
                        cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, transition: 'all 0.12s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = T.teal; (e.currentTarget as HTMLButtonElement).style.color = T.teal; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = T.border; (e.currentTarget as HTMLButtonElement).style.color = T.muted; }}
                    >
                      <Pencil size={11} />
                      Edit
                    </button>
                  ) : (
                    <button
                      type="button" onClick={cancelEdit}
                      style={{ fontSize: 12, color: T.muted, background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px', fontFamily: 'inherit', flexShrink: 0 }}
                    >
                      Cancel
                    </button>
                  )
                }
              >
                <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <FieldLabel icon={User}>Display Name</FieldLabel>
                      <InputField value={name} onChange={isEditing ? setName : undefined} placeholder="Jane Smith" disabled={!isEditing} required />
                    </div>
                    <div>
                      <FieldLabel icon={Briefcase}>Job Title</FieldLabel>
                      <InputField value={title} onChange={isEditing ? setTitle : undefined} placeholder="Operations Manager" disabled={!isEditing} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <FieldLabel icon={Phone}>Phone Number</FieldLabel>
                      <InputField value={phone} onChange={isEditing ? setPhone : undefined} placeholder="+1 (555) 000-0000" type="tel" disabled={!isEditing} />
                    </div>
                    <div>
                      <FieldLabel icon={Mail}>Email Address</FieldLabel>
                      <InputField
                        value={profile.email} disabled
                        suffix={
                          <span style={{
                            fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                            padding: '2px 6px', borderRadius: 4, flexShrink: 0,
                            background: T.hover, border: `1px solid ${T.border}`, color: T.light,
                          }}>
                            Read-only
                          </span>
                        }
                      />
                    </div>
                  </div>

                  <div style={{ flex: 1 }} />
                  {profileStatus && <StatusPill type={profileStatus.type} msg={profileStatus.msg} />}

                  <div style={{
                    display: 'flex', justifyContent: 'flex-end', paddingTop: 8,
                    borderTop: `1px solid ${T.border}`,
                    opacity: isEditing ? 1 : 0, pointerEvents: isEditing ? 'auto' : 'none',
                    transition: 'opacity 0.15s',
                  }}>
                    <TealBtn loading={profileLoading} label="Save Changes" />
                  </div>
                </form>
              </Card>

              {/* Password card */}
              <Card
                title="Change Password"
                description="Requires your current password to confirm"
                icon={KeyRound}
              >
                <form onSubmit={handlePasswordSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 12 }}>
                  <div>
                    <FieldLabel icon={Lock}>Current Password</FieldLabel>
                    <InputField
                      value={currentPw} onChange={setCurrentPw}
                      placeholder="Enter current password"
                      type={showCurrent ? 'text' : 'password'}
                      required
                      suffix={
                        <button type="button" onClick={() => setShowCurrent(v => !v)} tabIndex={-1}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.light, display: 'flex', padding: 4, flexShrink: 0 }}>
                          {showCurrent ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      }
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <FieldLabel icon={Lock}>New Password</FieldLabel>
                      <InputField
                        value={newPw} onChange={setNewPw}
                        placeholder="Min. 8 chars"
                        type={showNew ? 'text' : 'password'}
                        required
                        suffix={
                          <button type="button" onClick={() => setShowNew(v => !v)} tabIndex={-1}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.light, display: 'flex', padding: 4, flexShrink: 0 }}>
                            {showNew ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        }
                      />
                    </div>
                    <div>
                      <FieldLabel icon={Lock}>Confirm Password</FieldLabel>
                      <div style={{
                        background: T.surface, border: `1.5px solid ${confirmPw && confirmPw !== newPw ? '#FCA5A5' : T.border}`,
                        borderRadius: 8,
                      }}
                      onFocusCapture={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${T.teal}80`; }}
                      onBlurCapture={e => { (e.currentTarget as HTMLDivElement).style.borderColor = confirmPw && confirmPw !== newPw ? '#FCA5A5' : T.border; }}
                      >
                        <input
                          type="password" value={confirmPw}
                          onChange={e => setConfirmPw(e.target.value)}
                          placeholder="Repeat new password"
                          required
                          style={{
                            width: '100%', background: 'transparent', border: 'none', outline: 'none',
                            fontSize: 13, color: T.navy, padding: '9px 12px',
                            fontFamily: 'inherit', boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ flex: 1 }} />
                  {pwStatus && <StatusPill type={pwStatus.type} msg={pwStatus.msg} />}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8, borderTop: `1px solid ${T.border}` }}>
                    <TealBtn loading={pwLoading} label="Update Password" />
                  </div>
                </form>
              </Card>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

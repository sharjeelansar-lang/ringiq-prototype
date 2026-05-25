'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User, Mail, Phone, Briefcase, Lock, Eye, EyeOff,
  CheckCircle2, AlertCircle, Loader2, Shield, KeyRound,
  Fingerprint, Pencil,
} from 'lucide-react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { cn } from '@/lib/utils';

interface UserProfile {
  userId: string;
  email:  string;
  name:   string;
  title:  string;
  phone:  string;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? 'A';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function FieldLabel({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.13em] uppercase text-slate-500 mb-1.5">
      <Icon size={9} className="text-slate-600 shrink-0" />
      {children}
    </label>
  );
}

function inputCls(disabled: boolean) {
  return cn(
    'w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2',
    'text-sm placeholder:text-slate-600 outline-none',
    'transition-all duration-150',
    disabled
      ? 'text-slate-500 cursor-default opacity-50'
      : 'text-slate-100 focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/10 hover:border-slate-700',
  );
}

function StatusPill({ type, msg }: { type: 'success' | 'error'; msg: string }) {
  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium',
      'animate-[fade-up_.25s_ease-out_both]',
      type === 'success'
        ? 'bg-emerald-500/6 border border-emerald-500/15 text-emerald-400'
        : 'bg-red-500/6 border border-red-500/15 text-red-400',
    )}>
      {type === 'success' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
      {msg}
    </div>
  );
}

function CyanBtn({ loading, label, type = 'submit' }: { loading: boolean; label: string; type?: 'submit' | 'button' }) {
  return (
    <button
      type={type}
      disabled={loading}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold',
        'bg-cyan-500 hover:bg-cyan-400 text-slate-950',
        'transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40',
        'disabled:opacity-50 disabled:cursor-not-allowed',
      )}
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
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
    <div className="flex flex-col rounded-xl border border-slate-800/60 bg-slate-900/50 overflow-hidden h-full">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800/50 shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
          style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)' }}>
          <Icon size={14} className="text-cyan-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-white leading-none">{title}</h2>
          <p className="text-[11px] text-slate-500 mt-1 leading-none truncate">{description}</p>
        </div>
        {action}
      </div>
      <div className="flex flex-col flex-1 px-5 py-4">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();

  const [profile,       setProfile]       = useState<UserProfile | null>(null);
  const [name,          setName]          = useState('');
  const [title,         setTitle]         = useState('');
  const [phone,         setPhone]         = useState('');
  const [isEditing,     setIsEditing]     = useState(false);
  const [profileLoading,setProfileLoading]= useState(false);
  const [profileStatus, setProfileStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

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
    if (newPw !== confirmPw)   { setPwStatus({ type: 'error', msg: 'Passwords do not match' }); return; }
    if (newPw.length < 8)      { setPwStatus({ type: 'error', msg: 'Min. 8 characters required' }); return; }
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
      <div className="flex h-screen bg-slate-950 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={20} className="text-slate-600 animate-spin" />
        </div>
      </div>
    );
  }

  const avatarLabel = initials(name || 'Admin');

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* ── Page header ── */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-slate-800/70 bg-slate-950/80 backdrop-blur-sm shrink-0">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Settings</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage your account and credentials</p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-700 font-mono">
            <Shield size={10} />
            <span>JWT · AES-256</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-4 h-full">

            {/* ── Identity strip ── */}
            <div className="flex items-center gap-4 px-5 py-3.5 rounded-xl border border-slate-800/60 bg-slate-900/50 shrink-0">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0 select-none"
                style={{ background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)' }}
              >
                {avatarLabel}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate leading-none">{name || 'Admin'}</p>
                <p className="text-xs text-slate-500 mt-1 truncate leading-none">{profile.email}</p>
              </div>
              {title && (
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/40">
                  <Briefcase size={10} className="text-slate-500" />
                  <span className="text-[11px] text-slate-400 font-medium">{title}</span>
                </div>
              )}
              <div className="w-px h-6 bg-slate-800 shrink-0" />
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-medium font-mono">Active</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 shrink-0">
                <Fingerprint size={14} />
              </div>
            </div>

            {/* ── Two-column cards ── */}
            <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">

              {/* ── Profile card ── */}
              <Card
                title="Profile Information"
                description="Update display name, title, and contact"
                icon={User}
                action={
                  !isEditing ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0',
                        'text-slate-400 border border-slate-700/40',
                        'hover:border-slate-600 hover:text-slate-200 transition-all',
                      )}
                    >
                      <Pencil size={11} />
                      Edit Profile
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="text-xs text-slate-500 hover:text-slate-300 transition-colors shrink-0 px-2"
                    >
                      Cancel
                    </button>
                  )
                }
              >
                <form onSubmit={handleProfileSave} className="flex flex-col flex-1 gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel icon={User}>Display Name</FieldLabel>
                      <input
                        className={inputCls(!isEditing)}
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Jane Smith"
                        disabled={!isEditing}
                        required
                      />
                    </div>
                    <div>
                      <FieldLabel icon={Briefcase}>Job Title</FieldLabel>
                      <input
                        className={inputCls(!isEditing)}
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Operations Manager"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel icon={Phone}>Phone Number</FieldLabel>
                      <input
                        className={inputCls(!isEditing)}
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        type="tel"
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <FieldLabel icon={Mail}>Email Address</FieldLabel>
                      <div className={cn(inputCls(true), 'flex items-center gap-2')}>
                        <span className="flex-1 truncate text-sm">{profile.email}</span>
                        <span className="shrink-0 text-[9px] font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-600 border border-slate-700/40">
                          Read-only
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1" />
                  {profileStatus && <StatusPill type={profileStatus.type} msg={profileStatus.msg} />}

                  <div className="flex justify-end pt-1 border-t border-slate-800/40">
                    <div className={cn('transition-opacity duration-150', isEditing ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
                      <CyanBtn loading={profileLoading} label="Save Changes" />
                    </div>
                  </div>
                </form>
              </Card>

              {/* ── Password card ── */}
              <Card
                title="Change Password"
                description="Requires your current password to confirm"
                icon={KeyRound}
              >
                <form onSubmit={handlePasswordSave} className="flex flex-col flex-1 gap-3">
                  <div>
                    <FieldLabel icon={Lock}>Current Password</FieldLabel>
                    <div className={cn(inputCls(false), 'flex items-center gap-1 p-0! overflow-hidden')}>
                      <input
                        type={showCurrent ? 'text' : 'password'}
                        className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 outline-none"
                        value={currentPw}
                        onChange={e => setCurrentPw(e.target.value)}
                        placeholder="Enter current password"
                        required
                      />
                      <button type="button" onClick={() => setShowCurrent(v => !v)} tabIndex={-1}
                        className="px-3 text-slate-600 hover:text-slate-400 transition-colors shrink-0">
                        {showCurrent ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel icon={Lock}>New Password</FieldLabel>
                      <div className={cn(inputCls(false), 'flex items-center gap-1 p-0! overflow-hidden')}>
                        <input
                          type={showNew ? 'text' : 'password'}
                          className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 outline-none"
                          value={newPw}
                          onChange={e => setNewPw(e.target.value)}
                          placeholder="Min. 8 chars"
                          required
                        />
                        <button type="button" onClick={() => setShowNew(v => !v)} tabIndex={-1}
                          className="px-3 text-slate-600 hover:text-slate-400 transition-colors shrink-0">
                          {showNew ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <FieldLabel icon={Lock}>Confirm Password</FieldLabel>
                      <input
                        type="password"
                        className={cn(
                          inputCls(false),
                          confirmPw && confirmPw !== newPw ? 'border-red-500/35' : '',
                        )}
                        value={confirmPw}
                        onChange={e => setConfirmPw(e.target.value)}
                        placeholder="Repeat new password"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex-1" />
                  {pwStatus && <StatusPill type={pwStatus.type} msg={pwStatus.msg} />}
                  <div className="flex justify-end pt-1 border-t border-slate-800/40">
                    <CyanBtn loading={pwLoading} label="Update Password" />
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

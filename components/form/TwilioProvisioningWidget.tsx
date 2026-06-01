'use client';

import { useState, useEffect } from 'react';
import {
  Phone, Search, CheckCircle2, Loader2,
  Building2, Zap, ArrowRight, Mic, MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AvailableNumber {
  phoneNumber: string;
  friendlyName: string;
  locality: string;
  region: string;
  postalCode: string;
  capabilities: { voice: boolean; sms: boolean; mms: boolean };
}

interface SubAccount {
  sid: string;
  authToken: string;
  friendlyName: string;
  status: string;
}

interface PurchasedNumber {
  sid: string;
  phoneNumber: string;
  friendlyName: string;
}

export interface TwilioProvisionResult {
  subAccount: SubAccount | null;
  purchasedNumber: PurchasedNumber;
}

interface Props {
  practiceName: string;
  onProvisioned: (result: TwilioProvisionResult) => void;
  onSkip: () => void;
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

// ── Step badge ────────────────────────────────────────────────────────────────

function StepBadge({ n, done, active }: { n: number; done: boolean; active: boolean }) {
  const bg    = done   ? '#10B981' : active ? T.teal : T.border;
  const color = done   ? '#fff'    : active ? '#fff' : T.light;
  return (
    <div style={{
      width: 24, height: 24, borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700, flexShrink: 0,
      background: bg, color,
      boxShadow: active ? `0 0 0 3px ${T.tealBd}` : 'none',
      transition: 'all 0.15s',
    }}>
      {done ? '✓' : n}
    </div>
  );
}

// ── Main widget ───────────────────────────────────────────────────────────────

export function TwilioProvisioningWidget({ practiceName, onProvisioned, onSkip }: Props) {
  const [subAccount,     setSubAccount]     = useState<SubAccount | null>(null);
  const [subLoading,     setSubLoading]     = useState(false);
  const [subError,       setSubError]       = useState('');
  const [friendlyName,   setFriendlyName]   = useState(practiceName || '');

  const [areaCode,       setAreaCode]       = useState('');
  const [searchResults,  setSearchResults]  = useState<AvailableNumber[]>([]);
  const [searchLoading,  setSearchLoading]  = useState(false);
  const [searchError,    setSearchError]    = useState('');
  const [hasSearched,    setHasSearched]    = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<AvailableNumber | null>(null);

  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError,   setPurchaseError]   = useState('');
  const [purchased,       setPurchased]       = useState<PurchasedNumber | null>(null);

  const subStep      = subAccount ? 'done' : 'active';
  const searchStep   = subAccount && !purchased ? 'active' : purchased ? 'done' : 'pending';
  const purchaseStep = selectedNumber && !purchased ? 'active' : purchased ? 'done' : 'pending';

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_TWILIO_TEST_MODE === 'true') {
      toast.warning(
        'Prototype mode — sub-account creation and number purchase are simulated.',
        { duration: 8000, id: 'twilio-test-mode' },
      );
    }
  }, []);

  // ── Step 1: Create sub-account ─────────────────────────────────────────────

  const createSubAccount = async () => {
    setSubLoading(true); setSubError('');
    try {
      const res  = await fetch('/api/twilio/subaccount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendlyName: friendlyName.trim() || 'New Office' }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setSubAccount(json.subAccount);
      toast.success(json._testMode ? 'Sub-account simulated (test mode).' : 'Sub-account created.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sub-account creation failed';
      setSubError(msg); toast.error(`Sub-account failed: ${msg}`);
    } finally { setSubLoading(false); }
  };

  // ── Step 2: Search numbers ─────────────────────────────────────────────────

  const searchNumbers = async () => {
    if (areaCode.length !== 3) return;
    setSearchLoading(true); setSearchError(''); setSearchResults([]);
    setHasSearched(true); setSelectedNumber(null);
    try {
      const res  = await fetch(`/api/twilio/numbers?areaCode=${areaCode}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setSearchResults(json.numbers);
      if (json.numbers.length === 0) {
        setSearchError(`No numbers available in area code ${areaCode}`);
        toast.warning(`No numbers in ${areaCode}. Try a different one.`);
      } else {
        toast.success(`Found ${json.numbers.length} numbers in area code ${areaCode}.`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Search failed';
      setSearchError(msg); toast.error(`Number search failed: ${msg}`);
    } finally { setSearchLoading(false); }
  };

  // ── Step 3: Purchase ──────────────────────────────────────────────────────

  const purchaseNumber = async () => {
    if (!selectedNumber) return;
    setPurchaseLoading(true); setPurchaseError('');
    try {
      const res  = await fetch('/api/twilio/numbers/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber:     selectedNumber.phoneNumber,
          friendlyName:    practiceName || selectedNumber.friendlyName,
          subAccountSid:   subAccount?.sid,
          subAccountToken: subAccount?.authToken,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      const result = json.number as PurchasedNumber;
      const confirmedSubAccount: SubAccount | null = json.subAccountSid
        ? {
            sid:          json.subAccountSid,
            authToken:    json.subAccountToken ?? subAccount?.authToken ?? '',
            friendlyName: subAccount?.friendlyName ?? '',
            status:       subAccount?.status ?? 'active',
          }
        : subAccount;
      setPurchased(result);
      onProvisioned({ subAccount: confirmedSubAccount, purchasedNumber: result });
      toast.success(
        json._testMode
          ? 'Number purchase simulated (test mode).'
          : `${result.phoneNumber} provisioned — proceed to VAPI setup.`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Purchase failed';
      setPurchaseError(msg); toast.error(`Purchase failed: ${msg}`);
    } finally { setPurchaseLoading(false); }
  };

  // ── Success state ─────────────────────────────────────────────────────────

  if (purchased) {
    return (
      <div style={{
        borderRadius: 12, border: '1px solid rgba(16,185,129,0.2)',
        background: 'rgba(16,185,129,0.04)', padding: 24,
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CheckCircle2 size={17} style={{ color: '#10B981' }} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#059669', margin: 0 }}>Twilio number provisioned</p>
            <p style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Continue to the VAPI step to deploy the AI assistant.</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '10px 12px', borderRadius: 8, background: T.hover, border: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 10, color: T.light, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Phone Number</span>
            <span style={{ fontSize: 13, fontFamily: 'var(--font-geist-mono)', color: '#059669' }}>{purchased.phoneNumber}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '10px 12px', borderRadius: 8, background: T.hover, border: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 10, color: T.light, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Twilio SID</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-geist-mono)', color: T.muted, wordBreak: 'break-all' }}>{purchased.sid}</span>
          </div>
          {subAccount && (
            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 4, padding: '10px 12px', borderRadius: 8, background: T.hover, border: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 10, color: T.light, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Sub-Account SID</span>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-geist-mono)', color: T.muted }}>{subAccount.sid}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Main 3-step form ──────────────────────────────────────────────────────

  return (
    <div style={{ borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface, overflow: 'hidden' }}>

      {/* Card header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: `1px solid ${T.border}`,
        background: T.hover,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: T.tealFd, border: `1px solid ${T.tealBd}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Phone size={14} style={{ color: T.teal }} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: T.navy, margin: 0 }}>Twilio Provisioning</p>
            <p style={{ fontSize: 11, color: T.muted }}>Create sub-account · Search numbers · Purchase</p>
          </div>
        </div>
        <button type="button" onClick={onSkip} style={{
          fontSize: 12, color: T.muted, background: 'none', border: 'none',
          cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit',
        }}>
          Skip — enter manually
        </button>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Step 1 */}
        <div style={{ display: 'flex', gap: 14 }}>
          <StepBadge n={1} done={!!subAccount} active={subStep === 'active'} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: T.navy, margin: 0 }}>Create Twilio Sub-Account</p>
                <p style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Isolates this tenant's billing and numbers</p>
              </div>
              {subAccount && (
                <span style={{
                  fontSize: 11, fontFamily: 'var(--font-geist-mono)', color: '#059669',
                  background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                  padding: '3px 8px', borderRadius: 100,
                }}>
                  {subAccount.sid.slice(0, 16)}…
                </span>
              )}
            </div>
            {!subAccount ? (
              <>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: T.surface, border: `1.5px solid ${T.border}`,
                  borderRadius: 8, padding: '8px 12px',
                }}>
                  <Building2 size={13} style={{ color: T.light, flexShrink: 0 }} />
                  <input
                    type="text" value={friendlyName}
                    onChange={(e) => setFriendlyName(e.target.value)}
                    placeholder="Friendly name for this sub-account"
                    style={{
                      flex: 1, background: 'transparent', border: 'none', outline: 'none',
                      fontSize: 13, color: T.navy, fontFamily: 'inherit',
                    }}
                  />
                </div>
                {subError && <p style={{ fontSize: 11, color: '#DC2626', margin: 0 }}>{subError}</p>}
                <button type="button" onClick={createSubAccount} disabled={subLoading} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  background: '#274993', color: '#fff', border: 'none',
                  cursor: subLoading ? 'not-allowed' : 'pointer',
                  opacity: subLoading ? 0.6 : 1, fontFamily: 'inherit',
                  width: 'fit-content',
                }}>
                  {subLoading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={13} />}
                  {subLoading ? 'Creating…' : 'Create Sub-Account'}
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#059669' }}>
                <CheckCircle2 size={13} /> Sub-account created · Status: {subAccount.status}
              </div>
            )}
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${T.border}` }} />

        {/* Step 2 */}
        <div style={{ display: 'flex', gap: 14, opacity: !subAccount ? 0.45 : 1, pointerEvents: !subAccount ? 'none' : 'auto' }}>
          <StepBadge n={2} done={!!purchased} active={searchStep === 'active'} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minWidth: 0 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: T.navy, margin: 0 }}>Search Available Numbers</p>
              <p style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Enter an area code to find local numbers</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, flex: 1,
                background: T.surface, border: `1.5px solid ${T.border}`,
                borderRadius: 8, padding: '8px 12px',
              }}>
                <span style={{ fontSize: 13, color: T.muted }}>+1</span>
                <div style={{ width: 1, height: 16, background: T.border }} />
                <input
                  type="text" value={areaCode}
                  onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  onKeyDown={(e) => e.key === 'Enter' && searchNumbers()}
                  placeholder="Area code (e.g. 586)"
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    fontSize: 13, color: T.navy, fontFamily: 'var(--font-geist-mono)',
                  }}
                />
              </div>
              <button type="button" onClick={searchNumbers}
                disabled={areaCode.length !== 3 || searchLoading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  background: T.tealFd, color: T.teal, border: `1.5px solid ${T.tealBd}`,
                  cursor: areaCode.length !== 3 || searchLoading ? 'not-allowed' : 'pointer',
                  opacity: areaCode.length !== 3 || searchLoading ? 0.5 : 1,
                  fontFamily: 'inherit', flexShrink: 0,
                }}>
                {searchLoading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={13} />}
                {searchLoading ? 'Searching…' : 'Search'}
              </button>
            </div>
            {searchError && <p style={{ fontSize: 11, color: '#DC2626', margin: 0 }}>{searchError}</p>}
            {hasSearched && !searchLoading && searchResults.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 240, overflowY: 'auto' }}>
                {searchResults.map((num) => {
                  const isSelected = selectedNumber?.phoneNumber === num.phoneNumber;
                  return (
                    <div key={num.phoneNumber} onClick={() => setSelectedNumber(num)} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                      padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                      border: `1.5px solid ${isSelected ? T.tealBd : T.border}`,
                      background: isSelected ? T.tealFd : T.surface,
                      transition: 'all 0.12s',
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: 13, fontFamily: 'var(--font-geist-mono)', fontWeight: 600, color: T.navy }}>
                          {num.phoneNumber}
                        </span>
                        <span style={{ fontSize: 11, color: T.muted }}>{num.locality}, {num.region} {num.postalCode}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {num.capabilities.voice && <Mic size={12} style={{ color: T.light }} />}
                        {num.capabilities.sms && <MessageSquare size={12} style={{ color: T.light }} />}
                        <div style={{
                          width: 16, height: 16, borderRadius: '50%',
                          border: `2px solid ${isSelected ? T.teal : T.border}`,
                          background: isSelected ? T.teal : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.12s',
                        }}>
                          {isSelected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${T.border}` }} />

        {/* Step 3 */}
        <div style={{ display: 'flex', gap: 14, opacity: (!selectedNumber || purchased) ? 0.45 : 1, pointerEvents: (!selectedNumber || purchased) ? 'none' : 'auto' }}>
          <StepBadge n={3} done={!!purchased} active={purchaseStep === 'active'} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minWidth: 0 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: T.navy, margin: 0 }}>Purchase Number</p>
              <p style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Finalises purchase under this practice's sub-account</p>
            </div>
            {selectedNumber && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 8,
                background: T.hover, border: `1px solid ${T.border}`,
              }}>
                <Phone size={14} style={{ color: T.teal, flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontFamily: 'var(--font-geist-mono)', color: T.navy }}>{selectedNumber.phoneNumber}</span>
                  <span style={{ fontSize: 11, color: T.muted }}>{selectedNumber.locality}, {selectedNumber.region}</span>
                </div>
                <ArrowRight size={13} style={{ color: T.light }} />
              </div>
            )}
            {purchaseError && <p style={{ fontSize: 11, color: '#DC2626', margin: 0 }}>{purchaseError}</p>}
            <button type="button" onClick={purchaseNumber}
              disabled={!selectedNumber || purchaseLoading}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                background: '#10B981', color: '#fff', border: 'none',
                cursor: !selectedNumber || purchaseLoading ? 'not-allowed' : 'pointer',
                opacity: !selectedNumber || purchaseLoading ? 0.5 : 1,
                boxShadow: '0 4px 14px rgba(16,185,129,0.25)',
                fontFamily: 'inherit', width: 'fit-content',
              }}>
              {purchaseLoading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={13} />}
              {purchaseLoading ? 'Purchasing…' : 'Confirm Purchase'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

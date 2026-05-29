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

// ── Small atoms ───────────────────────────────────────────────────────────────

function StepBadge({ n, done, active }: { n: number; done: boolean; active: boolean }) {
  return (
    <div className={cn(
      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all',
      done   ? 'bg-emerald-500 text-slate-950'
      : active ? 'bg-cyan-500 text-slate-950'
      : 'bg-slate-800 text-slate-500',
    )}>
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
      // Use credentials echoed from the purchase response as the authoritative source.
      // This avoids any React stale-closure or watch() miss on subAccount.authToken.
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
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-300">Twilio number provisioned</p>
            <p className="text-xs text-slate-500 mt-0.5">Continue to the VAPI step to deploy the AI assistant.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Phone Number</span>
            <span className="text-sm font-mono text-emerald-400">{purchased.phoneNumber}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Twilio SID</span>
            <span className="text-xs font-mono text-slate-400 break-all">{purchased.sid}</span>
          </div>
          {subAccount && (
            <div className="col-span-2 flex flex-col gap-1 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Sub-Account SID</span>
              <span className="text-xs font-mono text-slate-400">{subAccount.sid}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Main 3-step form ──────────────────────────────────────────────────────

  return (
    <div className="rounded-xl border border-slate-800/60 bg-slate-900/20">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60 bg-slate-900/40">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg border border-cyan-400/20 bg-cyan-400/10">
            <Phone size={15} className="text-cyan-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100">Twilio Provisioning</p>
            <p className="text-xs text-slate-500">Create sub-account · Search numbers · Purchase</p>
          </div>
        </div>
        <button type="button" onClick={onSkip}
          className="text-xs text-slate-600 hover:text-slate-400 transition-colors underline">
          Skip — enter manually
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4">

        {/* Step 1 */}
        <div className="flex gap-4">
          <StepBadge n={1} done={!!subAccount} active={subStep === 'active'} />
          <div className="flex flex-col gap-3 flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-200">Create Twilio Sub-Account</p>
                <p className="text-xs text-slate-500 mt-0.5">Isolates this tenant's billing and numbers</p>
              </div>
              {subAccount && (
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
                  {subAccount.sid.slice(0, 16)}…
                </span>
              )}
            </div>
            {!subAccount ? (
              <>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/30 transition-all">
                  <Building2 size={13} className="text-slate-500 shrink-0" />
                  <input type="text" value={friendlyName} onChange={(e) => setFriendlyName(e.target.value)}
                    placeholder="Friendly name for this sub-account"
                    className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-600 outline-none" />
                </div>
                {subError && <p className="text-xs text-red-400">{subError}</p>}
                <button type="button" onClick={createSubAccount} disabled={subLoading}
                  className="flex items-center gap-2 w-fit px-4 py-2 rounded-lg text-sm font-semibold
                    bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700
                    transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {subLoading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} className="text-cyan-400" />}
                  {subLoading ? 'Creating…' : 'Create Sub-Account'}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <CheckCircle2 size={13} /> Sub-account created · Status: {subAccount.status}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-800/40" />

        {/* Step 2 */}
        <div className={cn('flex gap-4', !subAccount && 'opacity-40 pointer-events-none')}>
          <StepBadge n={2} done={!!purchased} active={searchStep === 'active'} />
          <div className="flex flex-col gap-3 flex-1 min-w-0">
            <div>
              <p className="text-sm font-semibold text-slate-200">Search Available Numbers</p>
              <p className="text-xs text-slate-500 mt-0.5">Enter an area code to find local numbers</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 flex-1">
                <span className="text-slate-500 text-sm">+1</span>
                <div className="w-px h-4 bg-slate-700" />
                <input type="text" value={areaCode}
                  onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  onKeyDown={(e) => e.key === 'Enter' && searchNumbers()}
                  placeholder="Area code (e.g. 586)"
                  className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-600 outline-none font-mono" />
              </div>
              <button type="button" onClick={searchNumbers}
                disabled={areaCode.length !== 3 || searchLoading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold
                  bg-cyan-500/10 hover:bg-cyan-500/15 text-cyan-300 border border-cyan-500/30
                  transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                {searchLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                {searchLoading ? 'Searching…' : 'Search'}
              </button>
            </div>
            {searchError && <p className="text-xs text-red-400">{searchError}</p>}
            {hasSearched && !searchLoading && searchResults.length > 0 && (
              <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto pr-1">
                {searchResults.map((num) => (
                  <div key={num.phoneNumber} onClick={() => setSelectedNumber(num)}
                    className={cn(
                      'flex items-center justify-between gap-3 px-3.5 py-3 rounded-lg border cursor-pointer transition-all duration-150',
                      selectedNumber?.phoneNumber === num.phoneNumber
                        ? 'bg-cyan-500/8 border-cyan-500/40 shadow-[0_0_0_1px_rgba(6,182,212,0.15)]'
                        : 'bg-slate-900/40 border-slate-700/40 hover:border-slate-600/60',
                    )}>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-mono font-semibold text-slate-100">{num.phoneNumber}</span>
                      <span className="text-xs text-slate-500">{num.locality}, {num.region} {num.postalCode}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {num.capabilities.voice && <Mic size={12} className="text-slate-500" />}
                      {num.capabilities.sms && <MessageSquare size={12} className="text-slate-500" />}
                      <div className={cn(
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all',
                        selectedNumber?.phoneNumber === num.phoneNumber ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600',
                      )}>
                        {selectedNumber?.phoneNumber === num.phoneNumber && (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-800/40" />

        {/* Step 3 */}
        <div className={cn('flex gap-4', (!selectedNumber || purchased) && 'opacity-40 pointer-events-none')}>
          <StepBadge n={3} done={!!purchased} active={purchaseStep === 'active'} />
          <div className="flex flex-col gap-3 flex-1 min-w-0">
            <div>
              <p className="text-sm font-semibold text-slate-200">Purchase Number</p>
              <p className="text-xs text-slate-500 mt-0.5">Finalises purchase under this practice's sub-account</p>
            </div>
            {selectedNumber && (
              <div className="flex items-center gap-3 px-3.5 py-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <Phone size={14} className="text-cyan-400 shrink-0" />
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className="text-sm font-mono text-slate-100">{selectedNumber.phoneNumber}</span>
                  <span className="text-xs text-slate-500">{selectedNumber.locality}, {selectedNumber.region}</span>
                </div>
                <ArrowRight size={14} className="text-slate-600" />
              </div>
            )}
            {purchaseError && <p className="text-xs text-red-400">{purchaseError}</p>}
            <button type="button" onClick={purchaseNumber}
              disabled={!selectedNumber || purchaseLoading}
              className="flex items-center gap-2 w-fit px-5 py-2.5 rounded-lg text-sm font-bold
                bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all
                shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed">
              {purchaseLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              {purchaseLoading ? 'Purchasing…' : 'Confirm Purchase'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

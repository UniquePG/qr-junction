'use client';

import React, { useState } from 'react';
import { Wifi, Copy, Check, Send, Award, Key, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';

interface WifiDetailsProps {
  shortCode: string;
  qrCodeId: number;
  userId: number;
  ssid: string;
  password?: string;
  encryption?: string;
}

export default function WifiDetailsClient({
  shortCode,
  qrCodeId,
  userId,
  ssid,
  password = '',
  encryption = 'WPA'
}: WifiDetailsProps) {
  const [copied, setCopied] = useState(false);
  
  // Lead state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    toast.success('Password copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error('Name and Email are required.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Submit lead
      const leadRes = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          qrCodeId,
          userId,
        }),
      });

      if (!leadRes.ok) throw new Error('Failed to submit lead');

      // 2. Log conversion event
      await fetch('/api/conversions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCodeId,
          eventType: 'FORM_SUBMIT',
          eventName: 'wifi_lead_capture',
          value: 10.0, // default conversion value
        }),
      });

      setLeadCaptured(true);
      toast.success('Thank you! Details submitted successfully.');
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white py-12 px-4 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[120px]" />

      <div className="w-full max-w-lg bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10 animate-fade-in space-y-8">
        <div className="text-center">
          <div className="inline-flex p-4 bg-primary/10 rounded-full border border-primary/20 text-primary mb-4 animate-pulse">
            <Wifi className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-bold text-white">Connect to Wi-Fi</h1>
          <p className="text-slate-400 text-sm mt-1">Scan registered network and connect details below</p>
        </div>

        {/* Network Details Card */}
        <div className="bg-slate-950/80 rounded-xl p-6 border border-slate-850 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Network SSID</span>
            </div>
            <span className="font-bold text-white text-base">{ssid}</span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Security</span>
            </div>
            <span className="font-medium text-slate-300 text-sm">{encryption}</span>
          </div>

          {password && (
            <div className="flex items-center justify-between pt-1">
              <div className="flex flex-col">
                <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider mb-1">Password</span>
                <span className="font-mono text-white text-sm bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
                  {password}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer select-none active:scale-95"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Connection Instructions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">How to connect manually</h3>
          <ol className="list-decimal list-inside text-slate-400 text-xs space-y-2 pl-1 leading-relaxed">
            <li>Open the Wi-Fi settings panel on your phone.</li>
            <li>Select the network named <strong className="text-white">"{ssid}"</strong>.</li>
            <li>Paste/enter the copied password when prompted.</li>
            <li>Enjoy your high-speed connection!</li>
          </ol>
        </div>

        {/* Lead Generation Form Widget */}
        <div className="border-t border-slate-800 pt-6">
          {leadCaptured ? (
            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-6 text-center space-y-2">
              <div className="inline-flex p-2 bg-emerald-500/10 rounded-full text-emerald-400 mb-1">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-sm">You are on the list!</h4>
              <p className="text-xs text-slate-400">Welcome to our updates. We will send you exclusive offers directly to your inbox.</p>
            </div>
          ) : (
            <form onSubmit={handleLeadSubmit} className="bg-slate-950/40 border border-slate-850 p-6 rounded-xl space-y-4">
              <div className="text-center md:text-left">
                <h4 className="font-semibold text-white text-sm">Unlock Exclusive Customer Perks</h4>
                <p className="text-slate-400 text-xs mt-1">Subscribe for special deals, WiFi speed boosts, and event updates.</p>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 text-xs text-white outline-none focus:border-primary transition-all"
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 text-xs text-white outline-none focus:border-primary transition-all"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number (Optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 text-xs text-white outline-none focus:border-primary transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/95 text-white py-2.5 rounded-xl text-xs font-semibold cursor-pointer active:scale-95 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <span>Subscribe & Connect</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

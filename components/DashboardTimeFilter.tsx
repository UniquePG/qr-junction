'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronDown, Check } from 'lucide-react';

export type TimePeriod = '1day' | '7days' | '30days' | 'custom';

interface DashboardTimeFilterProps {
  onFilterChange: (startDate: Date, endDate: Date, label: string) => void;
}

export default function DashboardTimeFilter({ onFilterChange }: DashboardTimeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activePeriod, setActivePeriod] = useState<TimePeriod>('7days');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [label, setLabel] = useState('Last 7 Days');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPeriod = (period: TimePeriod) => {
    let start = new Date();
    let end = new Date();
    let newLabel = '';

    if (period === '1day') {
      start.setDate(end.getDate() - 1);
      newLabel = 'Last 24 Hours';
      setActivePeriod(period);
      setLabel(newLabel);
      onFilterChange(start, end, newLabel);
      setIsOpen(false);
    } else if (period === '7days') {
      start.setDate(end.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      newLabel = 'Last 7 Days';
      setActivePeriod(period);
      setLabel(newLabel);
      onFilterChange(start, end, newLabel);
      setIsOpen(false);
    } else if (period === '30days') {
      start.setDate(end.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      newLabel = 'Last 30 Days';
      setActivePeriod(period);
      setLabel(newLabel);
      onFilterChange(start, end, newLabel);
      setIsOpen(false);
    } else {
      setActivePeriod('custom');
    }
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStart || !customEnd) return;

    const start = new Date(customStart);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(customEnd);
    end.setHours(23, 59, 59, 999);

    if (start > end) {
      alert('Start date must be prior to end date.');
      return;
    }

    const formattedStart = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
    const formattedEnd = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
    const newLabel = `${formattedStart} - ${formattedEnd}`;

    setLabel(newLabel);
    onFilterChange(start, end, newLabel);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs font-bold text-[#001B50] bg-white hover:bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <CalendarIcon className="w-4 h-4 text-primary" />
        <span>{label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl bg-white border border-slate-200/80 shadow-lg ring-1 ring-black/5 focus:outline-none z-50 animate-fade-in divide-y divide-slate-100 max-w-[calc(100vw-2rem)]">
          {/* Quick Selectors */}
          <div className="py-2.5">
            <button
              onClick={() => handleSelectPeriod('1day')}
              className="w-full flex items-center justify-between px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Last 24 Hours
              </span>
              {activePeriod === '1day' && <Check className="w-3.5 h-3.5 text-primary" />}
            </button>
            
            <button
              onClick={() => handleSelectPeriod('7days')}
              className="w-full flex items-center justify-between px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                Last 7 Days
              </span>
              {activePeriod === '7days' && <Check className="w-3.5 h-3.5 text-primary" />}
            </button>
            
            <button
              onClick={() => handleSelectPeriod('30days')}
              className="w-full flex items-center justify-between px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                Last 30 Days
              </span>
              {activePeriod === '30days' && <Check className="w-3.5 h-3.5 text-primary" />}
            </button>
          </div>

          {/* Custom Datepicker Form */}
          <div className="p-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">Custom Range</span>
            <form onSubmit={handleApplyCustom} className="space-y-3">
              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => {
                    setCustomStart(e.target.value);
                    setActivePeriod('custom');
                  }}
                  className="w-full text-xs bg-slate-50 border border-slate-200/80 rounded-lg p-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => {
                    setCustomEnd(e.target.value);
                    setActivePeriod('custom');
                  }}
                  className="w-full text-xs bg-slate-50 border border-slate-200/80 rounded-lg p-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!customStart || !customEnd}
                className="w-full text-xs font-bold text-white bg-primary hover:bg-primary-hover disabled:bg-slate-200 disabled:text-slate-400 p-2.5 rounded-xl transition-all"
              >
                Apply Custom Range
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ScrollProgressIndicator Component
 * A luxury right-aligned vertical scrubber rail displaying live frame index and milestone checkpoints.
 */
import React from 'react';
import { TOTAL_FRAMES } from '../utils/frameConfig';

export default function ScrollProgressIndicator({ scrollProgress, currentFrame, onNavigateSection }) {
  const milestones = [
    { label: '01 / HERO', pct: 0 },
    { label: '02 / ROAST', pct: 0.42 },
    { label: '03 / ORDER', pct: 0.85 },
  ];

  return (
    <div className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-end gap-6 pointer-events-none">
      
      {/* Live Frame Counter Pill */}
      <div className="glass-panel px-3 py-1.5 rounded-full border border-white/10 font-mono text-[10px] text-cream-300 tracking-wider flex items-center gap-2 pointer-events-auto">
        <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
        <span>FRAME <strong className="text-gold-400">{String(currentFrame + 1).padStart(3, '0')}</strong> / {TOTAL_FRAMES}</span>
      </div>

      {/* Vertical Rail */}
      <div className="relative flex flex-col items-center gap-4 py-2 pointer-events-auto">
        {/* Track */}
        <div className="w-[2px] h-36 bg-white/10 rounded-full relative overflow-hidden">
          <div
            className="w-full bg-gold-gradient rounded-full transition-all duration-75"
            style={{ height: `${Math.min(100, Math.max(0, scrollProgress * 100))}%` }}
          />
        </div>

        {/* Milestone Buttons */}
        <div className="flex flex-col gap-3 items-end">
          {milestones.map((m) => {
            const isActive = Math.abs(scrollProgress - m.pct) < 0.15;
            return (
              <button
                key={m.label}
                onClick={() => onNavigateSection(m.pct)}
                className="group flex items-center gap-2 text-right focus:outline-none"
              >
                <span
                  className={`text-[9px] font-mono tracking-widest uppercase transition-colors ${
                    isActive ? 'text-gold-400 font-bold' : 'text-cream-400/60 group-hover:text-cream-200'
                  }`}
                >
                  {m.label}
                </span>
                <span
                  className={`w-2 h-2 rounded-full border transition-all ${
                    isActive
                      ? 'bg-gold-500 border-gold-500 shadow-luxury-glow scale-125'
                      : 'border-white/30 group-hover:border-gold-400'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}

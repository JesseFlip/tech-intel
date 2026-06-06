// ui.jsx — small shared presentational components for the Idea Evaluator.
// Kept dependency-free and styled with Tailwind to match the dark slate theme.

import { useState } from 'react';

// Primary / secondary / ghost buttons.
export function Button({ variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-40 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg shadow-indigo-500/20',
    secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700',
    ghost: 'text-slate-300 hover:text-white hover:bg-slate-800',
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

// Section card.
export function Card({ className = '', children }) {
  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur p-5 sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

// A circular 0–100 score gauge.
export function ScoreRing({ value, size = 132, label, tone = 'indigo' }) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value || 0));
  const offset = c - (v / 100) * c;
  const tones = {
    indigo: '#818cf8',
    go: '#34d399',
    refine: '#fbbf24',
    nogo: '#fb7185',
  };
  const color = tones[tone] || tones.indigo;
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} stroke="#1e293b" strokeWidth={stroke} fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white tabular-nums">{v}</span>
          <span className="text-xs text-slate-400">/ 100</span>
        </div>
      </div>
      {label && <span className="mt-3 text-sm font-medium text-slate-300">{label}</span>}
    </div>
  );
}

// A 1–5 rating control with anchor descriptions on hover/selection.
export function RatingScale({ value, onChange, anchors }) {
  const [hover, setHover] = useState(null);
  const active = hover ?? value;
  return (
    <div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => {
          const selected = value === n;
          return (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onChange(n)}
              className={`flex-1 h-11 rounded-lg text-sm font-semibold transition-all ${
                selected
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 scale-[1.03]'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
              aria-pressed={selected}
            >
              {n}
            </button>
          );
        })}
      </div>
      <p className="mt-2 min-h-[2.5rem] text-xs leading-relaxed text-slate-400">
        {active && anchors?.[active] ? (
          <>
            <span className="font-semibold text-slate-300">{active} — </span>
            {anchors[active]}
          </>
        ) : (
          'Hover a number to see what it means, then click to choose.'
        )}
      </p>
    </div>
  );
}

// A coloured pill / badge.
export function Pill({ tone = 'slate', children }) {
  const tones = {
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
    go: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    refine: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    nogo: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    indigo: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

// Copy-to-clipboard block for Cowork prompts.
export function CopyBlock({ text, title, subtitle }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-slate-800">
        <div>
          <p className="text-sm font-semibold text-slate-100">{title}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        <Button variant="secondary" className="!px-3 !py-1.5 shrink-0" onClick={copy}>
          {copied ? 'Copied ✓' : 'Copy'}
        </Button>
      </div>
      <pre className="px-4 py-3 text-xs leading-relaxed text-slate-300 whitespace-pre-wrap font-mono max-h-64 overflow-auto">
        {text}
      </pre>
    </div>
  );
}

// Labeled text input / textarea.
export function Field({ label, hint, as = 'input', ...props }) {
  const Comp = as;
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-200">{label}</span>
      {hint && <span className="block text-xs text-slate-400 mt-0.5 mb-1.5">{hint}</span>}
      <Comp
        className={`mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
          as === 'textarea' ? 'min-h-[88px] resize-y' : ''
        }`}
        {...props}
      />
    </label>
  );
}

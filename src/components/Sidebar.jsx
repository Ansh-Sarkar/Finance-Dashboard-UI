import { useState } from 'react';
import { LayoutGrid, ListOrdered, Wallet, LayoutTemplate, ScanSearch } from 'lucide-react';
import clsx from 'clsx';

const NAV = [
  { id: 'portfolio', label: 'Portfolio', Icon: LayoutGrid },
  { id: 'watchlist', label: 'Watchlist', Icon: ListOrdered },
  { id: 'wallet', label: 'Wallet', Icon: Wallet },
  { id: 'layouts', label: 'Layouts', Icon: LayoutTemplate },
  { id: 'screeners', label: 'Screeners', Icon: ScanSearch },
];

export default function Sidebar() {
  const [active, setActive] = useState('portfolio');

  return (
    <aside className="hidden w-[min(18rem,100%)] shrink-0 flex-col border-r border-[var(--border-color)] bg-[var(--bg-panel)] lg:flex">
      <div className="flex flex-1 flex-col px-6 pb-8 pt-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--accent-lime)] shadow-[0_0_24px_rgba(223,255,0,0.35)]">
            <span className="text-lg font-black text-[var(--ink)]">Z</span>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">FinDash</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
              Finance desk
            </p>
          </div>
        </div>

        <p className="mt-8 text-sm font-medium leading-relaxed text-[var(--text-secondary)]">
          High-contrast liquidity view for personal cash flow, modeled after modern trading dashboards.
        </p>
        <a
          href="#insights"
          className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-primary)] underline-offset-4 hover:text-[var(--accent-lime)] hover:underline"
        >
          Read insights
        </a>
        <div className="mt-6 h-px w-12 bg-[var(--border-strong)]" />
      </div>

      <nav className="border-t border-[var(--border-color)] px-4 py-6">
        <ul className="flex flex-wrap justify-center gap-2">
          {NAV.map(({ id, label, Icon }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => setActive(id)}
                className={clsx(
                  'flex w-[4.5rem] flex-col items-center gap-2 rounded-xl py-3 text-[10px] font-bold uppercase tracking-wide transition-colors',
                  active === id
                    ? 'bg-[var(--accent-lime)] text-[var(--ink)] shadow-[0_8px_24px_rgba(223,255,0,0.25)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-main)] hover:text-[var(--text-primary)]'
                )}
              >
                <Icon className="h-5 w-5 stroke-[1.5]" />
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

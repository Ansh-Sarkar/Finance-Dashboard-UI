import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Moon, Sun, Shield, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { calculateTotals, formatCurrency } from '../utils/helpers';
import { isToday, parseISO } from 'date-fns';

export default function Navbar() {
  const { role, setRole, isDarkMode, toggleDarkMode } = useStore();
  const transactions = useStore((state) => state.transactions);

  const { netLiq, dailyPnL, rangePct } = useMemo(() => {
    const { balance } = calculateTotals(transactions);
    const todayNet = transactions.reduce((sum, t) => {
      if (!isToday(parseISO(t.date))) return sum;
      return sum + (t.type === 'Income' ? Number(t.amount) : -Number(t.amount));
    }, 0);
    const income = transactions
      .filter((t) => t.type === 'Income')
      .reduce((s, t) => s + Number(t.amount), 0);
    const expense = transactions
      .filter((t) => t.type === 'Expense')
      .reduce((s, t) => s + Number(t.amount), 0);
    const pct =
      income > 0 ? Math.max(0, Math.min(100, Math.round(((income - expense) / income) * 100))) : 50;
    return { netLiq: balance, dailyPnL: todayNet, rangePct: pct };
  }, [transactions]);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 22 }}
      className="sticky top-0 z-50 flex min-h-[4.5rem] flex-wrap items-center justify-between gap-4 border-b border-[var(--border-color)] bg-[var(--bg-main)]/85 px-4 py-3 backdrop-blur-xl lg:px-8"
    >
      <div className="flex items-center gap-3 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--accent-lime)] text-[var(--ink)]">
          <span className="text-sm font-black">Z</span>
        </div>
        <span className="text-lg font-black tracking-tight">FinDash</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-4 sm:gap-8 lg:flex-nowrap">
        <div className="flex min-w-[140px] flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            Range
          </span>
          <div className="h-2 w-full max-w-[160px] overflow-hidden rounded-full bg-[var(--border-color)]">
            <div
              className="h-full rounded-full bg-[var(--accent-lime)] transition-all duration-500"
              style={{ width: `${rangePct}%` }}
            />
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            Net liq.
          </p>
          <p className="text-lg font-black tracking-tight text-[var(--text-primary)]">
            {formatCurrency(netLiq)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            Daily P&amp;L
          </p>
          <p
            className={clsx(
              'text-lg font-black tracking-tight',
              dailyPnL >= 0 ? 'text-[var(--ink)] dark:text-[var(--accent-lime)]' : 'text-red-500'
            )}
          >
            {dailyPnL >= 0 ? '+' : ''}
            {formatCurrency(dailyPnL)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-panel)] p-0.5 sm:flex">
          <button
            type="button"
            onClick={() => setRole('Viewer')}
            className={clsx(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
              role === 'Viewer'
                ? 'bg-[var(--header-bar)] text-white'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
          >
            <Shield className="h-3.5 w-3.5" />
            Viewer
          </button>
          <button
            type="button"
            onClick={() => setRole('Admin')}
            className={clsx(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
              role === 'Admin'
                ? 'bg-red-600 text-white'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Admin
          </button>
        </div>

        <button
          type="button"
          onClick={toggleDarkMode}
          className="rounded-full border border-[var(--border-color)] bg-[var(--bg-panel)] p-2.5 text-[var(--text-secondary)] transition-all hover:border-[var(--accent-lime)] hover:text-[var(--text-primary)]"
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <div
          className="h-10 w-10 shrink-0 rounded-full border-2 border-[var(--accent-lime)] bg-[var(--header-bar)] bg-[length:100%_100%] shadow-[0_0_20px_rgba(223,255,0,0.2)]"
          title="Profile"
          style={{
            backgroundImage:
              'radial-gradient(circle at 30% 25%, rgba(223,255,0,0.35), transparent 45%), linear-gradient(145deg, #2a2d32, #0f1113)',
          }}
        />
      </div>
    </motion.header>
  );
}

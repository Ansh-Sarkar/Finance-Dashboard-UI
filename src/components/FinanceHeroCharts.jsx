import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import D3ActivityRadial from './d3/D3ActivityRadial';
import D3IsoStackedBars from './d3/D3IsoStackedBars';
import { formatCurrency } from '../utils/helpers';

const PLACEHOLDER_LOGOS = ['NVDA', 'SIE', 'MSFT', 'AAPL', 'V', 'JPM'];

export default function FinanceHeroCharts() {
  const transactions = useStore((state) => state.transactions);

  const { radialPercent, radialSegments, isoBars } = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'Income')
      .reduce((s, t) => s + Number(t.amount), 0);
    const expense = transactions
      .filter((t) => t.type === 'Expense')
      .reduce((s, t) => s + Number(t.amount), 0);

    const savingsRate =
      income > 0 ? Math.max(0, Math.min(100, Math.round(((income - expense) / income) * 100))) : 0;

    const byCat = transactions
      .filter((t) => t.type === 'Expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
        return acc;
      }, {});

    const sorted = Object.entries(byCat)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);

    const maxV = sorted[0]?.value || 1;
    const radialSegments = sorted.slice(0, 12).map((row) => ({
      label: row.label,
      value: row.value,
      weight: 0.35 + 0.65 * (row.value / maxV),
    }));

    const top3 = sorted.slice(0, 3);
    while (top3.length < 3) {
      top3.push({ label: top3.length === 0 ? 'Portfolio' : `Slot ${top3.length + 1}`, value: 0 });
    }

    const isoBars = top3.map((row, idx) => {
      const v = row.value > 0 ? row.value : 160 + idx * 45;
      return {
        label: row.value > 0 ? row.label : `${row.label} (demo)`,
        lime: v * 0.38,
        mid: v * 0.34,
        top: v * 0.28,
        total: v,
      };
    });

    return {
      radialPercent: savingsRate || (expense > 0 ? 18 : 42),
      radialSegments,
      isoBars,
    };
  }, [transactions]);

  if (transactions.length === 0) return null;

  return (
    <div className="mb-10 grid gap-6 xl:grid-cols-12">
      <section className="xl:col-span-4">
        <div className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-panel)] shadow-sm">
          <header className="bg-[var(--header-bar)] px-5 py-3">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--header-bar-text)]">
              Total activity
            </h2>
            <p className="mt-1 text-xs font-medium text-white/60">
              Savings rate vs spend — hover spokes for categories
            </p>
          </header>
          <div className="flex flex-col items-center px-4 py-8">
            <D3ActivityRadial
              percentage={radialPercent}
              segments={radialSegments.length ? radialSegments : undefined}
            />
            <p className="mt-4 max-w-[240px] text-center text-xs font-medium text-[var(--text-secondary)]">
              Center shows estimated savings rate. Outer dots mark category-weighted cash flow.
            </p>
          </div>
        </div>
      </section>

      <section className="xl:col-span-8">
        <div className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-panel)] shadow-sm">
          <header className="flex flex-col gap-4 border-b border-[var(--border-color)] bg-[var(--header-bar)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--header-bar-text)]">
                Most active categories (week-style view)
              </h2>
              <p className="mt-1 text-xs font-medium text-white/60">
                Stacked mix: variable spend, recurring, savings allocation
              </p>
            </div>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 sm:pb-0">
              {PLACEHOLDER_LOGOS.map((sym) => (
                <div
                  key={sym}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-[10px] font-extrabold text-[var(--accent-lime)]"
                  title="Watchlist placeholder"
                >
                  {sym.slice(0, 2)}
                </div>
              ))}
            </div>
          </header>
          <div className="relative px-2 pb-4 pt-2">
            <D3IsoStackedBars bars={isoBars} height={300} />
            <div className="mt-2 flex flex-wrap items-center justify-center gap-6 border-t border-[var(--border-color)] px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-sm bg-[#1a1c1e] dark:bg-neutral-200" />
                Savings / equity
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-sm bg-[#e8eaee]" />
                Recurring
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-sm bg-[var(--accent-lime)]" />
                Variable spend
              </span>
            </div>
            <p className="px-4 pb-2 text-center text-[11px] text-[var(--text-secondary)]">
              Bar totals reflect top expense categories: {isoBars.map((b) => `${b.label} (${formatCurrency(b.total)})`).join(' · ')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

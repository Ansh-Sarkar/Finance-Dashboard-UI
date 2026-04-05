import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import SummaryCards from '../components/SummaryCards';
import FinanceHeroCharts from '../components/FinanceHeroCharts';
import ChartsSection from '../components/ChartsSection';
import Insights from '../components/Insights';
import TransactionsTable from '../components/TransactionsTable';
import AiChat from '../components/AiChat';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const isDarkMode = useStore((state) => state.isDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    document.title = 'FinDash';
  }, []);

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)] font-sans antialiased text-[var(--text-primary)] transition-colors duration-500">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
          >
            <div>
              <p className="section-kicker">Overview</p>
              <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Dashboard</h1>
              <p className="mt-3 max-w-2xl text-base font-medium text-[var(--text-secondary)]">
                Neon-on-charcoal hierarchy with a light shell: liquidity, flow, and category stacks —
                built for fast scanning.
              </p>
            </div>
            <span className="inline-flex w-fit items-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-panel)] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
              Live sync
            </span>
          </motion.div>

          <SummaryCards />
          <div id="insights">
            <Insights />
          </div>
          <FinanceHeroCharts />
          <ChartsSection />
          <TransactionsTable />
          <AiChat />

          <footer className="mt-12 mb-8 text-center text-sm font-medium text-[var(--text-secondary)]">
            <p>
              Curated and Developed by{' '}
              <a
                href="https://www.linkedin.com/in/prisha-sharma333/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[var(--text-primary)] underline decoration-transparent underline-offset-4 hover:text-[var(--accent-lime)] hover:decoration-[var(--accent-lime)]"
              >
                Prisha :)
              </a>
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

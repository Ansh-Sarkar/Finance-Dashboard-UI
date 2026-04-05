import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { X, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { categories } from '../data/mockData';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Modal({ onClose }) {
  const addTransaction = useStore((state) => state.addTransaction);

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Housing',
    type: 'Expense',
  });

  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.date) return;
    
    addTransaction({
      ...formData,
      amount: Number(formData.amount),
    });
    
    toast.success(`Transaction "${formData.title}" added successfully!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md" 
        onClick={onClose}
      />
      
      {}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg overflow-hidden rounded-[2rem] bg-[var(--bg-card)] shadow-[0_0_60px_-15px_rgba(0,0,0,0.3)] border border-[var(--border-color)] z-10"
      >
        <div className="p-8">
          <div className="mb-8 flex flex-col items-center justify-between sm:flex-row">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">New Transaction</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)] font-medium">Log a new income or expense manually</p>
            </div>
            <button
              onClick={onClose}
              className="absolute top-6 right-6 rounded-full bg-[var(--bg-main)] p-2 text-[var(--text-secondary)] hover:bg-brand-50 hover:text-brand-600 transition-colors dark:hover:bg-brand-500/20"
              aria-label="Close Modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Title / Particulars
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Monthly Rent"
                className="block w-full rounded-2xl border-2 border-[var(--border-color)] bg-[var(--bg-main)]/50 backdrop-blur px-4 py-3 text-sm font-semibold text-[var(--text-primary)] transition-all focus:border-brand-500 focus:bg-[var(--bg-main)] focus:outline-none focus:ring-4 focus:ring-brand-500/20 placeholder:font-normal"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Amount
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className="text-xl font-bold text-[var(--text-secondary)]">$</span>
                  </div>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="block w-full rounded-2xl border-2 border-[var(--border-color)] bg-[var(--bg-main)]/50 backdrop-blur py-3 pl-10 pr-4 text-lg font-extrabold text-[var(--text-primary)] transition-all focus:border-brand-500 focus:bg-[var(--bg-main)] focus:outline-none focus:ring-4 focus:ring-brand-500/20 placeholder:font-normal placeholder:text-base"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Date
                </label>
                <input
                  type="date"
                  required
                  className="block w-full rounded-2xl border-2 border-[var(--border-color)] bg-[var(--bg-main)]/50 backdrop-blur px-4 py-3.5 text-sm font-semibold text-[var(--text-primary)] transition-all focus:border-brand-500 focus:bg-[var(--bg-main)] focus:outline-none focus:ring-4 focus:ring-brand-500/20"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pb-2">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Type
                </label>
                <div className="relative inline-flex w-full rounded-2xl border-2 border-[var(--border-color)] bg-[var(--bg-main)]/50 p-1 text-sm font-bold backdrop-blur">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'Expense', category: 'Housing' })}
                    className={clsx(
                      "w-1/2 rounded-xl py-2 transition-all duration-300",
                      formData.type === 'Expense' ? 'bg-[var(--bg-card)] shadow-md text-rose-500' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    )}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'Income', category: 'Salary' })}
                    className={clsx(
                      "w-1/2 rounded-xl py-2 transition-all duration-300",
                      formData.type === 'Income' ? 'bg-[var(--bg-card)] shadow-md text-emerald-500' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    )}
                  >
                    Income
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Category
                </label>
                <select
                  className="block w-full appearance-none rounded-2xl border-2 border-[var(--border-color)] bg-[var(--bg-main)]/50 backdrop-blur px-4 py-3.5 text-sm font-semibold text-[var(--text-primary)] transition-all focus:border-brand-500 focus:bg-[var(--bg-main)] focus:outline-none focus:ring-4 focus:ring-brand-500/20"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {formData.type === 'Income' ? (
                    <>
                      <option value="Salary">Salary</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Other">Other</option>
                    </>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div className="mt-8 flex gap-4 pt-6 border-t-2 border-[var(--border-color)]">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 rounded-2xl border-2 border-[var(--border-color)] px-4 py-3.5 text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-main)] hover:text-[var(--text-primary)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-2/3 flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3.5 text-sm font-bold text-white shadow-xl shadow-brand-500/20 hover:bg-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/30 transition-all hover:-translate-y-0.5"
              >
                <CheckCircle2 className="w-5 h-5" />
                Save Transaction
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

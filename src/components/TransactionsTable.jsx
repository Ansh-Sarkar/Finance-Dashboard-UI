import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { formatDate, formatCurrency, getCategoryIcon } from '../utils/helpers';
import { Search, Trash2, ArrowUpDown, Plus, X, FilterX, Download } from 'lucide-react';
import clsx from 'clsx';
import Modal from './Modal';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function TransactionsTable() {
  const { 
    transactions, 
    role, 
    deleteTransaction, 
    restoreTransaction,
    globalSearch, 
    setGlobalSearch,
    globalCategory, 
    setGlobalCategory 
  } = useStore();
  
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); 

  const searchInputRef = useRef(null);

  
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') {
            document.activeElement.blur();
        }
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      
      if (e.key.toLowerCase() === 'a' && role === 'Admin') {
        e.preventDefault();
        setIsModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [role]);

  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(globalSearch), 300);
    return () => clearTimeout(timer);
  }, [globalSearch]);

  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  
  const availableCategories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category));
    return ['All', ...Array.from(cats)].sort();
  }, [transactions]);

  
  const handleDelete = (t) => {
    deleteTransaction(t.id);
    toast.success(`Deleted transaction "${t.title}"`, {
      action: {
        label: 'Undo',
        onClick: () => {
          restoreTransaction(t);
          toast.success('Transaction restored');
        }
      },
      duration: 5000,
    });
  };

  
  const filteredAndSorted = useMemo(() => {
    let result = transactions;

    if (filterType !== 'All') {
      result = result.filter((t) => t.type === filterType);
    }
    
    if (globalCategory !== 'All') {
      result = result.filter((t) => t.category === globalCategory);
    }

    if (debouncedSearch) {
      const lowerSearch = debouncedSearch.toLowerCase();
      result = result.filter(
        (t) =>
          t.title?.toLowerCase().includes(lowerSearch) || t.category.toLowerCase().includes(lowerSearch)
      );
    }

    result = [...result].sort((a, b) => {
      if (sortConfig.key === 'amount') {
        return sortConfig.direction === 'asc' 
          ? Number(a.amount) - Number(b.amount)
          : Number(b.amount) - Number(a.amount);
      } else {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });

    return result;
  }, [transactions, debouncedSearch, filterType, globalCategory, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const clearFilters = () => {
    setGlobalSearch('');
    setFilterType('All');
    setGlobalCategory('All');
  };

  
  const handleExportCSV = () => {
    if (filteredAndSorted.length === 0) {
      toast.error("No data to export!");
      return;
    }

    const headers = ['Date', 'Title', 'Category', 'Type', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...filteredAndSorted.map(t => 
        `"${t.date}","${t.title}","${t.category}","${t.type}","${t.amount}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_export_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV Downloaded successfully!");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5, type: 'spring' }}
      className="mt-12 mb-24 glass-card rounded-[2rem] p-6 sm:p-8 transition-shadow duration-300 relative"
    >
      <div className="mb-8 flex flex-col space-y-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Transaction History</h3>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Manage and review your recent financial activity</p>
        </div>
        
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--bg-main)] px-5 py-2.5 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] transition-all hover:bg-[var(--bg-card)] shadow-sm hover:shadow"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
          <div className="flex bg-[var(--bg-main)]/50 backdrop-blur-md p-1.5 rounded-full border border-[var(--border-color)]">
            {['All', 'Income', 'Expense'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={clsx(
                  "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300",
                  filterType === type 
                    ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] relative"
                )}
              >
                {type}
                {filterType === type && <motion.div layoutId="pill-active" className="absolute inset-0 border border-brand-500/20 rounded-full" />}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-80 flex gap-2">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="h-4 w-4 text-[var(--text-secondary)]" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search activity... Press '/'"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="block w-full rounded-full border border-[var(--border-color)] bg-[var(--bg-main)]/50 backdrop-blur-md py-3 pl-11 pr-10 text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-secondary)] transition-all focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-sm"
              />
              {globalSearch && (
                <button
                  onClick={() => setGlobalSearch('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {(filterType !== 'All' || globalCategory !== 'All' || globalSearch) && (
              <button 
                onClick={clearFilters}
                className="flex items-center justify-center p-3 rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10 transition-colors bg-[var(--bg-main)]/50 backdrop-blur-md"
                title="Clear all filters"
              >
                <FilterX className="h-5 w-5" />
              </button>
            )}
            
            {}
            <div className="flex bg-[var(--bg-main)]/50 backdrop-blur-md p-1.5 rounded-full border border-[var(--border-color)] ml-2">
              <button
                onClick={() => setViewMode('table')}
                className={clsx(
                  "px-3 py-1.5 rounded-full transition-all duration-300",
                  viewMode === 'table' ? "bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
                )}
                title="Table View"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={clsx(
                  "px-3 py-1.5 rounded-full transition-all duration-300",
                  viewMode === 'grid' ? "bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
                )}
                title="Grid View"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
            </div>
          </div>
        </div>

        {}
        {availableCategories.length > 2 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setGlobalCategory(cat)}
                className={clsx(
                  "px-4 py-1.5 rounded-full text-xs font-bold transition-colors border flex items-center gap-1.5 hover:-translate-y-0.5 transform",
                  globalCategory === cat
                    ? "bg-[var(--text-primary)] text-[var(--bg-main)] border-transparent shadow-md"
                    : "bg-[var(--bg-main)]/50 border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]"
                )}
              >
                {cat !== 'All' && <span>{getCategoryIcon(cat)}</span>}
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {}
      {viewMode === 'table' ? (
        <div className="overflow-x-auto hide-scrollbar rounded-2xl border border-[var(--border-color)] shadow-sm bg-[var(--bg-main)]/20 backdrop-blur-md">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[var(--bg-main)]/50 border-b border-[var(--border-color)]">
              <tr>
                <th 
                  className="cursor-pointer py-4 pl-6 pr-3 text-xs font-bold text-[var(--text-secondary)] tracking-wider uppercase hover:text-[var(--text-primary)] transition-colors"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-2">
                    DATE
                    <ArrowUpDown className="h-3 w-3 opacity-50" />
                  </div>
                </th>
                <th className="py-4 px-3 text-xs font-bold text-[var(--text-secondary)] tracking-wider uppercase">Particulars</th>
                <th className="py-4 px-3 text-xs font-bold text-[var(--text-secondary)] tracking-wider uppercase">Category</th>
                <th className="py-4 px-3 text-center text-xs font-bold text-[var(--text-secondary)] tracking-wider uppercase">Status</th>
                <th 
                  className="cursor-pointer py-4 px-3 text-right text-xs font-bold text-[var(--text-secondary)] tracking-wider uppercase hover:text-[var(--text-primary)] transition-colors"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center justify-end gap-2">
                    AMOUNT
                    <ArrowUpDown className="h-3 w-3 opacity-50" />
                  </div>
                </th>
                {role === 'Admin' && <th className="py-4 pr-6 text-center text-xs font-bold text-[var(--text-secondary)] tracking-wider uppercase w-20">Edit</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="border-b border-[var(--border-color)] last:border-0 animate-pulse bg-[var(--bg-card)]/50">
                    <td className="py-5 pl-6 pr-3"><div className="h-4 w-24 bg-[var(--border-color)] rounded-full"></div></td>
                    <td className="py-5 px-3"><div className="h-4 w-32 bg-[var(--border-color)] rounded-full"></div></td>
                    <td className="py-5 px-3"><div className="h-6 w-20 bg-[var(--border-color)] border rounded-lg"></div></td>
                    <td className="py-5 px-3"><div className="h-6 w-16 mx-auto bg-[var(--border-color)] rounded-full"></div></td>
                    <td className="py-5 px-3 flex justify-end"><div className="h-5 w-24 bg-[var(--border-color)] rounded-full"></div></td>
                    {role === 'Admin' && <td className="py-5 pr-6"><div className="h-8 w-8 mx-auto bg-[var(--border-color)] rounded-lg"></div></td>}
                  </tr>
                ))
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredAndSorted.length > 0 ? (
                    filteredAndSorted.map((t) => (
                      <motion.tr 
                        layout
                        key={t.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="group border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-card)] transition-colors"
                      >
                        <td className="whitespace-nowrap py-5 pl-6 pr-3 text-sm font-bold text-[var(--text-secondary)]">
                          {formatDate(t.date)}
                        </td>
                        <td className="py-5 px-3">
                          <p className="text-sm font-bold text-[var(--text-primary)]">{t.title}</p>
                        </td>
                        <td className="py-5 px-3">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] shadow-sm">
                            <span className="text-base">{getCategoryIcon(t.category)}</span> {t.category}
                          </span>
                        </td>
                        <td className="py-5 px-3 text-center">
                          <div className="flex justify-center">
                            <span 
                              className={clsx(
                                'rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-widest',
                                t.type === 'Income' 
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                                  : 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                              )}
                            >
                              {t.type}
                            </span>
                          </div>
                        </td>
                        <td className={clsx(
                          'whitespace-nowrap py-5 px-3 text-right text-[15px] font-extrabold tracking-tight',
                          t.type === 'Income' ? 'text-emerald-600 dark:text-emerald-500' : 'text-[var(--text-primary)]'
                        )}>
                          {t.type === 'Income' ? '+' : '-'}{formatCurrency(t.amount)}
                        </td>
                        {role === 'Admin' && (
                          <td className="py-5 pr-6 text-center">
                            <button
                              onClick={() => handleDelete(t)}
                              className="rounded-xl p-2.5 text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/20 dark:hover:text-rose-400 transition-all focus:opacity-100 mx-auto block shadow-sm border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
                              title="Delete Transaction"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        )}
                      </motion.tr>
                    ))
                  ) : (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <td colSpan={role === 'Admin' ? 6 : 5} className="py-20 text-center">
                        <div className="flex flex-col items-center max-w-sm mx-auto">
                          <div className="w-20 h-20 rounded-full bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-center mb-6 shadow-sm">
                            <Search className="h-8 w-8 text-[var(--text-secondary)] opacity-50" />
                          </div>
                          <h4 className="text-xl font-bold text-[var(--text-primary)] mb-2">No transactions found</h4>
                          <p className="text-sm font-medium text-[var(--text-secondary)] text-center leading-relaxed">
                            We could not find anything matching your current filters.
                          </p>
                          <button onClick={clearFilters} className="mt-6 text-brand-600 font-bold hover:underline hover:text-brand-500 dark:text-brand-400">
                            Clear Filters
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredAndSorted.length > 0 ? (
              filteredAndSorted.map((t) => (
                <motion.div
                  layout
                  key={t.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="bg-[var(--bg-main)]/50 backdrop-blur-md rounded-2xl p-5 border border-[var(--border-color)] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-[var(--bg-card)] rounded-xl p-3 border border-[var(--border-color)] shadow-sm text-2xl">
                      {getCategoryIcon(t.category)}
                    </div>
                    {role === 'Admin' && (
                      <button
                        onClick={() => handleDelete(t)}
                        className="rounded-full p-2 text-[var(--text-secondary)] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/20 dark:hover:text-rose-400 transition-all border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
                        title="Delete Transaction"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--text-secondary)]">{formatDate(t.date)}</p>
                    <h4 className="text-lg font-bold text-[var(--text-primary)] mt-1 truncate">{t.title}</h4>
                  </div>
                  <div className="flex items-end justify-between mt-6">
                    <span 
                      className={clsx(
                        'rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest',
                        t.type === 'Income' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                      )}
                    >
                      {t.category}
                    </span>
                    <span className={clsx(
                      'text-xl font-extrabold tracking-tight',
                      t.type === 'Income' ? 'text-emerald-600 dark:text-emerald-500' : 'text-[var(--text-primary)]'
                    )}>
                      {t.type === 'Income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="flex flex-col items-center max-w-sm mx-auto">
                  <div className="w-20 h-20 rounded-full bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-center mb-6 shadow-sm">
                    <Search className="h-8 w-8 text-[var(--text-secondary)] opacity-50" />
                  </div>
                  <h4 className="text-xl font-bold text-[var(--text-primary)] mb-2">No transactions found</h4>
                  <p className="text-sm font-medium text-[var(--text-secondary)] text-center leading-relaxed">
                    We could not find anything matching your current filters.
                  </p>
                  <button onClick={clearFilters} className="mt-6 text-brand-600 font-bold hover:underline hover:text-brand-500 dark:text-brand-400">
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {}
      <AnimatePresence>
        {role === 'Admin' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed bottom-8 right-8 z-40 lg:bottom-12 lg:right-12"
          >
            <button
              onClick={() => setIsModalOpen(true)}
              className="group flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--accent-lime)] bg-[var(--header-bar)] text-[var(--accent-lime)] shadow-[0_0_40px_-8px_rgba(223,255,0,0.35)] transition-all hover:scale-110 hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-[var(--accent-lime)]/30 active:scale-95"
            >
              <Plus className="h-8 w-8 transition-transform group-hover:rotate-90" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && <Modal onClose={() => setIsModalOpen(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}

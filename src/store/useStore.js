import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialTransactions } from '../data/mockData';

export const useStore = create(
  persist(
    (set) => ({
      transactions: initialTransactions,
      role: 'Viewer',
      isDarkMode: false,
      
      globalSearch: '',
      setGlobalSearch: (term) => set({ globalSearch: term }),
      
      globalCategory: 'All',
      setGlobalCategory: (category) => set({ globalCategory: category }),

      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [
            { id: Date.now().toString(), ...transaction },
            ...state.transactions,
          ],
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      restoreTransaction: (transaction) =>
        set((state) => ({
          transactions: [transaction, ...state.transactions].sort((a,b) => new Date(b.date) - new Date(a.date)),
        })),

      setRole: (role) => set({ role }),
      
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    {
      name: 'finance-dashboard-v2',
    }
  )
);

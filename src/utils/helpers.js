export const getCategoryIcon = (category) => {
  const icons = {
    Housing: '🏠',
    Food: '🍔',
    Transport: '🚗',
    Shopping: '🛍️',
    Entertainment: '🎟️',
    Utilities: '💡',
    Health: '🏥',
    Education: '📚',
    Salary: '💰',
    Freelance: '💻',
    Other: '✨'
  };
  return icons[category] || '🏷️';
};

import { format, parseISO } from 'date-fns';

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateString) => {
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy');
  } catch {
    return dateString;
  }
};

export const calculateTotals = (transactions) => {
  return transactions.reduce(
    (acc, transaction) => {
      const amount = Number(transaction.amount);
      if (transaction.type === 'Income') {
        acc.income += amount;
        acc.balance += amount;
      } else {
        acc.expense += amount;
        acc.balance -= amount;
      }
      return acc;
    },
    { income: 0, expense: 0, balance: 0 }
  );
};

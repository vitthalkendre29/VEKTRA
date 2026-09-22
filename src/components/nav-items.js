export const NAV_ITEMS = [
  { view: 'dashboard', label: 'Dashboard', icon: '◈' },
  { view: 'transactions', label: 'Transactions', icon: '≡' },
  { view: 'analytics', label: 'Analytics', icon: '◫' },
  { view: 'budgets', label: 'Budgets', icon: '▤' },
  { view: 'goals', label: 'Goals & Savings', icon: '◎' },
  { view: 'investments', label: 'Investments', icon: '△' },
  { view: 'networth', label: 'Net Worth', icon: '◆' },
  { view: 'accounts', label: 'Accounts', icon: '▢' },
  { view: 'debts', label: 'Loans & Bills', icon: '▽' },
  { view: 'calculators', label: 'Calculators', icon: '#' },
  { view: 'settings', label: 'Settings', icon: '⚙' },
];

export const VIEW_TITLES = Object.fromEntries(NAV_ITEMS.map((n) => [n.view, n.label]));

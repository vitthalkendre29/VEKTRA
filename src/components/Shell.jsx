'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { apiFetch, put } from '@/lib/fetcher';
import { NAV_ITEMS, VIEW_TITLES } from './nav-items';
import { useModal, useToast } from './UIProvider';
import TransactionForm from './forms/TransactionForm';

export default function Shell({ children, user, initialTheme }) {
  const pathname = usePathname();
  const router = useRouter();
  const view = (pathname.replace('/', '') || 'dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [theme, setTheme] = useState(initialTheme || 'light');
  const { openModal } = useModal();
  const toast = useToast();

  async function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      await put('/api/profile', { theme: next });
    } catch {
      /* theme still applies locally even if the save fails */
    }
  }

  async function logout() {
    if (!confirm('Log out of VEKTRA?')) return;
    await apiFetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  function openQuickTxn(defaultType) {
    setQuickAddOpen(false);
    openModal('Add Transaction', <TransactionForm defaultType={defaultType} onDone={() => { toast('Transaction saved'); router.refresh(); }} />);
  }

  return (
    <div data-theme={theme}>
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <Image src="/vklogo.png" alt="" width={28} height={20} />
          </div>
          <div className="brand-text">
            <span className="brand-name">VEKTRA</span>
            <span className="brand-tag">Know where your money goes</span>
          </div>
        </div>

        <nav className="side-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.view}
              href={`/${item.view}`}
              className={`nav-item ${view === item.view ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-ic">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="side-foot">
          <button className="theme-toggle" onClick={toggleTheme}>
            <span>{theme === 'dark' ? '☀' : '☾'}</span> {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="hamburger" aria-label="Menu" onClick={() => setSidebarOpen((v) => !v)}>☰</button>
          <div className="topbar-title">{VIEW_TITLES[view] || 'VEKTRA'}</div>
          <div className="topbar-actions">
            <div className="fy-pill">{user?.name || user?.email}</div>
          </div>
        </header>

        <div className="view-wrap">{children}</div>
      </main>

      <nav className="bottom-nav">
        <Link href="/dashboard" className={`bn-item ${view === 'dashboard' ? 'active' : ''}`}><span>◈</span>Home</Link>
        <Link href="/transactions" className={`bn-item ${view === 'transactions' ? 'active' : ''}`}><span>≡</span>Txns</Link>
        <button className="bn-fab" onClick={() => setQuickAddOpen(true)} aria-label="Quick add">+</button>
        <Link href="/investments" className={`bn-item ${view === 'investments' ? 'active' : ''}`}><span>△</span>Invest</Link>
        <button className="bn-item" onClick={() => setMoreOpen(true)}><span>⋯</span>More</button>
      </nav>

      <div className={`more-sheet-backdrop ${moreOpen ? 'show' : ''}`} onClick={() => setMoreOpen(false)} />
      <div className={`more-sheet ${moreOpen ? 'show' : ''}`}>
        <div className="sheet-handle" />
        {NAV_ITEMS.filter((n) => !['dashboard', 'transactions', 'investments'].includes(n.view)).map((item) => (
          <Link key={item.view} href={`/${item.view}`} className="sheet-item" onClick={() => setMoreOpen(false)}>
            {item.icon} {item.label}
          </Link>
        ))}
      </div>

      <div className={`more-sheet-backdrop ${quickAddOpen ? 'show' : ''}`} onClick={() => setQuickAddOpen(false)} />
      <div className={`more-sheet ${quickAddOpen ? 'show' : ''}`}>
        <div className="sheet-handle" />
        <h3 className="sheet-title">Quick Add</h3>
        <div className="quick-grid">
          <button className="quick-btn" onClick={() => openQuickTxn('income')}><span>+</span>Income</button>
          <button className="quick-btn" onClick={() => openQuickTxn('transfer')}><span>⇄</span>Transfer</button>
          <button className="quick-btn" onClick={() => openQuickTxn('investment')}><span>△</span>Investment</button>
        </div>
      </div>
    </div>
  );
}

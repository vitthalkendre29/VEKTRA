'use client';

import useSWR from 'swr';
import { del, post } from '@/lib/fetcher';
import { EmptyState, StatCard, ConfirmDeleteButton } from '@/components/ui';
import VKLoader from '@/components/VKLoader';
import { fmtDate } from '@/lib/format';
import { useModal, useToast } from '@/components/UIProvider';
import ValueItemForm from '@/components/forms/ValueItemForm';

export default function NetWorthPage() {
  const { data: snapData, isLoading, mutate: mutateSnaps } = useSWR('/api/networth-snapshots');
  const { data: assetData, mutate: mutateAssets } = useSWR('/api/assets');
  const { data: liabData, mutate: mutateLiab } = useSWR('/api/liabilities');
  const { data: accData } = useSWR('/api/accounts');
  const { data: holdData } = useSWR('/api/holdings');
  const { data: loanData } = useSWR('/api/loans');
  const { data: profile } = useSWR('/api/profile');
  const currency = profile?.currency || '₹';
  const { openModal, closeModal } = useModal();
  const toast = useToast();

  const accounts = (accData?.accounts || []);
  const accountsTotal = accounts.reduce((s, a) => s + a.balance, 0);
  const investTotal = (holdData?.holdings || []).reduce((s, h) => s + h.currentValue, 0);
  const assets = assetData?.assets || [];
  const liabilities = liabData?.liabilities || [];
  const loans = loanData?.loans || [];
  const assetsTotal = assets.reduce((s, a) => s + a.value, 0);
  const liabTotal = liabilities.reduce((s, l) => s + l.value, 0) + loans.reduce((s, l) => s + l.outstanding, 0);
  const netWorth = accountsTotal + investTotal + assetsTotal - liabTotal;

  const snapshots = snapData?.snapshots || [];
  const prevSnap = snapshots[snapshots.length - 2];
  const latestSnap = snapshots[snapshots.length - 1];
  const change = latestSnap && prevSnap ? latestSnap.value - prevSnap.value : null;

  async function snapshot() {
    await post('/api/networth-snapshots', {});
    toast('Snapshot saved');
    mutateSnaps();
  }

  function addAsset() {
    openModal('Add Asset', <ValueItemForm kind="asset" onDone={() => { toast('Asset added'); mutateAssets(); }} />);
  }
  function addLiability() {
    openModal('Add Liability', <ValueItemForm kind="liability" onDone={() => { toast('Liability added'); mutateLiab(); }} />);
  }

  return (
    <div className="view active">
      <div className="view-head">
        <h2>Net Worth</h2>
        <div className="view-head-actions"><button className="btn-secondary" onClick={snapshot}>Save snapshot</button></div>
      </div>

      {isLoading ? (
        <VKLoader inline label="Adding it all up" />
      ) : (
        <>
          <div className="hero-card small">
            <div className="hero-top">
              <div>
                <div className="hero-eyebrow">Net worth</div>
                <div className="hero-amount num">{currency}{Math.round(netWorth).toLocaleString('en-IN')}</div>
              </div>
              {change !== null && <div className={`delta ${change >= 0 ? 'up' : 'down'}`} style={{ fontSize: 14 }}>{change >= 0 ? '+' : ''}{currency}{Math.round(change).toLocaleString('en-IN')} since last snapshot</div>}
            </div>
          </div>

          <div className="stat-grid">
            <StatCard label="Accounts" value={`${currency}${Math.round(accountsTotal).toLocaleString('en-IN')}`} />
            <StatCard label="Investments" value={`${currency}${Math.round(investTotal).toLocaleString('en-IN')}`} accent="invest" />
            <StatCard label="Other assets" value={`${currency}${assetsTotal.toLocaleString('en-IN')}`} />
            <StatCard label="Liabilities" value={`${currency}${Math.round(liabTotal).toLocaleString('en-IN')}`} accent="debt" />
          </div>

          <div className="panel-grid">
            <div className="panel">
              <div className="panel-head"><h3>Other assets</h3><button className="link-btn" onClick={addAsset}>+ Add</button></div>
              {!assets.length ? <EmptyState title="None added" /> : (
                <div className="cat-list">
                  {assets.map((a) => (
                    <div className="cat-row" key={a.id}>
                      <span className="cat-name">{a.name}</span>
                      <span className="cat-amt num">{currency}{a.value.toLocaleString('en-IN')}</span>
                      <ConfirmDeleteButton onConfirm={async () => { await del(`/api/assets/${a.id}`); mutateAssets(); }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="panel">
              <div className="panel-head"><h3>Other liabilities</h3><button className="link-btn" onClick={addLiability}>+ Add</button></div>
              {!liabilities.length ? <EmptyState title="None added" /> : (
                <div className="cat-list">
                  {liabilities.map((l) => (
                    <div className="cat-row" key={l.id}>
                      <span className="cat-name">{l.name}</span>
                      <span className="cat-amt num">{currency}{l.value.toLocaleString('en-IN')}</span>
                      <ConfirmDeleteButton onConfirm={async () => { await del(`/api/liabilities/${l.id}`); mutateLiab(); }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head"><h3>Snapshot history</h3></div>
            {!snapshots.length ? <EmptyState title="No snapshots yet" sub="Save one to start tracking net worth over time." /> : (
              <div className="upcoming-list">
                {[...snapshots].reverse().map((s) => (
                  <div className="upcoming-row" key={s.id}>
                    <span className="u-name">{fmtDate(s.date)}</span>
                    <span className="u-amt num">{currency}{Math.round(s.value).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

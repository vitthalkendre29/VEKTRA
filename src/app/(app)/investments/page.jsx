'use client';

import useSWR from 'swr';
import { del } from '@/lib/fetcher';
import { EmptyState, StatCard, ConfirmDeleteButton } from '@/components/ui';
import VKLoader from '@/components/VKLoader';
import { useModal, useToast } from '@/components/UIProvider';
import HoldingForm from '@/components/forms/HoldingForm';

export default function InvestmentsPage() {
  const { data, isLoading, mutate } = useSWR('/api/holdings');
  const { data: profile } = useSWR('/api/profile');
  const currency = profile?.currency || '₹';
  const { openModal, closeModal } = useModal();
  const toast = useToast();

  const holdings = data?.holdings || [];
  const invested = holdings.reduce((s, h) => s + h.invested, 0);
  const current = holdings.reduce((s, h) => s + h.currentValue, 0);
  const gain = current - invested;
  const gainPct = invested > 0 ? Math.round((gain / invested) * 100) : 0;
  const sip = holdings.reduce((s, h) => s + (h.sipAmount || 0), 0);

  function add() {
    openModal('Add Holding', <HoldingForm onDone={() => { toast('Holding added'); mutate(); }} />);
  }
  async function remove(id) {
    await del(`/api/holdings/${id}`);
    toast('Holding removed');
    mutate();
  }

  return (
    <div className="view active">
      <div className="view-head">
        <h2>Investments</h2>
        <div className="view-head-actions"><button className="btn-primary" onClick={add}>+ Add holding</button></div>
      </div>

      {isLoading ? (
        <VKLoader inline label="Loading investments" />
      ) : (
        <>
          <div className="stat-grid">
            <StatCard label="Invested" value={`${currency}${invested.toLocaleString('en-IN')}`} accent="invest" />
            <StatCard label="Current value" value={`${currency}${current.toLocaleString('en-IN')}`} accent="invest" />
            <StatCard label="Gain / loss" value={`${gain >= 0 ? '+' : ''}${currency}${gain.toLocaleString('en-IN')}`} delta={{ text: `${gainPct}%`, dir: gain >= 0 ? 'up' : 'down' }} />
            <StatCard label="Monthly SIPs" value={`${currency}${sip.toLocaleString('en-IN')}`} />
          </div>

          {!holdings.length ? (
            <EmptyState title="No holdings yet" sub="Track mutual funds, stocks, FDs and more here." />
          ) : (
            <div className="card-grid">
              {holdings.map((h) => {
                const g = h.currentValue - h.invested;
                const gp = h.invested > 0 ? Math.round((g / h.invested) * 100) : 0;
                return (
                  <div className="item-card" key={h.id}>
                    <ConfirmDeleteButton className="ic-del" onConfirm={() => remove(h.id)} />
                    <div className="ic-top">
                      <div>
                        <div className="ic-name">{h.name}</div>
                        <div className="ic-type">{h.type}</div>
                      </div>
                    </div>
                    <div className="ic-amt num">{currency}{h.currentValue.toLocaleString('en-IN')}</div>
                    <div className="ic-sub">{g >= 0 ? '+' : ''}{currency}{g.toLocaleString('en-IN')} ({gp}%) {h.sipAmount ? `· SIP ${currency}${h.sipAmount.toLocaleString('en-IN')}/mo` : ''}</div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

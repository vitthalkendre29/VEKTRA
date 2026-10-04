'use client';

import useSWR from 'swr';
import { EmptyState, ConfirmDeleteButton, Badge } from '@/components/ui';
import VKLoader from '@/components/VKLoader';
import { del } from '@/lib/fetcher';
import { useModal, useToast } from '@/components/UIProvider';
import AccountForm from '@/components/forms/AccountForm';

export default function AccountsPage() {
  const { data, isLoading, mutate } = useSWR('/api/accounts');
  const { data: profile } = useSWR('/api/profile');
  const currency = profile?.currency || '₹';
  const { openModal, closeModal } = useModal();
  const toast = useToast();

  function add() {
    openModal('Add Account', <AccountForm onDone={() => { toast('Account added'); mutate(); }} />);
  }
  async function remove(id) {
    try {
      await del(`/api/accounts/${id}`);
      toast('Account removed');
      mutate();
    } catch (err) {
      toast(err.message);
    }
  }

  return (
    <div className="view active">
      <div className="view-head">
        <h2>Accounts</h2>
        <div className="view-head-actions"><button className="btn-primary" onClick={add}>+ Add account</button></div>
      </div>

      {isLoading ? (
        <VKLoader inline label="Loading accounts" />
      ) : !data?.accounts?.length ? (
        <EmptyState title="No accounts yet" />
      ) : (
        <div className="card-grid">
          {data.accounts.map((a) => (
            <div className="item-card" key={a.id}>
              <div className="ic-top">
                <div>
                  <div className="ic-name">{a.name}</div>
                  <div className="ic-type">{a.type.replace('_', ' ')}{a.virtual && <span className="virtual-tag">Live from Ledger</span>}</div>
                </div>
                <div className="ic-actions">
                    {a.virtual && <Badge tone="warn">Read-only</Badge>}
                    {!a.virtual && <ConfirmDeleteButton className="ic-del" onConfirm={() => remove(a.id)} />}
                  </div>
              </div>
              <div className={`ic-amt num ${a.balance < 0 ? 'amt-out' : ''}`}>{currency}{Math.round(a.balance).toLocaleString('en-IN')}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

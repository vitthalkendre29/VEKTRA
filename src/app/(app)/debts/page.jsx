'use client';

import useSWR from 'swr';
import { del } from '@/lib/fetcher';
import { EmptyState, ConfirmDeleteButton, StatCard } from '@/components/ui';
import VKLoader from '@/components/VKLoader';
import { fmtDate } from '@/lib/format';
import { useModal, useToast } from '@/components/UIProvider';
import LoanForm from '@/components/forms/LoanForm';
import BillForm from '@/components/forms/BillForm';

export default function DebtsPage() {
  const { data: loanData, isLoading: loansLoading, mutate: mutateLoans } = useSWR('/api/loans');
  const { data: billData, isLoading: billsLoading, mutate: mutateBills } = useSWR('/api/bills');
  const { data: profile } = useSWR('/api/profile');
  const currency = profile?.currency || '₹';
  const { openModal, closeModal } = useModal();
  const toast = useToast();

  const loans = loanData?.loans || [];
  const bills = billData?.bills || [];
  const totalEmi = loans.reduce((s, l) => s + l.emi, 0);
  const totalOutstanding = loans.reduce((s, l) => s + l.outstanding, 0);

  function addLoan() {
    openModal('Add Loan', <LoanForm onDone={() => { toast('Loan added'); mutateLoans(); }} />);
  }
  function addBill() {
    openModal('Add Bill', <BillForm onDone={() => { toast('Bill added'); mutateBills(); }} />);
  }

  return (
    <div className="view active">
      <div className="view-head">
        <h2>Loans & Bills</h2>
        <div className="view-head-actions">
          <button className="btn-secondary" onClick={addBill}>+ Add bill</button>
          <button className="btn-primary" onClick={addLoan}>+ Add loan</button>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Total outstanding" value={`${currency}${totalOutstanding.toLocaleString('en-IN')}`} accent="debt" />
        <StatCard label="Monthly EMI" value={`${currency}${totalEmi.toLocaleString('en-IN')}`} accent="debt" />
      </div>

      <div className="section-title">Loans</div>
      {loansLoading ? <VKLoader inline label="Loading loans" /> : !loans.length ? <EmptyState title="No loans" /> : (
        <div className="card-grid">
          {loans.map((l) => (
            <div className="item-card" key={l.id}>
              <div className="ic-top">
                <div>
                  <div className="ic-name">{l.type}</div>
                  <div className="ic-type">{l.lender || 'Unspecified lender'}</div>
                </div>
                <div className="ic-actions">
                  <ConfirmDeleteButton className="ic-del" onConfirm={async () => { await del(`/api/bills/${b.id}`); toast('Bill removed'); mutateBills(); }} />
                </div>
              </div>
              <div className="ic-amt num">{currency}{l.outstanding.toLocaleString('en-IN')}</div>
              <div className="ic-sub">{l.rate}% · EMI {currency}{l.emi.toLocaleString('en-IN')}/mo{l.nextPayment ? ` · Next: ${fmtDate(l.nextPayment)}` : ''}</div>
            </div>
          ))}
        </div>
      )}

      <div className="section-title">Bills</div>
      {billsLoading ? <VKLoader inline label="Loading bills" /> : !bills.length ? <EmptyState title="No bills" /> : (
        <div className="card-grid">
          {bills.map((b) => (
            <div className="item-card" key={b.id}>            
              <div className="ic-top">
                <div>
                  <div className="ic-name">{b.name}</div>
                  <div className="ic-type">{b.frequency}</div>
                </div>
                <div className="ic-actions">
                  <ConfirmDeleteButton className="ic-del" onConfirm={async () => { await del(`/api/bills/${b.id}`); toast('Bill removed'); mutateBills(); }} />
                </div>
              </div>
              <div className="ic-amt num">{currency}{b.amount.toLocaleString('en-IN')}</div>
              <div className="ic-sub">{b.dueDate ? `Due: ${fmtDate(b.dueDate)}` : 'No due date set'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

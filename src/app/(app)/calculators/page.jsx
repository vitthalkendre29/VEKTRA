'use client';

import { useState } from 'react';
import useSWR from 'swr';

const TABS = [
  { key: 'sip', label: 'SIP Growth' },
  { key: 'emi', label: 'EMI' },
  { key: 'emergency', label: 'Emergency Fund' },
];

export default function CalculatorsPage() {
  const [tab, setTab] = useState('sip');
  const { data: profile } = useSWR('/api/profile');
  const currency = profile?.currency || '₹';

  return (
    <div className="view active">
      <div className="view-head"><h2>Calculators</h2></div>
      <div className="calc-tabs">
        {TABS.map((t) => (
          <button key={t.key} className={`calc-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>
      {tab === 'sip' && <SipCalc currency={currency} />}
      {tab === 'emi' && <EmiCalc currency={currency} />}
      {tab === 'emergency' && <EmergencyCalc currency={currency} />}
    </div>
  );
}

function SipCalc({ currency }) {
  const [monthly, setMonthly] = useState(5000);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(12);

  const n = years * 12;
  const r = rate / 100 / 12;
  const futureValue = r > 0 ? monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r) : monthly * n;
  const invested = monthly * n;
  const gain = futureValue - invested;

  return (
    <div className="panel">
      <div className="form-grid">
        <label>Monthly investment<input type="number" value={monthly} onChange={(e) => setMonthly(Number(e.target.value) || 0)} /></label>
        <label>Duration (years)<input type="number" value={years} onChange={(e) => setYears(Number(e.target.value) || 0)} /></label>
        <label>Expected annual return (%)<input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value) || 0)} /></label>
      </div>
      <div className="calc-result">
        <span className="cr-label">Future value</span>
        <span className="cr-big num">{currency}{Math.round(futureValue).toLocaleString('en-IN')}</span>
        <span className="cr-label">Invested {currency}{Math.round(invested).toLocaleString('en-IN')} · Gain {currency}{Math.round(gain).toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
}

function EmiCalc({ currency }) {
  const [principal, setPrincipal] = useState(1000000);
  const [rate, setRate] = useState(9);
  const [years, setYears] = useState(15);

  const n = years * 12;
  const r = rate / 100 / 12;
  const emi = r > 0 ? (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : principal / n;
  const totalPayment = emi * n;
  const totalInterest = totalPayment - principal;

  return (
    <div className="panel">
      <div className="form-grid">
        <label>Loan amount<input type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value) || 0)} /></label>
        <label>Interest rate (% p.a.)<input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value) || 0)} /></label>
        <label>Tenure (years)<input type="number" value={years} onChange={(e) => setYears(Number(e.target.value) || 0)} /></label>
      </div>
      <div className="calc-result">
        <span className="cr-label">Monthly EMI</span>
        <span className="cr-big num">{currency}{Math.round(emi).toLocaleString('en-IN')}</span>
        <span className="cr-label">Total interest {currency}{Math.round(totalInterest).toLocaleString('en-IN')} · Total payment {currency}{Math.round(totalPayment).toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
}

function EmergencyCalc({ currency }) {
  const [monthlyExpense, setMonthlyExpense] = useState(30000);
  const [months, setMonths] = useState(6);
  const [saved, setSaved] = useState(0);

  const target = monthlyExpense * months;
  const remaining = Math.max(0, target - saved);

  return (
    <div className="panel">
      <div className="form-grid">
        <label>Essential monthly expenses<input type="number" value={monthlyExpense} onChange={(e) => setMonthlyExpense(Number(e.target.value) || 0)} /></label>
        <label>Months of cover<input type="number" value={months} onChange={(e) => setMonths(Number(e.target.value) || 0)} /></label>
        <label>Already saved<input type="number" value={saved} onChange={(e) => setSaved(Number(e.target.value) || 0)} /></label>
      </div>
      <div className="calc-result">
        <span className="cr-label">Target fund</span>
        <span className="cr-big num">{currency}{target.toLocaleString('en-IN')}</span>
        <span className="cr-label">{remaining > 0 ? `${currency}${remaining.toLocaleString('en-IN')} left to save` : "You're fully covered!"}</span>
      </div>
    </div>
  );
}

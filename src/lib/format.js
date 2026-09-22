export function fmtAmt(n, currency = '₹') {
  const num = Number(n) || 0;
  const sign = num < 0 ? '-' : '';
  const abs = Math.abs(num);
  return sign + currency + abs.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export function fmtDate(d) {
  if (!d) return '—';
  const dt = typeof d === 'string' ? new Date(d + 'T00:00:00') : new Date(d);
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

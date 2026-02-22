import JSZip from 'jszip';
import { formatDuration } from '@/lib/trade-utils';

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function todayStamp() {
  return new Date().toISOString().split('T')[0];
}

function escapeCSV(val) {
  const str = String(val ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportAsCSV(trades, strategies, accounts) {
  const strategyName = (id) => strategies.find(s => s.id === id)?.name ?? '';
  const accountName = (id) => accounts.find(a => a.id === id)?.name ?? '';

  const headers = [
    'Date', 'Symbol', 'Direction', 'Entry Price', 'Exit Price',
    'Position Size', 'PNL', 'Fees', 'Commissions', 'Duration',
    'Strategy', 'Account', 'Tags', 'Notes', 'TP Count',
  ];

  const rows = trades.map(t => [
    t.entryDate?.split('T')[0] ?? '',
    t.symbol,
    t.direction,
    t.entryPrice,
    t.exitPrice,
    t.positionSize,
    t.pnl?.toFixed(2) ?? '0',
    (t.fees || 0).toFixed(2),
    (t.commissions || 0).toFixed(2),
    formatDuration(t.tradeDuration),
    strategyName(t.strategyId),
    accountName(t.accountId),
    (t.tags || []).join('; '),
    t.notes || '',
    (t.takeProfits || []).length,
  ]);

  const csv = [headers, ...rows].map(row => row.map(escapeCSV).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `tradeflow-trades-${todayStamp()}.csv`);
}

function base64ToUint8(dataUrl) {
  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function exportAsZip(trades, strategies, accounts) {
  const zip = new JSZip();

  let imageCount = 0;
  const exportTrades = trades.map(t => {
    const images = (t.images || []);
    if (images.length === 0) return { ...t };

    const filenames = images.map((dataUrl, i) => {
      const name = `${t.id}-${i + 1}.jpg`;
      zip.file(`images/${name}`, base64ToUint8(dataUrl));
      imageCount++;
      return name;
    });
    return { ...t, images: filenames };
  });

  zip.file('manifest.json', JSON.stringify({
    version: 1,
    app: 'TradeFlow',
    exportedAt: new Date().toISOString(),
    counts: {
      trades: trades.length,
      accounts: accounts.length,
      strategies: strategies.length,
      images: imageCount,
    },
  }, null, 2));

  zip.file('data/trades.json', JSON.stringify(exportTrades, null, 2));
  zip.file('data/accounts.json', JSON.stringify(accounts, null, 2));
  zip.file('data/strategies.json', JSON.stringify(strategies, null, 2));

  const blob = await zip.generateAsync({ type: 'blob' });
  triggerDownload(blob, `tradeflow-backup-${todayStamp()}.zip`);
}

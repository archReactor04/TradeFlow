export function buildFingerprint(trade) {
  return [
    trade.symbol,
    trade.direction,
    trade.entryDate,
    trade.exitDate,
    String(trade.entryPrice),
    String(trade.exitPrice),
    String(trade.positionSize),
    trade.accountId ?? '',
  ].join('|');
}

export function computeDurationSeconds(entryDate, exitDate) {
  if (!entryDate || !exitDate) return null;
  const ms = new Date(exitDate) - new Date(entryDate);
  return ms > 0 ? Math.round(ms / 1000) : null;
}

export function formatDuration(seconds) {
  if (seconds == null || seconds <= 0) return '—';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

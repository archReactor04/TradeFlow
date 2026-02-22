import JSZip from 'jszip';
import { db } from '@/db';

function uint8ToBase64DataUrl(uint8) {
  let binary = '';
  for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i]);
  return `data:image/jpeg;base64,${btoa(binary)}`;
}

async function readZip(file) {
  const zip = await JSZip.loadAsync(file);

  const manifestFile = zip.file('manifest.json');
  if (!manifestFile) throw new Error('Invalid backup: missing manifest.json');
  const manifest = JSON.parse(await manifestFile.async('string'));
  if (manifest.version !== 1) throw new Error(`Unsupported backup version: ${manifest.version}`);

  const tradesFile = zip.file('data/trades.json');
  const accountsFile = zip.file('data/accounts.json');
  const strategiesFile = zip.file('data/strategies.json');

  const trades = tradesFile ? JSON.parse(await tradesFile.async('string')) : [];
  const accounts = accountsFile ? JSON.parse(await accountsFile.async('string')) : [];
  const strategies = strategiesFile ? JSON.parse(await strategiesFile.async('string')) : [];

  return { zip, manifest, trades, accounts, strategies };
}

async function resolveImages(zip, trades) {
  let imageCount = 0;
  const resolved = [];

  for (const trade of trades) {
    const images = trade.images || [];
    if (images.length === 0 || (images.length > 0 && images[0].startsWith('data:'))) {
      resolved.push(trade);
      continue;
    }

    const restoredImages = [];
    for (const filename of images) {
      const imgFile = zip.file(`images/${filename}`);
      if (imgFile) {
        const bytes = await imgFile.async('uint8array');
        restoredImages.push(uint8ToBase64DataUrl(bytes));
        imageCount++;
      }
    }
    resolved.push({ ...trade, images: restoredImages });
  }

  return { resolved, imageCount };
}

export async function previewZip(file) {
  const { manifest } = await readZip(file);
  return manifest;
}

export async function importFromZip(file) {
  const { zip, trades, accounts, strategies } = await readZip(file);

  const existingAccountIds = new Set((await db.accounts.toArray()).map(a => a.id));
  const existingStrategyIds = new Set((await db.strategies.toArray()).map(s => s.id));
  const existingTradeIds = new Set((await db.trades.toArray()).map(t => t.id));

  const newAccounts = accounts.filter(a => !existingAccountIds.has(a.id));
  const newStrategies = strategies.filter(s => !existingStrategyIds.has(s.id));

  const { resolved, imageCount } = await resolveImages(zip, trades);
  const newTrades = resolved.filter(t => !existingTradeIds.has(t.id));

  const skipped = (accounts.length - newAccounts.length)
    + (strategies.length - newStrategies.length)
    + (trades.length - newTrades.length);

  if (newAccounts.length) await db.accounts.bulkAdd(newAccounts);
  if (newStrategies.length) await db.strategies.bulkAdd(newStrategies);
  if (newTrades.length) await db.trades.bulkAdd(newTrades);

  return {
    trades: newTrades.length,
    accounts: newAccounts.length,
    strategies: newStrategies.length,
    images: imageCount,
    skipped,
  };
}

export async function importForStudent(file, studentId) {
  const { zip, trades, strategies } = await readZip(file);

  const existingStrategyIds = new Set(
    (await db.studentStrategies.where('studentId').equals(studentId).toArray()).map(s => s.id)
  );
  const existingTradeIds = new Set(
    (await db.studentTrades.where('studentId').equals(studentId).toArray()).map(t => t.id)
  );

  const newStrategies = strategies
    .filter(s => !existingStrategyIds.has(s.id))
    .map(s => ({ ...s, studentId }));

  const { resolved, imageCount } = await resolveImages(zip, trades);
  const newTrades = resolved
    .filter(t => !existingTradeIds.has(t.id))
    .map(t => {
      const { accountId, ...rest } = t;
      return { ...rest, studentId };
    });

  const skipped = (strategies.length - newStrategies.length)
    + (trades.length - newTrades.length);

  if (newStrategies.length) await db.studentStrategies.bulkAdd(newStrategies);
  if (newTrades.length) await db.studentTrades.bulkAdd(newTrades);

  return {
    trades: newTrades.length,
    strategies: newStrategies.length,
    images: imageCount,
    skipped,
  };
}

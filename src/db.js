import Dexie from 'dexie';

export const db = new Dexie('TradeFlowDB');

db.version(1).stores({
  trades:     'id, symbol, direction, entryDate, exitDate, strategyId, accountId',
  accounts:   'id, name',
  strategies: 'id, name',
});

db.version(2).stores({
  trades:     'id, symbol, direction, entryDate, exitDate, strategyId, accountId',
  accounts:   'id, name',
  strategies: 'id, name',
}).upgrade(tx => {
  return tx.table('trades').toCollection().modify(trade => {
    if (trade.fees === undefined) trade.fees = 0;
    if (trade.commissions === undefined) trade.commissions = 0;
    if (trade.tradeDuration === undefined) {
      if (trade.entryDate && trade.exitDate) {
        trade.tradeDuration = Math.round((new Date(trade.exitDate) - new Date(trade.entryDate)) / 1000);
      } else {
        trade.tradeDuration = null;
      }
    }
  });
});

db.version(3).stores({
  trades:     'id, symbol, direction, entryDate, exitDate, strategyId, accountId',
  accounts:   'id, name',
  strategies: 'id, name',
  settings:   'key',
});

db.version(4).stores({
  trades:     'id, symbol, direction, entryDate, exitDate, strategyId, accountId',
  accounts:   'id, name',
  strategies: 'id, name',
  settings:   'key',
}).upgrade(tx => {
  return tx.table('trades').toCollection().modify(trade => {
    if (!trade.images) trade.images = [];
  });
});

db.version(5).stores({
  trades:             'id, symbol, direction, entryDate, exitDate, strategyId, accountId',
  accounts:           'id, name',
  strategies:         'id, name',
  settings:           'key',
  students:           'id, name',
  studentTrades:      'id, studentId, symbol, direction, entryDate, exitDate, strategyId',
  studentStrategies:  'id, studentId, name',
});

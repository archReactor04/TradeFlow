import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import { useCallback } from 'react';

export function useStrategyStore() {
  const strategies = useLiveQuery(() => db.strategies.toArray(), [], []);

  const addStrategy = useCallback(async (strategy) => {
    const newStrategy = { ...strategy, id: crypto.randomUUID() };
    await db.strategies.add(newStrategy);
    return newStrategy;
  }, []);

  const updateStrategy = useCallback(async (id, updates) => {
    await db.strategies.update(id, updates);
  }, []);

  const deleteStrategy = useCallback(async (id) => {
    await db.strategies.delete(id);
  }, []);

  return { strategies, addStrategy, updateStrategy, deleteStrategy };
}

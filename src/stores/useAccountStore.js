import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import { useCallback } from 'react';

export function useAccountStore() {
  const accounts = useLiveQuery(() => db.accounts.toArray(), [], []);

  const addAccount = useCallback(async (account) => {
    const newAccount = { ...account, id: crypto.randomUUID() };
    await db.accounts.add(newAccount);
    return newAccount;
  }, []);

  const updateAccount = useCallback(async (id, updates) => {
    await db.accounts.update(id, updates);
  }, []);

  const deleteAccount = useCallback(async (id) => {
    await db.accounts.delete(id);
  }, []);

  return { accounts, addAccount, updateAccount, deleteAccount };
}

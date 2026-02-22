import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';

export function useStudentStrategyStore(studentId) {
  const strategies = useLiveQuery(
    () => studentId ? db.studentStrategies.where('studentId').equals(studentId).toArray() : [],
    [studentId],
    []
  );

  return { strategies };
}

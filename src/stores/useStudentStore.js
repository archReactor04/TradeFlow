import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import { useCallback } from 'react';

export function useStudentStore() {
  const students = useLiveQuery(() => db.students.toArray(), [], []);

  const addStudent = useCallback(async (student) => {
    const newStudent = {
      ...student,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    await db.students.add(newStudent);
    return newStudent;
  }, []);

  const updateStudent = useCallback(async (id, updates) => {
    await db.students.update(id, updates);
  }, []);

  const deleteStudent = useCallback(async (id) => {
    await db.transaction('rw', db.students, db.studentTrades, db.studentStrategies, async () => {
      await db.studentTrades.where('studentId').equals(id).delete();
      await db.studentStrategies.where('studentId').equals(id).delete();
      await db.students.delete(id);
    });
  }, []);

  return { students, addStudent, updateStudent, deleteStudent };
}

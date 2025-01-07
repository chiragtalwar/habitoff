import { useState, useEffect, useCallback } from 'react';
import { HabitWithCompletedDates, CreateHabitInput } from '../types/habit';
import { useAuth } from '../contexts/AuthContext';
import { habitService } from '../services/habitService';

export function useHabits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<HabitWithCompletedDates[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load habits whenever user changes
  useEffect(() => {
    if (user?.id) {
      loadHabits();
    } else {
      setHabits([]);
      setIsLoading(false);
    }
  }, [user]);

  // Set up sync on visibility change
  useEffect(() => {
    if (!user?.id) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadHabits();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  // Load habits with proper error handling
  const loadHabits = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      const loadedHabits = await habitService.getHabits(user.id);
      setHabits(loadedHabits);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load habits'));
      console.error('Error loading habits:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const addHabit = useCallback(async (habitData: CreateHabitInput) => {
    if (!user?.id) {
      throw new Error('User must be logged in to add habits');
    }

    try {
      await habitService.addHabit(user.id, habitData);
      await loadHabits(); // Reload to ensure consistency
    } catch (err) {
      console.error('Error adding habit:', err);
      throw err;
    }
  }, [user, loadHabits]);

  const toggleHabit = useCallback(async (habitId: string) => {
    if (!user?.id) {
      throw new Error('User must be logged in to toggle habits');
    }

    try {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      const today = new Date().toISOString().split('T')[0];
      const isCompleted = habit.completedDates.includes(today);

      if (isCompleted) {
        await habitService.unmarkHabitComplete(habitId);
      } else {
        await habitService.markHabitComplete(habitId);
      }

      await loadHabits(); // Reload to ensure consistency
    } catch (err) {
      console.error('Error toggling habit:', err);
      throw err;
    }
  }, [user, habits, loadHabits]);

  const deleteHabit = useCallback(async (habitId: string) => {
    if (!user?.id) {
      throw new Error('User must be logged in to delete habits');
    }

    try {
      await habitService.deleteHabit(user.id, habitId);
      await loadHabits(); // Reload to ensure consistency
    } catch (err) {
      console.error('Error deleting habit:', err);
      throw err;
    }
  }, [user, loadHabits]);

  return {
    habits,
    isLoading,
    error,
    addHabit,
    toggleHabit,
    deleteHabit,
    refreshHabits: loadHabits
  };
} 
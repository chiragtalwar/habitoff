import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { HabitWithCompletedDates, Habit } from '../types/habit';
import { habitService } from '../services/habitService';
import { useAuth } from './AuthContext';

interface HabitsContextType {
  habits: HabitWithCompletedDates[];
  loading: boolean;
  error: Error | null;
  refreshHabits: () => Promise<void>;
  addHabit: (habit: Habit) => Promise<void>;
  updateHabit: (habit: Habit) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  markHabitComplete: (id: string) => Promise<void>;
  unmarkHabitComplete: (id: string) => Promise<void>;
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

// Cache habits in memory between tab switches
let inMemoryHabitsCache: HabitWithCompletedDates[] | null = null;

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [habits, setHabits] = useState<HabitWithCompletedDates[]>(() => inMemoryHabitsCache || []);
  const [loading, setLoading] = useState(!inMemoryHabitsCache);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(!inMemoryHabitsCache);

  const refreshHabits = useCallback(async (showLoading = false) => {
    if (!user?.id) return;
    
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      // First try to get from local storage quickly
      const localHabits = await habitService.getLocalHabits();
      if (localHabits.length > 0) {
        setHabits(localHabits);
        inMemoryHabitsCache = localHabits;
      }
      
      // Then sync with Supabase in background
      await habitService.syncWithSupabase(user.id);
      
      // Update with synced data
      const syncedHabits = await habitService.getLocalHabits();
      setHabits(syncedHabits);
      inMemoryHabitsCache = syncedHabits;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load habits'));
      console.error('Error loading habits:', err);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [user]);

  // Listen for changes from other tabs
  useEffect(() => {
    const handleStorageChange = async (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.habits) {
        const newHabits = changes.habits.newValue;
        setHabits(newHabits);
        inMemoryHabitsCache = newHabits;
      }
    };

    const handleRuntimeMessage = (
      message: { type: string; habitId: string },
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => {
      if (message.type === 'HABIT_UPDATED') {
        refreshHabits(false);
      }
      sendResponse();
      return true;
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    chrome.runtime.onMessage.addListener(handleRuntimeMessage);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
      chrome.runtime.onMessage.removeListener(handleRuntimeMessage);
    };
  }, [refreshHabits]);

  // Initial load and periodic sync
  useEffect(() => {
    if (user?.id) {
      refreshHabits(isInitialLoad);

      // Set up periodic sync every 5 minutes
      const syncInterval = setInterval(() => refreshHabits(false), 5 * 60 * 1000);
      
      // Also sync when tab becomes visible
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          refreshHabits(false);
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        clearInterval(syncInterval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [user, refreshHabits, isInitialLoad]);

  const addHabit = useCallback(async (habit: Habit) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      await habitService.addHabit(user.id, habit);
      await refreshHabits(false);
    } catch (err) {
      console.error('Error adding habit:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, refreshHabits]);

  const updateHabit = useCallback(async (habit: Habit) => {
    if (!user?.id) return;

    try {
      // Optimistic update
      const transformedHabit = await habitService.toUIHabit(habit);
      setHabits(prevHabits => {
        const newHabits = prevHabits.map(h => h.id === habit.id ? transformedHabit : h);
        inMemoryHabitsCache = newHabits;
        return newHabits;
      });
      
      // Sync in background
      await refreshHabits(false);
    } catch (err) {
      console.error('Error updating habit:', err);
      throw err;
    }
  }, [user, refreshHabits]);

  const deleteHabit = useCallback(async (id: string) => {
    if (!user?.id) return;

    try {
      // Optimistic delete
      setHabits(prevHabits => {
        const newHabits = prevHabits.filter(h => h.id !== id);
        inMemoryHabitsCache = newHabits;
        return newHabits;
      });
      
      await habitService.deleteHabit(user.id, id);
      await refreshHabits(false);
    } catch (err) {
      console.error('Error deleting habit:', err);
      throw err;
    }
  }, [user, refreshHabits]);

  const markHabitComplete = useCallback(async (id: string) => {
    try {
      // Optimistic update
      setHabits(prevHabits => {
        const newHabits = prevHabits.map(h => {
          if (h.id === id) {
            const today = new Date().toISOString().split('T')[0];
            return {
              ...h,
              completedDates: [...h.completedDates, today].sort(),
              currentStreak: habitService.calculateCurrentStreak([...h.completedDates, today])
            };
          }
          return h;
        });
        inMemoryHabitsCache = newHabits;
        return newHabits;
      });

      await habitService.markHabitComplete(id);
      await refreshHabits(false);
    } catch (err) {
      console.error('Error marking habit complete:', err);
      throw err;
    }
  }, [refreshHabits]);

  const unmarkHabitComplete = useCallback(async (id: string) => {
    try {
      // Optimistic update
      setHabits(prevHabits => {
        const newHabits = prevHabits.map(h => {
          if (h.id === id) {
            const today = new Date().toISOString().split('T')[0];
            const newDates = h.completedDates.filter(d => d !== today);
            return {
              ...h,
              completedDates: newDates,
              currentStreak: habitService.calculateCurrentStreak(newDates)
            };
          }
          return h;
        });
        inMemoryHabitsCache = newHabits;
        return newHabits;
      });

      await habitService.unmarkHabitComplete(id);
      await refreshHabits(false);
    } catch (err) {
      console.error('Error unmarking habit:', err);
      throw err;
    }
  }, [refreshHabits]);

  const value = {
    habits,
    loading,
    error,
    refreshHabits: () => refreshHabits(true),
    addHabit,
    updateHabit,
    deleteHabit,
    markHabitComplete,
    unmarkHabitComplete
  };

  return (
    <HabitsContext.Provider value={value}>
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabitsContext() {
  const context = useContext(HabitsContext);
  if (context === undefined) {
    throw new Error('useHabitsContext must be used within a HabitsProvider');
  }
  return context;
} 
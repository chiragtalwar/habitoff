import { useState, useEffect, useCallback, useRef } from 'react';
import { HabitWithCompletedDates, CreateHabitInput } from '../types/habit';
import { useAuth } from '../contexts/AuthContext';
import { habitService } from '../services/habitService';

export function useHabits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<HabitWithCompletedDates[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const syncTimeoutRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);

  // Initialize cache and load habits immediately when user is available
  useEffect(() => {
    if (!user?.id) {
      setHabits([]);
      setIsLoading(false);
      isInitializedRef.current = false;
      return;
    }

    const initializeAndLoad = async () => {
      try {
        setIsLoading(true);
        
        // First try to load from cache immediately
        try {
          const cachedHabits = await habitService.getLocalHabits();
          if (cachedHabits.length > 0) {
            setHabits(cachedHabits);
          }
        } catch (err) {
          console.warn('Failed to load from cache:', err);
        }

        // Then initialize and sync
        if (!isInitializedRef.current) {
          await habitService.initializeCache(user.id);
          isInitializedRef.current = true;
        }
        
        // Finally, get the latest data
        await loadHabits(true);
      } catch (err) {
        console.error('Failed to initialize cache:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize cache'));
      } finally {
        setIsLoading(false);
      }
    };

    initializeAndLoad();

    return () => {
      if (syncTimeoutRef.current) {
        window.clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [user]);

  // Set up sync on visibility change and periodic refresh
  useEffect(() => {
    if (!user?.id) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        try {
          // Force sync when tab becomes visible
          await habitService.syncWithSupabase(user.id, true);
          const freshHabits = await habitService.getLocalHabits();
          setHabits(freshHabits);
        } catch (error) {
          console.error('Error syncing on visibility change:', error);
        }
      }
    };

    const scheduleSyncCheck = () => {
      if (syncTimeoutRef.current) {
        window.clearTimeout(syncTimeoutRef.current);
      }
      syncTimeoutRef.current = window.setTimeout(async () => {
        if (document.visibilityState === 'visible') {
          await loadHabits();
        }
        scheduleSyncCheck();
      }, 30000); // Check every 30 seconds
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    scheduleSyncCheck();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (syncTimeoutRef.current) {
        window.clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [user]);

  // Load habits with proper error handling
  const loadHabits = useCallback(async (forceSync: boolean = false) => {
    if (!user?.id) return;

    try {
      setError(null);
      
      // Get from cache first for immediate response
      const cachedHabits = await habitService.getLocalHabits();
      setHabits(cachedHabits);
      
      // Then sync with backend if needed
      if (forceSync || await habitService.shouldSync()) {
        await habitService.syncWithSupabase(user.id, forceSync);
        const freshHabits = await habitService.getLocalHabits();
        setHabits(freshHabits);
      }
    } catch (err) {
      console.error('Error loading habits:', err);
      setError(err instanceof Error ? err : new Error('Failed to load habits'));
    }
  }, [user]);

  const addHabit = useCallback(async (habitData: CreateHabitInput) => {
    if (!user?.id) {
      throw new Error('User must be logged in to add habits');
    }

    try {
      await habitService.addHabit(user.id, habitData);
      await loadHabits(true); // Force sync after adding
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

      const todayLocal = habitService.getTodayInUserTimezone();
      const isCompleted = habit.completedDates.includes(todayLocal);

      // Optimistically update the UI
      const updateHabit = (h: HabitWithCompletedDates): HabitWithCompletedDates => {
        if (h.id !== habitId) return h;

        const newCompletedDates = isCompleted
          ? h.completedDates.filter(d => d !== todayLocal)
          : [...new Set([...h.completedDates, todayLocal])].sort();

        return {
          ...h,
          completedDates: newCompletedDates,
          streak: habitService.calculateStreak(newCompletedDates),
          last_completed: isCompleted ? null : new Date().toISOString()
        };
      };

      // Update state immediately
      setHabits(currentHabits => currentHabits.map(updateHabit));

      // Perform the actual update
      try {
        if (isCompleted) {
          await habitService.unmarkHabitComplete(habitId);
        } else {
          await habitService.markHabitComplete(habitId);
        }
        await loadHabits(true); // Force sync after toggle
      } catch (error) {
        console.error('Error updating habit:', error);
        // Revert optimistic update on error
        setHabits(currentHabits => currentHabits.map(h => 
          h.id === habitId ? habit : h
        ));
        throw error;
      }
    } catch (err) {
      console.error('Error toggling habit:', err);
      throw err;
    }
  }, [user, habits, loadHabits]);

  const deleteHabit = useCallback(async (habitId: string) => {
    if (!user?.id) {
      throw new Error('User must be logged in to delete habits');
    }

    const originalHabits = [...habits];
    try {
      // Optimistically remove from UI
      setHabits(currentHabits => currentHabits.filter(h => h.id !== habitId));
      
      await habitService.deleteHabit(user.id, habitId);
      await loadHabits(true); // Force sync after deletion
    } catch (err) {
      console.error('Error deleting habit:', err);
      // Revert optimistic update on error
      setHabits(originalHabits);
      throw err;
    }
  }, [user, habits, loadHabits]);

  return {
    habits,
    isLoading,
    error,
    addHabit,
    toggleHabit,
    deleteHabit,
    refreshHabits: () => loadHabits(true) // Expose force sync function
  };
} 
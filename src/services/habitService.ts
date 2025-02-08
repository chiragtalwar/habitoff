import { HabitWithCompletedDates, HabitFormData, Habit } from "../types/habit";
import { supabase } from "../lib/supabase";
import { dateUtils } from "../utils/dateUtils";

const HABITS_STORAGE_KEY = 'habits';
const LAST_SYNC_KEY = 'last_habits_sync';
let localStorageCache: HabitWithCompletedDates[] | null = null;

// Add retry utility at the top of the file
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (error instanceof Error && 
         (error.message.includes('Failed to fetch') || 
          error.message.includes('ERR_NAME_NOT_RESOLVED'))) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

export const habitService = {
  // Cache validation
  validateHabit(habit: any): habit is HabitWithCompletedDates {
    return (
      habit &&
      typeof habit.id === 'string' &&
      typeof habit.title === 'string' &&
      Array.isArray(habit.completedDates) &&
      habit.completedDates.every((date: any) => typeof date === 'string')
    );
  },

  validateCache(habits: any[]): HabitWithCompletedDates[] {
    if (!Array.isArray(habits)) return [];
    return habits.filter(this.validateHabit);
  },

  // Cache management
  async clearCache(): Promise<void> {
    localStorageCache = null;
    await chrome.storage.local.remove([HABITS_STORAGE_KEY, LAST_SYNC_KEY]);
  },

  async resetCache(): Promise<void> {
    localStorageCache = [];
    await chrome.storage.local.set({ [HABITS_STORAGE_KEY]: [] });
    await chrome.storage.local.remove([LAST_SYNC_KEY]);
  },

  async getLastSyncTime(): Promise<number> {
    return new Promise((resolve) => {
      chrome.storage.local.get([LAST_SYNC_KEY], (result) => {
        resolve(result[LAST_SYNC_KEY] || 0);
      });
    });
  },

  async setLastSyncTime(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [LAST_SYNC_KEY]: Date.now() }, resolve);
    });
  },

  async shouldSync(): Promise<boolean> {
    const lastSync = await this.getLastSyncTime();
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() - lastSync > fiveMinutes;
  },

  // Local storage operations
  async getLocalHabits(): Promise<HabitWithCompletedDates[]> {
    // Return from memory cache if available
    if (localStorageCache !== null) {
      return this.validateCache(localStorageCache);
    }

    return new Promise((resolve) => {
      chrome.storage.local.get([HABITS_STORAGE_KEY], (result) => {
        const habits = this.validateCache(result[HABITS_STORAGE_KEY] || []);
        localStorageCache = habits;
        resolve(habits);
      });
    });
  },

  async saveLocalHabits(habits: HabitWithCompletedDates[]): Promise<void> {
    const validatedHabits = this.validateCache(habits);
    localStorageCache = validatedHabits;
    return new Promise((resolve) => {
      chrome.storage.local.set({ [HABITS_STORAGE_KEY]: validatedHabits }, resolve);
    });
  },

  // Initialize cache with user's habits
  async initializeCache(userId: string): Promise<void> {
    try {
      await this.clearCache();
      
      // Get habits from Supabase
      const { data: remoteHabits, error: fetchError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId);

      if (fetchError) throw fetchError;

      if (!remoteHabits || remoteHabits.length === 0) {
        await this.resetCache();
        return;
      }

      // Convert to UI format and save to cache
      const uiHabits = await Promise.all(
        remoteHabits.map(habit => this.toUIHabit(habit))
      );

      await this.saveLocalHabits(uiHabits);
      await this.setLastSyncTime();
    } catch (error) {
      console.error('Error initializing cache:', error);
      await this.resetCache();
    }
  },

  // Helper function to get today's date in user's timezone
  getTodayInUserTimezone(): string {
    return dateUtils.formatDate(dateUtils.getToday());
  },

  // Helper to normalize any date to start of day in user's timezone
  normalizeDateToStartOfDay(date: Date | string): string {
    return dateUtils.formatDate(date);
  },

  // Convert UTC date to local date string
  utcToLocalDateString(utcDate: string): string {
    return dateUtils.utcToLocal(utcDate);
  },

  // Convert local date to UTC for storage
  localToUTCDate(localDate: string): string {
    return dateUtils.localToUTC(localDate);
  },

  // Convert database habit to UI habit with all completion dates
  async toUIHabit(dbHabit: Habit): Promise<HabitWithCompletedDates> {
    // Fetch all completion dates for this habit
    const { data: completions } = await supabase
      .from('habit_completions')
      .select('completed_date')
      .eq('habit_id', dbHabit.id)
      .order('completed_date', { ascending: true });

    // Convert UTC dates to local timezone dates
    const completedDates = (completions || []).map(completion => 
      this.utcToLocalDateString(completion.completed_date)
    );

    // Remove any duplicate dates that might have occurred
    const uniqueCompletedDates = [...new Set(completedDates)];

    return {
      ...dbHabit,
      completedDates: uniqueCompletedDates,
      currentStreak: this.calculateCurrentStreak(uniqueCompletedDates),
      longestStreak: this.calculateLongestStreak(uniqueCompletedDates),
      pendingOperations: [],
      isOffline: false
    };
  },

  calculateCurrentStreak(dates: string[]): number {
    if (dates.length === 0) return 0;
    
    // Sort dates in descending order (most recent first)
    const sortedDates = [...dates].sort((a, b) => b.localeCompare(a));
    const todayLocal = this.getTodayInUserTimezone();
    const yesterdayDate = new Date(dateUtils.getToday());
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayLocal = this.normalizeDateToStartOfDay(yesterdayDate);
    
    console.log('Calculating current streak:', {
      sortedDates,
      todayLocal,
      yesterdayLocal,
      hasToday: sortedDates.includes(todayLocal),
      hasYesterday: sortedDates.includes(yesterdayLocal)
    });

    // If completed today, start with streak of 1
    if (sortedDates[0] === todayLocal) {
      let streak = 1;
      
      // Check consecutive previous days
      for (let i = 1; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i]);
        const previousDate = new Date(sortedDates[i - 1]);
        currentDate.setFullYear(2025);
        previousDate.setFullYear(2025);
        
        const diffDays = Math.floor(
          (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
      }
      return streak;
    }
    
    // If completed yesterday but not today, check if it maintains the streak
    if (sortedDates[0] === yesterdayLocal) {
      let streak = 1;
      
      // Check consecutive previous days
      for (let i = 1; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i]);
        const previousDate = new Date(sortedDates[i - 1]);
        currentDate.setFullYear(2025);
        previousDate.setFullYear(2025);
        
        const diffDays = Math.floor(
          (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
      }
      return streak;
    }
    
    // If neither today nor yesterday is completed, streak is broken
    return 0;
  },

  calculateLongestStreak(dates: string[]): number {
    if (dates.length === 0) return 0;
    
    // Ensure dates are normalized to user's timezone
    const normalizedDates = dates.map(date => this.normalizeDateToStartOfDay(date));
    const sortedDates = [...new Set(normalizedDates)].sort();
    
    let currentStreak = 1;
    let maxStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const curr = new Date(sortedDates[i]);
      const prev = new Date(sortedDates[i - 1]);
      curr.setFullYear(2025);
      prev.setFullYear(2025);
      const diffDays = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    
    return maxStreak;
  },

  // Sync operations
  async syncWithSupabase(userId: string, force: boolean = false): Promise<void> {
    if (!navigator.onLine) {
      console.log('Offline - skipping sync');
      return;
    }

    try {
      if (!force && !(await this.shouldSync())) {
        return;
      }

      await retryOperation(async () => {
      const { data: remoteHabits, error: fetchError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId);

      if (fetchError) throw fetchError;

      const remoteUIHabits = await Promise.all(
        (remoteHabits || []).map(habit => this.toUIHabit(habit))
      );

      const localHabits = await this.getLocalHabits();
      const mergedHabits = this.mergeHabits(localHabits, remoteUIHabits);

      await this.saveLocalHabits(mergedHabits);
        await this.setLastSyncTime();

        // Sync completions
      for (const habit of mergedHabits) {
        const { data: existingCompletions } = await supabase
          .from('habit_completions')
          .select('completed_date')
          .eq('habit_id', habit.id);

        const existingDates = new Set(
            existingCompletions?.map(c => this.utcToLocalDateString(c.completed_date)) || []
        );

        const newDates = habit.completedDates.filter(date => !existingDates.has(date));
        if (newDates.length > 0) {
          await supabase.from('habit_completions').insert(
            newDates.map(date => ({
              habit_id: habit.id,
                completed_date: this.localToUTCDate(date)
            }))
          );
        }
      }
      });
    } catch (error) {
      console.error('Sync failed:', error);
      // Don't throw - allow app to continue with local cache
    }
  },

  // Public API methods
  async getHabits(userId: string): Promise<HabitWithCompletedDates[]> {
    try {
      // First return cached data if available
      const cachedHabits = await this.getLocalHabits();
      
      // Trigger sync if needed
      const shouldSync = await this.shouldSync();
      if (shouldSync) {
        try {
          await this.syncWithSupabase(userId);
          return this.getLocalHabits(); // Return fresh data after sync
        } catch (error) {
          console.error('Sync failed, using cached data:', error);
        return cachedHabits;
        }
      }

      return cachedHabits;
    } catch (error) {
      console.error('Error getting habits:', error);
      return [];
    }
  },

  async addHabit(userId: string, habitData: HabitFormData): Promise<void> {
    try {
      const now = new Date().toISOString();
      const newHabit: HabitWithCompletedDates = {
        id: crypto.randomUUID(),
        user_id: userId,
        title: habitData.title.trim(),
        description: habitData.description?.trim() || null,
        frequency: habitData.frequency,
        animal_type: habitData.animal_type,
        plant_type: 'flower', // Default plant type
        streak: 0,
        last_completed: null,
        created_at: now,
        updated_at: now,
        completedDates: [],
        currentStreak: 0,
        longestStreak: 0,
        pendingOperations: [],
        isOffline: false
      };

      // Update local cache first
      const habits = await this.getLocalHabits();
      await this.saveLocalHabits([...habits, newHabit]);

      // Then create in Supabase
      const { error: insertError } = await supabase
        .from('habits')
        .insert({
          id: newHabit.id,
          user_id: newHabit.user_id,
          title: newHabit.title,
          description: newHabit.description,
          frequency: newHabit.frequency,
          animal_type: newHabit.animal_type,
          plant_type: newHabit.plant_type,
          streak: newHabit.streak,
          last_completed: newHabit.last_completed,
          created_at: newHabit.created_at,
          updated_at: newHabit.updated_at
        });

      if (insertError) throw insertError;

      // Force sync to ensure consistency
      await this.syncWithSupabase(userId, true);
    } catch (error) {
      console.error('Error adding habit:', error);
      throw error;
    }
  },

  async deleteHabit(userId: string, habitId: string): Promise<void> {
    try {
      // Update local cache first
      const habits = await this.getLocalHabits();
      await this.saveLocalHabits(habits.filter(h => h.id !== habitId));

      // Then delete from Supabase
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId)
        .eq('user_id', userId);

      if (error) throw error;

      // Force sync to ensure consistency
      await this.syncWithSupabase(userId, true);
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  },

  async markHabitComplete(habitId: string): Promise<void> {
    try {
      const today = this.getTodayInUserTimezone();
      const utcDate = this.localToUTCDate(today);

      console.log('Marking habit complete for:', {
        localDate: today,
        utcDate: utcDate
      });

      // Check if already completed to prevent duplicates
      const { data: existing } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('habit_id', habitId)
        .eq('completed_date', utcDate)
        .maybeSingle();

      if (existing) {
        console.log('Habit already completed for today');
        return;
      }

      // Update local cache first for immediate feedback
      const habits = await this.getLocalHabits();
      const habitIndex = habits.findIndex(h => h.id === habitId);
      if (habitIndex !== -1) {
        // Add today's date to completed dates
        const updatedCompletedDates = [...new Set([...habits[habitIndex].completedDates, today])];
        
        // Calculate streaks
        const currentStreak = this.calculateCurrentStreak(updatedCompletedDates);
        const longestStreak = Math.max(
          this.calculateLongestStreak(updatedCompletedDates),
          currentStreak // Ensure longest streak includes current streak
        );
        
        console.log('Updating streaks:', { currentStreak, longestStreak });
        
        habits[habitIndex] = {
          ...habits[habitIndex],
          completedDates: updatedCompletedDates,
          currentStreak,
          longestStreak,
          streak: currentStreak, // Update the streak field as well
          last_completed: utcDate
        };
        
        await this.saveLocalHabits(habits);

        // Try to sync with Supabase with retry logic
        await retryOperation(async () => {
          console.log('Inserting habit completion:', {
            habit_id: habitId,
            completed_date: utcDate,
            created_at: new Date().toISOString()
          });

          const { error } = await supabase
            .from('habit_completions')
            .insert({
              habit_id: habitId,
              completed_date: utcDate,
              created_at: new Date().toISOString()
            });

          if (error) {
            console.error('Error inserting habit completion:', error);
            throw error;
          }

          // Update the habit's streak in Supabase
          const { error: updateError } = await supabase
            .from('habits')
            .update({
              streak: currentStreak,
              last_completed: utcDate
            })
            .eq('id', habitId);

          if (updateError) {
            console.error('Error updating habit streak:', updateError);
            throw updateError;
          }
        });

        // Force sync if user is connected
        if (habits[habitIndex]?.user_id && navigator.onLine) {
          await this.syncWithSupabase(habits[habitIndex].user_id, true).catch(console.error);
        }
      }
    } catch (error) {
      console.error('Error marking habit complete:', error);
      // Don't throw here - we've already updated the local cache
    }
  },

  async unmarkHabitComplete(habitId: string): Promise<void> {
    try {
      const today = this.getTodayInUserTimezone();
      const utcDate = this.localToUTCDate(today);

      // Update local cache first for immediate feedback
      const habits = await this.getLocalHabits();
      const habitIndex = habits.findIndex(h => h.id === habitId);
      if (habitIndex !== -1) {
        const updatedCompletedDates = habits[habitIndex].completedDates.filter(date => date !== today);
        habits[habitIndex] = {
          ...habits[habitIndex],
          completedDates: updatedCompletedDates,
          currentStreak: this.calculateCurrentStreak(updatedCompletedDates),
          longestStreak: this.calculateLongestStreak(updatedCompletedDates),
          last_completed: updatedCompletedDates.length > 0 
            ? new Date(updatedCompletedDates[updatedCompletedDates.length - 1]).toISOString() 
            : null
        };
        await this.saveLocalHabits(habits);
      }

      // Try to sync with Supabase with retry logic
      await retryOperation(async () => {
        const { error } = await supabase
          .from('habit_completions')
          .delete()
          .eq('habit_id', habitId)
          .eq('completed_date', utcDate);

        if (error) throw error;
      });

      // Force sync if user is connected
      if (habits[habitIndex]?.user_id && navigator.onLine) {
        await this.syncWithSupabase(habits[habitIndex].user_id, true).catch(console.error);
      }
    } catch (error) {
      console.error('Error unmarking habit complete:', error);
      // Don't throw here - we've already updated the local cache
    }
  },

  calculateStreak(dates: string[]): number {
    if (dates.length === 0) return 0;
    
    const sortedDates = [...dates].sort((a, b) => b.localeCompare(a));
    const today = dateUtils.getToday();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    // Check if the habit was completed today or yesterday
    const lastCompletionDate = new Date(sortedDates[0]);
    if (!dateUtils.isSameDay(lastCompletionDate, today) && 
        !dateUtils.isSameDay(lastCompletionDate, yesterday)) {
      return 0;
    }

    let streak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const curr = new Date(sortedDates[i - 1]);
      const prev = new Date(sortedDates[i]);
      const diffDays = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  },

  // Merge habits with proper conflict resolution
  mergeHabits(
    local: HabitWithCompletedDates[], 
    remote: HabitWithCompletedDates[]
  ): HabitWithCompletedDates[] {
    const merged = new Map<string, HabitWithCompletedDates>();
    
    // First, add all local habits
    local.forEach(habit => merged.set(habit.id, habit));
    
    // Then merge remote habits, keeping the most recent version
    remote.forEach(remoteHabit => {
      const localHabit = merged.get(remoteHabit.id);
      if (!localHabit) {
        merged.set(remoteHabit.id, remoteHabit);
      } else {
        // Compare update timestamps and keep the most recent version
        const remoteDate = new Date(remoteHabit.updated_at);
        const localDate = new Date(localHabit.updated_at);
        
        if (remoteDate > localDate) {
          merged.set(remoteHabit.id, remoteHabit);
        }
      }
    });
    
    return Array.from(merged.values());
  },

  async fetchCompletions(): Promise<void> {
    try {
      const { data: completions, error } = await supabase
        .from('habit_completions')
        .select('*');

      if (error) throw error;

      // Convert UTC dates to local dates for the cache
      const habits = await this.getLocalHabits();
      habits.forEach(habit => {
        habit.completedDates = completions
          .filter(c => c.habit_id === habit.id)
          .map(c => {
            const localDate = dateUtils.utcToLocal(c.completed_date);
            return dateUtils.formatDate(localDate);
          });
      });

      await this.saveLocalHabits(habits);
    } catch (error) {
      console.error('Error fetching completions:', error);
      throw error;
    }
  },
}; 
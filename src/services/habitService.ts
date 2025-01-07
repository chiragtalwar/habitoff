import { HabitWithCompletedDates, HabitFormData, Habit } from "../types/habit";
import { supabase } from "../lib/supabase";

const HABITS_STORAGE_KEY = 'habits';
let localStorageCache: HabitWithCompletedDates[] | null = null;

export const habitService = {
  // Convert database habit to UI habit with all completion dates
  async toUIHabit(dbHabit: Habit): Promise<HabitWithCompletedDates> {
    // Fetch all completion dates for this habit
    const { data: completions } = await supabase
      .from('habit_completions')
      .select('completed_date')
      .eq('habit_id', dbHabit.id)
      .order('completed_date', { ascending: true });

    const completedDates = (completions || []).map(completion => 
      new Date(completion.completed_date).toISOString().split('T')[0]
    );

    return {
      ...dbHabit,
      completedDates,
      currentStreak: this.calculateCurrentStreak(completedDates),
      longestStreak: this.calculateLongestStreak(completedDates)
    };
  },

  calculateCurrentStreak(dates: string[]): number {
    if (dates.length === 0) return 0;
    
    const sortedDates = [...dates].sort((a, b) => b.localeCompare(a));
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // If not completed today or yesterday, streak is broken
    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
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

  calculateLongestStreak(dates: string[]): number {
    if (dates.length === 0) return 0;
    
    const sortedDates = [...dates].sort();
    let currentStreak = 1;
    let maxStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const curr = new Date(sortedDates[i]);
      const prev = new Date(sortedDates[i - 1]);
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

  async getLocalHabits(): Promise<HabitWithCompletedDates[]> {
    // Return from memory cache if available
    if (localStorageCache !== null) {
      return localStorageCache;
    }

    return new Promise((resolve) => {
      chrome.storage.local.get([HABITS_STORAGE_KEY], (result) => {
        const habits = result[HABITS_STORAGE_KEY] || [];
        localStorageCache = habits;
        resolve(habits);
      });
    });
  },

  async saveLocalHabits(habits: HabitWithCompletedDates[]): Promise<void> {
    localStorageCache = habits;
    return new Promise((resolve) => {
      chrome.storage.local.set({ [HABITS_STORAGE_KEY]: habits }, resolve);
    });
  },

  async syncWithSupabase(userId: string): Promise<void> {
    try {
      // Get remote habits first
      const { data: remoteHabits, error: fetchError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId);

      if (fetchError) throw fetchError;

      // Convert remote habits to UI format with completion dates
      const remoteUIHabits = await Promise.all(
        (remoteHabits || []).map(habit => this.toUIHabit(habit))
      );

      // Get local habits
      const localHabits = await this.getLocalHabits();
      
      // Merge habits, preferring the most recently updated version
      const mergedHabits = this.mergeHabits(localHabits, remoteUIHabits);

      // Update local storage
      await this.saveLocalHabits(mergedHabits);

      // Sync completion dates to Supabase
      for (const habit of mergedHabits) {
        const { data: existingCompletions } = await supabase
          .from('habit_completions')
          .select('completed_date')
          .eq('habit_id', habit.id);

        const existingDates = new Set(
          existingCompletions?.map(c => 
            new Date(c.completed_date).toISOString().split('T')[0]
          ) || []
        );

        // Add any missing completion dates
        const newDates = habit.completedDates.filter(date => !existingDates.has(date));
        if (newDates.length > 0) {
          await supabase.from('habit_completions').insert(
            newDates.map(date => ({
              habit_id: habit.id,
              completed_date: new Date(date).toISOString()
            }))
          );
        }
      }
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
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

  // Public API with improved error handling and syncing
  async getHabits(userId: string): Promise<HabitWithCompletedDates[]> {
    try {
      // First return cached data if available
      const cachedHabits = await this.getLocalHabits();
      if (cachedHabits.length > 0) {
        // Trigger sync in background
        this.syncWithSupabase(userId).catch(console.error);
        return cachedHabits;
      }

      // If no cached data, wait for sync
      await this.syncWithSupabase(userId);
      return this.getLocalHabits();
    } catch (error) {
      console.error('Error getting habits:', error);
      // Fallback to local data if sync fails
      return this.getLocalHabits();
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
        plant_type: habitData.plant_type,
        streak: 0,
        last_completed: null,
        created_at: now,
        updated_at: now,
        completedDates: [],
        currentStreak: 0,
        longestStreak: 0
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
          plant_type: newHabit.plant_type,
          streak: newHabit.streak,
          last_completed: newHabit.last_completed,
          created_at: newHabit.created_at,
          updated_at: newHabit.updated_at
        });

      if (insertError) {
        console.error('Error inserting habit to Supabase:', insertError);
        throw insertError;
      }
    } catch (error) {
      console.error('Error adding habit:', error);
      throw error;
    }
  },

  async markHabitComplete(habitId: string): Promise<void> {
    try {
      const now = new Date().toISOString();

      // Update local cache first
      const habits = await this.getLocalHabits();
      const updatedHabits = habits.map(h => {
        if (h.id === habitId) {
          const today = now.split('T')[0];
          return {
            ...h,
            last_completed: now,
            completedDates: [...h.completedDates, today].sort(),
            currentStreak: this.calculateCurrentStreak([...h.completedDates, today])
          };
        }
        return h;
      });
      await this.saveLocalHabits(updatedHabits);

      // Then update Supabase
      const { error: completionError } = await supabase
        .from('habit_completions')
        .insert({
          habit_id: habitId,
          completed_date: now
        });

      if (completionError) throw completionError;

      // Update habit's last_completed in Supabase
      const { error: habitError } = await supabase
        .from('habits')
        .update({ last_completed: now })
        .eq('id', habitId);

      if (habitError) throw habitError;
    } catch (error) {
      console.error('Error marking habit complete:', error);
      throw error;
    }
  },

  async unmarkHabitComplete(habitId: string): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Update local cache first
      const habits = await this.getLocalHabits();
      const updatedHabits = habits.map(h => {
        if (h.id === habitId) {
          const newDates = h.completedDates.filter(d => d !== today);
          return {
            ...h,
            last_completed: newDates.length > 0 ? new Date(newDates[newDates.length - 1]).toISOString() : null,
            completedDates: newDates,
            currentStreak: this.calculateCurrentStreak(newDates)
          };
        }
        return h;
      });
      await this.saveLocalHabits(updatedHabits);

      // Then update Supabase
      const { error: completionError } = await supabase
        .from('habit_completions')
        .delete()
        .eq('habit_id', habitId)
        .gte('completed_date', `${today}T00:00:00`)
        .lt('completed_date', `${today}T23:59:59`);

      if (completionError) throw completionError;

      // Update habit's last_completed in Supabase if needed
      const habit = habits.find(h => h.id === habitId);
      if (habit) {
        const { error: habitError } = await supabase
          .from('habits')
          .update({ last_completed: habit.last_completed })
          .eq('id', habitId);

        if (habitError) throw habitError;
      }
    } catch (error) {
      console.error('Error unmarking habit:', error);
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
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  },

  clearCache() {
    localStorageCache = null;
  }
}; 
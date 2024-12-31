import { HabitWithCompletedDates, HabitFormData, Habit, DateString, ensureValidDateString } from "../types/habit";
import { supabase } from "../lib/supabase";

const HABITS_STORAGE_KEY = 'habits';
const SYNC_INTERVAL = 1000 * 60 * 5; // 5 minutes

export const habitService = {
  // Utility functions
  toUIHabit(dbHabit: Habit): HabitWithCompletedDates {
    try {
      const completedDates: DateString[] = [];
      if (dbHabit.last_completed) {
        // Convert timestamp to YYYY-MM-DD
        const date = ensureValidDateString(dbHabit.last_completed.split('T')[0]);
        completedDates.push(date);
      }

      // Create a new object without the spread to avoid property conflicts
      const uiHabit: HabitWithCompletedDates = {
        id: dbHabit.id,
        user_id: dbHabit.user_id,
        title: dbHabit.title,
        description: dbHabit.description,
        frequency: dbHabit.frequency,
        plant_type: dbHabit.plant_type,
        streak: dbHabit.streak,
        last_completed: dbHabit.last_completed,
        created_at: dbHabit.created_at,
        updated_at: dbHabit.updated_at,
        completedDates: completedDates
      };

      return uiHabit;
    } catch (error) {
      console.error('Error converting habit to UI format:', error);
      // Return a safe default if conversion fails
      return {
        ...dbHabit,
        completedDates: []
      } as HabitWithCompletedDates;
    }
  },

  toDBHabit(uiHabit: HabitWithCompletedDates): Habit {
    const { completedDates, ...rest } = uiHabit;
    const lastCompleted = completedDates.length > 0 
      ? new Date(completedDates[completedDates.length - 1]).toISOString()
      : null;

    return {
      ...rest,
      last_completed: lastCompleted,
      streak: this.calculateStreak(completedDates)
    };
  },

  calculateStreak(dates: string[]): number {
    if (dates.length === 0) return 0;
    
    // Sort dates in descending order
    const sortedDates = [...dates].sort((a, b) => b.localeCompare(a));
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // Check if the habit was completed today or yesterday
    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
      return 0;
    }

    let streak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const current = new Date(sortedDates[i]);
      const previous = new Date(sortedDates[i - 1]);
      const dayDiff = (previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24);
      
      if (dayDiff === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  },

  // Local Storage Operations
  async getLocalHabits(): Promise<HabitWithCompletedDates[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get([HABITS_STORAGE_KEY], (result) => {
        resolve(result[HABITS_STORAGE_KEY] || []);
      });
    });
  },

  async saveLocalHabits(habits: HabitWithCompletedDates[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [HABITS_STORAGE_KEY]: habits }, resolve);
    });
  },

  // Supabase Operations
  async syncWithSupabase(userId: string): Promise<void> {
    try {
      // Get local habits
      const localHabits = await this.getLocalHabits();
      
      // Get remote habits
      const { data: remoteHabits, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      // Convert remote habits to UI format
      const remoteUIHabits = (remoteHabits || []).map(habit => this.toUIHabit(habit));

      // Merge habits (prefer local changes if conflict)
      const mergedHabits = this.mergeHabits(localHabits, remoteUIHabits);

      // Update local storage
      await this.saveLocalHabits(mergedHabits);

      // Update Supabase
      const dbHabits = mergedHabits.map(habit => this.toDBHabit(habit));
      const { error: upsertError } = await supabase
        .from('habits')
        .upsert(
          dbHabits.map(habit => ({
            ...habit,
            user_id: userId,
            updated_at: new Date().toISOString()
          }))
        );

      if (upsertError) throw upsertError;
    } catch (error) {
      console.error('Sync failed:', error);
      // Continue with local data if sync fails
    }
  },

  // Merge Strategy
  mergeHabits(local: HabitWithCompletedDates[], remote: HabitWithCompletedDates[]): HabitWithCompletedDates[] {
    try {
      const merged = new Map<string, HabitWithCompletedDates>();
      
      // Add all remote habits first
      remote.forEach(habit => {
        if (Array.isArray(habit.completedDates)) {
          merged.set(habit.id, {
            ...habit,
            completedDates: [...habit.completedDates]
          });
        } else {
          console.warn(`Remote habit ${habit.id} has invalid completedDates, initializing as empty array`);
          merged.set(habit.id, {
            ...habit,
            completedDates: []
          });
        }
      });
      
      // Override/Add local habits (local takes precedence)
      local.forEach(habit => {
        const existing = merged.get(habit.id);
        if (!Array.isArray(habit.completedDates)) {
          console.warn(`Local habit ${habit.id} has invalid completedDates, initializing as empty array`);
          habit.completedDates = [];
        }

        if (existing) {
          // Merge completed dates
          const allDates = new Set([
            ...(Array.isArray(existing.completedDates) ? existing.completedDates : []),
            ...habit.completedDates
          ]);
          
          merged.set(habit.id, {
            ...habit,
            completedDates: Array.from(allDates).sort()
          });
        } else {
          merged.set(habit.id, {
            ...habit,
            completedDates: [...habit.completedDates]
          });
        }
      });

      return Array.from(merged.values());
    } catch (error) {
      console.error('Error merging habits:', error);
      // Return a safe default combining both arrays
      return [...local, ...remote].map(habit => ({
        ...habit,
        completedDates: Array.isArray(habit.completedDates) ? [...habit.completedDates] : []
      }));
    }
  },

  // Public API
  async getHabits(userId: string): Promise<HabitWithCompletedDates[]> {
    const habits = await this.getLocalHabits();
    // Trigger background sync
    this.syncWithSupabase(userId).catch(console.error);
    return habits;
  },

  async addHabit(userId: string, habitData: HabitFormData): Promise<void> {
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
      completedDates: []
    };

    const habits = await this.getLocalHabits();
    await this.saveLocalHabits([...habits, newHabit]);
    
    // Immediately sync with Supabase
    const { error } = await supabase
      .from('habits')
      .insert([this.toDBHabit(newHabit)])
      .select();

    if (error) {
      console.error('Failed to add habit to Supabase:', error);
      // Continue with local storage
    }
  },

  async markHabitComplete(userId: string, habitId: string): Promise<void> {
    const habits = await this.getLocalHabits();
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId && !habit.completedDates.includes(today)) {
        const newHabit = {
          ...habit,
          completedDates: [...habit.completedDates, today].sort(),
          updated_at: now
        };
        
        // Update in Supabase
        supabase
          .from('habits')
          .update(this.toDBHabit(newHabit))
          .eq('id', habitId)
          .eq('user_id', userId)
          .then(({ error }) => {
            if (error) console.error('Failed to update habit in Supabase:', error);
          });

        return newHabit;
      }
      return habit;
    });

    await this.saveLocalHabits(updatedHabits);
  },

  async unmarkHabitComplete(userId: string, habitId: string): Promise<void> {
    const habits = await this.getLocalHabits();
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        const newHabit = {
          ...habit,
          completedDates: habit.completedDates.filter(date => date !== today),
          updated_at: now
        };

        // Update in Supabase
        supabase
          .from('habits')
          .update(this.toDBHabit(newHabit))
          .eq('id', habitId)
          .eq('user_id', userId)
          .then(({ error }) => {
            if (error) console.error('Failed to update habit in Supabase:', error);
          });

        return newHabit;
      }
      return habit;
    });

    await this.saveLocalHabits(updatedHabits);
  },

  async deleteHabit(userId: string, habitId: string): Promise<void> {
    const habits = await this.getLocalHabits();
    const updatedHabits = habits.filter(habit => habit.id !== habitId);
    
    await this.saveLocalHabits(updatedHabits);
    
    // Delete from Supabase
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', habitId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Failed to delete habit from Supabase:', error);
    }
  },

  // Setup periodic sync
  setupPeriodicSync(userId: string): void {
    setInterval(() => {
      this.syncWithSupabase(userId).catch(console.error);
    }, SYNC_INTERVAL);
  }
}; 
import { supabase } from '@/lib/supabase';
import { Habit, HabitFormData, HabitWithCompletedDates } from '@/types/habit';

export class HabitService {
  static async createHabit(userId: string, habitData: HabitFormData): Promise<HabitWithCompletedDates> {
    const now = new Date().toISOString();
    const newHabit: Omit<Habit, 'completedDates'> = {
      id: crypto.randomUUID(),
      user_id: userId,
      title: habitData.title.trim(),
      description: habitData.description?.trim() || null,
      frequency: habitData.frequency,
      plant_type: habitData.plant_type,
      streak: 0,
      last_completed: null,
      created_at: now,
      updated_at: now
    };

    const { data, error } = await supabase
      .from('habits')
      .insert([newHabit])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating habit:', error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('No data returned from database');
    }

    return {
      ...data,
      completedDates: []
    };
  }

  static async fetchHabits(userId: string): Promise<HabitWithCompletedDates[]> {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching habits:', error);
      throw new Error(error.message);
    }

    return data.map(habit => ({
      ...habit,
      completedDates: []
    }));
  }

  static async toggleHabit(habitId: string, completedDates: string[]): Promise<void> {
    const { error } = await supabase
      .from('habits')
      .update({ 
        streak: completedDates.length,
        updated_at: new Date().toISOString()
      })
      .eq('id', habitId);

    if (error) {
      console.error('Error toggling habit:', error);
      throw new Error(error.message);
    }
  }

  static async deleteHabit(habitId: string): Promise<void> {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', habitId);

    if (error) {
      console.error('Error deleting habit:', error);
      throw new Error(error.message);
    }
  }
} 
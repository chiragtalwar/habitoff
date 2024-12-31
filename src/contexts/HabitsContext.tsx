import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { Habit, HabitWithCompletedDates } from '@/types/habit';
import { habitService } from '@/services/habitService';

interface HabitsContextType {
  habits: HabitWithCompletedDates[];
  isLoading: boolean;
  error: string | null;
  addHabit: (habit: Habit) => Promise<void>;
  updateHabit: (habit: Habit) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  completeHabit: (id: string) => Promise<void>;
}

const HabitsContext = createContext<HabitsContextType | null>(null);

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [habits, setHabits] = useState<HabitWithCompletedDates[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadHabits();
    }
  }, [user]);

  const loadHabits = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform habits to include completedDates
      const transformedHabits = (data || []).map(habit => habitService.toUIHabit(habit));
      setHabits(transformedHabits);
    } catch (err) {
      console.error('Error loading habits:', err);
      setError(err instanceof Error ? err.message : 'Failed to load habits');
    } finally {
      setIsLoading(false);
    }
  };

  const addHabit = async (habit: Habit) => {
    try {
      const { error } = await supabase.from('habits').insert([{
        ...habit,
        last_completed: null,
        streak: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
      
      if (error) throw error;
      
      // Transform the habit to include completedDates before adding to state
      const newHabit = habitService.toUIHabit({
        ...habit,
        last_completed: null,
        streak: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      setHabits([newHabit, ...habits]);
    } catch (err) {
      console.error('Error adding habit:', err);
      throw err;
    }
  };

  const updateHabit = async (habit: Habit) => {
    try {
      const { error } = await supabase
        .from('habits')
        .update({
          title: habit.title,
          description: habit.description,
          frequency: habit.frequency,
          plant_type: habit.plant_type,
          streak: habit.streak,
          updated_at: new Date().toISOString()
        })
        .eq('id', habit.id);

      if (error) throw error;

      setHabits(habits.map(h => h.id === habit.id ? habitService.toUIHabit(habit) : h));
    } catch (err) {
      console.error('Error updating habit:', err);
      throw err;
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setHabits(habits.filter(h => h.id !== id));
    } catch (err) {
      console.error('Error deleting habit:', err);
      throw err;
    }
  };

  const completeHabit = async (id: string) => {
    try {
      const habit = habits.find(h => h.id === id);
      if (!habit) throw new Error('Habit not found');

      const now = new Date().toISOString();
      const updatedHabit = {
        ...habit,
        streak: habit.streak + 1,
        last_completed: now,
        updated_at: now
      };

      const { error } = await supabase
        .from('habits')
        .update({
          streak: updatedHabit.streak,
          last_completed: updatedHabit.last_completed,
          updated_at: updatedHabit.updated_at
        })
        .eq('id', id);

      if (error) throw error;

      // Transform the updated habit before updating state
      const transformedHabit = habitService.toUIHabit(updatedHabit);
      setHabits(habits.map(h => h.id === id ? transformedHabit : h));
    } catch (err) {
      console.error('Error completing habit:', err);
      throw err;
    }
  };

  return (
    <HabitsContext.Provider value={{ 
      habits, 
      isLoading, 
      error, 
      addHabit, 
      updateHabit, 
      deleteHabit,
      completeHabit 
    }}>
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitsContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitsProvider');
  }
  return context;
} 
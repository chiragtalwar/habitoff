import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { HabitWithCompletedDates, CreateHabitInput } from '@/types/habit';
import { supabase } from '@/lib/supabase';

export function useHabits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<HabitWithCompletedDates[]>([]);

  // Initialize from Chrome storage
  useEffect(() => {
    chrome.storage.local.get(['habits'], (result) => {
      if (result.habits) {
        setHabits(result.habits);
      }
    });
  }, []);

  // Fetch from Supabase and update both states
  useEffect(() => {
    if (user?.id) {
      fetchHabits();
    }
  }, [user]);

  const fetchHabits = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const habitsWithDates = data.map(habit => ({
        ...habit,
        completedDates: habit.last_completed ? [habit.last_completed.split('T')[0]] : []
      })) as HabitWithCompletedDates[];

      setHabits(habitsWithDates);
      // Cache in Chrome storage
      chrome.storage.local.set({ habits: habitsWithDates });
    } catch (error) {
      console.error('Error fetching habits:', error);
    }
  };

  const addHabit = async (habitData: CreateHabitInput) => {
    if (!user?.id) {
      throw new Error('No user ID found');
    }

    try {
      const { data, error } = await supabase
        .from('habits')
        .insert([{
          ...habitData,
          id: crypto.randomUUID(),
          user_id: user.id,
          streak: 0,
          last_completed: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      const newHabit = {
        ...data,
        completedDates: []
      } as HabitWithCompletedDates;

      const updatedHabits = [...habits, newHabit];
      setHabits(updatedHabits);
      // Update Chrome storage
      chrome.storage.local.set({ habits: updatedHabits });
      return newHabit;
    } catch (error) {
      console.error('Error creating habit:', error);
      throw error;
    }
  };

  const toggleHabit = async (habitId: string) => {
    try {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      const today = new Date().toISOString().split('T')[0];
      const isCompleted = habit.completedDates.includes(today);
      
      let newCompletedDates: string[];
      let newStreak: number;

      if (isCompleted) {
        newCompletedDates = habit.completedDates.filter(date => date !== today);
        newStreak = Math.max(0, habit.streak - 1);
      } else {
        newCompletedDates = [...habit.completedDates, today];
        
        const sortedDates = [...newCompletedDates].sort();
        let streak = 1;
        for (let i = sortedDates.length - 2; i >= 0; i--) {
          const curr = new Date(sortedDates[i + 1]);
          const prev = new Date(sortedDates[i]);
          const diffDays = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 1) {
            streak++;
          } else {
            break;
          }
        }
        newStreak = streak;
      }

      // Update in Supabase
      const { error } = await supabase
        .from('habits')
        .update({
          last_completed: isCompleted ? null : new Date().toISOString(),
          streak: newStreak,
          updated_at: new Date().toISOString()
        })
        .eq('id', habitId);

      if (error) throw error;

      // Update local state and Chrome storage
      const updatedHabits = habits.map(h => 
        h.id === habitId 
          ? { ...h, completedDates: newCompletedDates, streak: newStreak }
          : h
      );
      setHabits(updatedHabits);
      chrome.storage.local.set({ habits: updatedHabits });
    } catch (error) {
      console.error('Error toggling habit:', error);
      throw error;
    }
  };

  const deleteHabit = async (habitId: string) => {
    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId);

      if (error) throw error;

      const updatedHabits = habits.filter(h => h.id !== habitId);
      setHabits(updatedHabits);
      // Update Chrome storage
      chrome.storage.local.set({ habits: updatedHabits });
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  };

  return {
    habits,
    addHabit,
    toggleHabit,
    deleteHabit,
    fetchHabits
  };
} 
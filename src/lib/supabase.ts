import { createClient } from '@supabase/supabase-js';
import { CreateHabitInput, Habit } from '../types/habit';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Function to check table structure
export async function checkHabitsTable() {
  console.log('Checking habits table structure...');
  console.log('Using URL:', supabaseUrl);
  
  try {
    // First check if we can connect
    const { data: tables, error: listError } = await supabase
      .from('habits')
      .select('*');

    if (listError) {
      console.error('Error accessing table:', listError);
      return { exists: false, error: listError };
    }

    console.log('\nFound habits table with', tables?.length || 0, 'records');
    
    if (tables && tables[0]) {
      console.log('\nTable Structure:');
      Object.entries(tables[0]).forEach(([key, value]) => {
        console.log(`- ${key}: ${typeof value}`);
      });
    }

    return {
      exists: true,
      recordCount: tables?.length || 0,
      columns: tables?.[0] ? Object.keys(tables[0]) : [],
      sample: tables?.[0]
    };

  } catch (error) {
    console.error('Error checking table:', error);
    return { exists: false, error };
  }
}

// Function to add a new habit
export async function addHabit(habit: CreateHabitInput, userId: string): Promise<Habit | null> {
  const { data, error } = await supabase
    .from('habits')
    .insert([
      {
        ...habit,
        user_id: userId,
        streak: 0,
        last_completed: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding habit:', error);
    return null;
  }

  return data;
}

// Function to add sample habits
export async function addSampleHabits() {
  // First get the current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('No user logged in');
    return;
  }

  const samples = [
    {
      title: 'Daily Meditation',
      description: 'Practice mindfulness for 10 minutes',
      frequency: 'daily',
      animal_type: 'dog'
    },
    {
      title: 'Weekly Exercise',
      description: 'Go for a 30-minute run',
      frequency: 'weekly',
      animal_type: 'dog'

    },

    {
      title: 'Read Books',
      description: 'Read for 20 minutes',
      frequency: 'daily',
      animal_type: 'dog'

    }
  ] as CreateHabitInput[];

  console.log('Adding sample habits...');
  
  for (const habit of samples) {
    const result = await addHabit(habit, user.id);
    if (result) {
      console.log('Added habit:', result.title);
    }
  }
} 
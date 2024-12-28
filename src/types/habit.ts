export type HabitFrequency = 'daily' | 'weekly' | 'monthly';
export type PlantType = 'flower' | 'tree' | 'succulent' | 'herb';

export interface HabitFormData {
  title: string;
  description: string | null;
  frequency: HabitFrequency;
  plant_type: PlantType;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  frequency: HabitFrequency;
  plant_type: PlantType;
  streak: number;
  last_completed: string | null;
  created_at: string;
  updated_at: string;
}

export interface HabitWithCompletedDates extends Habit {
  completedDates: string[];
} 
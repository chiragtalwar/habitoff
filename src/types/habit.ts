export type Frequency = 'daily' | 'weekly' | 'monthly';
export type HabitFrequency = Frequency; // For backward compatibility
export type PlantType = 'flower' | 'tree' | 'succulent' | 'herb';

// Date string in YYYY-MM-DD format
export type DateString = string;

// Database model - exactly matching Supabase
export interface Habit {
  id: string;                              // uuid, NOT NULL
  user_id: string;                         // uuid, NOT NULL
  title: string;                           // text, NOT NULL
  description: string | null;              // text, NULL allowed
  frequency: Frequency;                    // text, NOT NULL
  plant_type: PlantType;                  // text, NOT NULL
  streak: number;                          // integer, NOT NULL, default 0
  last_completed: string | null;           // timestamp with time zone, NULL allowed
  created_at: string;                      // timestamp with time zone, NOT NULL, default now()
  updated_at: string;                      // timestamp with time zone, NOT NULL, default now()
}

// Form data for creating a new habit
export interface HabitFormData {
  title: string;
  description: string | null;
  frequency: Frequency;
  plant_type: PlantType;
}

// UI model with completed dates for the grid/timeline
export interface HabitWithCompletedDates extends Omit<Habit, 'last_completed'> {
  last_completed: string | null;
  completedDates: DateString[]; // Array of YYYY-MM-DD dates
  currentStreak?: number;   // Optional current streak
  longestStreak?: number;  // Optional longest streak
}

// Alias for backward compatibility
export type CreateHabitInput = HabitFormData;

export interface HabitStats {
  total: number;
  completed: number;
  streak: number;
  longestStreak: number;
} 
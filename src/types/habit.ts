// Basic types
export type Frequency = 'daily' | 'weekly' | 'monthly';
export type HabitFrequency = Frequency; // For backward compatibility
export type PlantType = 'flower' | 'tree' | 'succulent' | 'herb';
export type AnimalType = 'lion' | 'dog' | 'elephant';
export type AnimalStage = 'baby' | 'growing' | 'achieved';
export type DateString = string;

// Core habit interface
export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  frequency: Frequency;
  plant_type: PlantType;
  streak: number;
  last_completed: string | null;
  created_at: string;
  updated_at: string;
  animal_type: AnimalType;
}

// Form data for creating a new habit
export interface HabitFormData {
  title: string;
  description: string | null;
  frequency: HabitFrequency;
  animal_type: AnimalType;
}

// UI model with completed dates
export interface HabitWithCompletedDates extends Habit {
  completedDates: DateString[];
  currentStreak: number;
  longestStreak: number;
  pendingOperations: HabitOperation[];
  isOffline: boolean;
  animal?: AnimalCompanion;
}

export interface HabitStats {
  total: number;
  completed: number;
  streak: number;
  longestStreak: number;
}

export interface AnimalCompanion {
  type: AnimalType;
  stage: AnimalStage;
  streakRequired: {
    growing: number;
    achieved: number;
  };
}

// Operation types for offline support
export type OperationType = 'MARK' | 'UNMARK' | 'ADD' | 'DELETE' | 'UPDATE';
export type OperationStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export interface HabitOperation {
  type: OperationType;
  habitId: string;
  data: Record<string, any>;
  status: OperationStatus;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface HabitStore {
  version: number;
  lastSynced: string | null;
  habits: Map<string, HabitWithCompletedDates>;
  operationQueue: HabitOperation[];
}

export interface SyncResult {
  success: boolean;
  error?: Error;
  timestamp: string;
}

// Aliases for backward compatibility
export type CreateHabitInput = HabitFormData; 
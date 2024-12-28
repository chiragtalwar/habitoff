export type PlantType = 'flower' | 'tree' | 'bush' | 'vine';

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  frequency: 'daily' | 'weekly' | 'monthly';
  plant_type: PlantType;
  streak: number;
  created_at: string;
  updated_at: string;
}

export const FREQUENCIES = ['daily', 'weekly', 'monthly'] as const; 
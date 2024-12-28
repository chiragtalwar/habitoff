import { PlantType } from './habit';

export const PLANT_TYPES: PlantType[] = ['flower', 'tree', 'succulent', 'herb'];

export interface PlantStage {
  stage: 'seed' | 'sprout' | 'growing' | 'blooming';
  progress: number; // 0-100    
} 
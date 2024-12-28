import { PlantType } from './habit';

export const PLANT_TYPES: PlantType[] = ['flower', 'tree', 'bush', 'vine'];

export interface PlantStage {
  stage: 'seed' | 'sprout' | 'growing' | 'blooming';
  progress: number; // 0-100
} 
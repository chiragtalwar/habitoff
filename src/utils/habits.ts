export function getPlantStage(streak: number): 'seed' | 'sprout' | 'growing' | 'blooming' {
  if (streak < 3) return 'seed';
  if (streak < 7) return 'sprout';
  if (streak < 14) return 'growing';
  return 'blooming';
} 
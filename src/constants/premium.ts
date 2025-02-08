export const PREMIUM_FEATURES = {
  // Habit Limits
  FREE_HABITS_LIMIT: 3,

  // Animal Types
  ANIMAL_TYPES: {
    FREE: ['lion'] as const,
    PREMIUM: ['dog', 'elephant'] as const
  },

  // Plant Types
  PLANT_TYPES: {
    FREE: ['flower', 'tree'] as const,
    PREMIUM: ['succulent', 'herb', 'bonsai', 'vine'] as const
  },

  // Analytics Features
  ANALYTICS: {
    FREE: ['basic-stats', 'current-streak'] as const,
    PREMIUM: [
      'advanced-stats',
      'habit-heatmap', 
      'success-rate', 
      'best-time-analysis',
      'habit-correlations',
      'mood-tracking'
    ] as const
  },

  // UI Features
  UI: {
    FREE: ['light-theme', 'dark-theme'] as const,
    PREMIUM: ['custom-themes', 'animated-backgrounds', 'custom-icons'] as const
  }
} as const;

// Type definitions for premium features
export type AnimalType = typeof PREMIUM_FEATURES.ANIMAL_TYPES.FREE[number] | typeof PREMIUM_FEATURES.ANIMAL_TYPES.PREMIUM[number];
export type PlantType = typeof PREMIUM_FEATURES.PLANT_TYPES.FREE[number] | typeof PREMIUM_FEATURES.PLANT_TYPES.PREMIUM[number];
export type AnalyticsFeature = typeof PREMIUM_FEATURES.ANALYTICS.FREE[number] | typeof PREMIUM_FEATURES.ANALYTICS.PREMIUM[number];
export type UIFeature = typeof PREMIUM_FEATURES.UI.FREE[number] | typeof PREMIUM_FEATURES.UI.PREMIUM[number];

// Helper to check if a feature requires premium
export const isPremiumFeature = {
  animalType: (type: AnimalType) => PREMIUM_FEATURES.ANIMAL_TYPES.PREMIUM.includes(type as any),
  plantType: (type: PlantType) => PREMIUM_FEATURES.PLANT_TYPES.PREMIUM.includes(type as any),
  analytics: (feature: AnalyticsFeature) => PREMIUM_FEATURES.ANALYTICS.PREMIUM.includes(feature as any),
  ui: (feature: UIFeature) => PREMIUM_FEATURES.UI.PREMIUM.includes(feature as any)
}; 
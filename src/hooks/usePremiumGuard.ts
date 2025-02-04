import { useCallback } from 'react';
import { useSubscription } from './useSubscription';
import { useHabits } from './useHabits';
import { PREMIUM_FEATURES, PlantType, AnalyticsFeature, UIFeature } from '../constants/premium';

interface PremiumGuardReturn {
  isPremium: boolean;
  canAddHabit: () => boolean;
  canUsePlantType: (plantType: PlantType) => boolean;
  canAccessAnalytics: (feature: AnalyticsFeature) => boolean;
  canAccessUIFeature: (feature: UIFeature) => boolean;
  showUpgradeModal: boolean;
  remainingFreeHabits: number;
}

export function usePremiumGuard(): PremiumGuardReturn {
  const { subscription } = useSubscription();
  const { habits } = useHabits();
  
  const isPremium = subscription?.status === 'active' || subscription?.status === 'trialing';

  // Check if user can add more habits
  const canAddHabit = useCallback(() => {
    if (isPremium) return true;
    return (habits?.length || 0) < PREMIUM_FEATURES.FREE_HABITS_LIMIT;
  }, [habits?.length, isPremium]);

  // Check if user can use a specific plant type
  const canUsePlantType = useCallback((plantType: PlantType) => {
    if (isPremium) return true;
    return PREMIUM_FEATURES.PLANT_TYPES.FREE.includes(plantType as any);
  }, [isPremium]);

  // Check if user can access specific analytics feature
  const canAccessAnalytics = useCallback((feature: AnalyticsFeature) => {
    if (isPremium) return true;
    return PREMIUM_FEATURES.ANALYTICS.FREE.includes(feature as any);
  }, [isPremium]);

  // Check if user can access specific UI feature
  const canAccessUIFeature = useCallback((feature: UIFeature) => {
    if (isPremium) return true;
    return PREMIUM_FEATURES.UI.FREE.includes(feature as any);
  }, [isPremium]);

  // Calculate remaining free habits
  const remainingFreeHabits = Math.max(0, PREMIUM_FEATURES.FREE_HABITS_LIMIT - (habits?.length || 0));

  return {
    isPremium,
    canAddHabit,
    canUsePlantType,
    canAccessAnalytics,
    canAccessUIFeature,
    showUpgradeModal: !isPremium,
    remainingFreeHabits
  };
} 
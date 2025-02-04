import React from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { differenceInDays, format } from 'date-fns';
import { motion } from 'framer-motion';
import type { PlanType } from '../../types/subscription';

export const PremiumStatusButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { subscription } = useSubscription();

  // Calculate days remaining if in trial
  const daysRemaining = subscription?.trial_end 
    ? differenceInDays(new Date(subscription.trial_end), new Date())
    : 0;

  // Determine button content based on subscription status
  const getButtonContent = () => {
    if (subscription?.status === 'active') {
      // Handle lifetime membership
      if ((subscription.plan_type as PlanType) === 'lifetime') {
        return (
          <>
            <span className="text-yellow-400">⭐</span>
            <span className="ml-2">Lifetime Member</span>
            <span className="ml-2 text-emerald-400/80">· Forever</span>
          </>
        );
      }
      
      // Only show renewal date for monthly subscriptions
      const expiryDate = subscription.current_period_end && 
        (subscription.plan_type as PlanType) === 'premium'
        ? format(new Date(subscription.current_period_end), 'MMM d')
        : null;

      return (
        <>
          <span className="text-yellow-400">⭐</span>
          <span className="ml-2">Building Better Habits</span>
          {expiryDate && (
            <span className="ml-2 text-emerald-400/80">
              · Renews {expiryDate}
            </span>
          )}
        </>
      );
    }

    if (subscription?.status === 'trialing') {
      if (daysRemaining <= 5) {
        return (
          <>
            <span className="text-yellow-400">⭐</span>
            <span className="ml-2">
              {daysRemaining} Days Left · Keep Your Progress
            </span>
          </>
        );
      }
      return (
        <>
          <span className="text-yellow-400">⭐</span>
          <span className="ml-2">
            {daysRemaining} Days to Build Your Habits
          </span>
        </>
      );
    }

    return (
      <>
        <span className="text-yellow-400">⭐</span>
        <span className="ml-2">Become Your Best Self</span>
      </>
    );
  };

  const handleClick = (e: React.MouseEvent) => {
    // If user is already on lifetime plan, don't do anything
    if (subscription?.status === 'active' && 
        (subscription.plan_type as PlanType) === 'lifetime') {
      e.preventDefault();
      return;
    }
    
    onClick();
  };

  const isLifetime = subscription?.status === 'active' && 
    (subscription.plan_type as PlanType) === 'lifetime';

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        fixed bottom-4 left-4 z-50 
        flex items-center px-4 py-2.5
        ${subscription?.status === 'active' 
          ? 'bg-[#1a2e29] hover:bg-[#1f3731]' 
          : subscription?.status === 'trialing'
          ? 'bg-[#1a1a2e] hover:bg-[#1f1f35]'
          : 'bg-black/80 hover:bg-black/90'} 
        backdrop-blur-md
        rounded-full shadow-lg 
        text-sm font-medium text-white
        transition-all duration-200
        border border-white/[0.08]
        ${isLifetime ? 'cursor-default' : 'cursor-pointer'}
      `}
    >
      {getButtonContent()}
    </motion.button>
  );
}; 
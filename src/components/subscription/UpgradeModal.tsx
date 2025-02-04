import React from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface PlanFeature {
  icon: string;
  text: string;
}

interface Plan {
  type: 'free' | 'monthly' | 'lifetime';
  title: string;
  price: string;
  originalPrice?: string;
  billingPeriod: string;
  features: PlanFeature[];
  highlight?: boolean;
  savings?: string;
  productId: string;
}

const PLANS: Plan[] = [
  {
    type: 'free',
    title: 'Free Plan',
    price: '$0',
    billingPeriod: 'forever',
    productId: '',
    features: [
      { icon: '🌱', text: 'Up to 3 Habits' },
      { icon: '🌿', text: 'Basic Plant Types' },
      { icon: '📈', text: 'Basic Statistics' },
      { icon: '🎨', text: 'Default Theme' }
    ]
  },
  {
    type: 'monthly',
    title: 'Premium Monthly',
    price: '$1',
    billingPeriod: 'per month',
    productId: 'pdt_H4Plpv4la5wtdzU0XZTgk',
    features: [
      { icon: '🌱', text: 'Unlimited Habits' },
      { icon: '🌺', text: 'All Plant Types' },
      { icon: '📊', text: 'Advanced Analytics' },
      { icon: '🎨', text: 'Custom Themes' }
    ]
  },
  {
    type: 'lifetime',
    title: 'Lifetime Access',
    price: '$4.99',
    originalPrice: '$24.99',
    billingPeriod: 'one-time',
    highlight: true,
    savings: 'Save 80%',
    productId: 'pdt_gUut7yIhw8NffnEkF9cqW',
    features: [
      { icon: '∞', text: 'Everything in Premium' },
      { icon: '💝', text: 'One-time Payment' },
      { icon: '🚀', text: 'Lifetime Updates' },
      { icon: '🎯', text: 'Priority Support' },
      { icon: '🎁', text: 'Early Access to Features' }
    ]
  }
];

export const UpgradeModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { loading } = useSubscription();
  const { user, isAuthenticated } = useAuth();
  const [error, setError] = React.useState<string | null>(null);

  const handlePlanSelect = async (plan: Plan) => {
    try {
      if (plan.type === 'free') {
        return;
      }

      setError(null);

      if (!isAuthenticated || !user?.email) {
        console.error('No user session found');
        setError('Please log in to continue');
        return;
      }

      const baseUrl = 'https://test.checkout.dodopayments.com';
      const url = `${baseUrl}/buy/${plan.productId}`;

      // Add required query parameters
      const params = new URLSearchParams({
        quantity: '1',
        customer_email: user.email,
        metadata: JSON.stringify({
          userId: user.id
        })
      });

      // Redirect to the appropriate payment page with query parameters
      window.location.href = `${url}?${params.toString()}`;
    } catch (err) {
      console.error('Failed to start subscription:', err);
      setError('Something went wrong. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0, 0, 0, 0.7)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-[1000px] mx-auto"
        >
          <div className="relative bg-[#121212] rounded-2xl overflow-hidden">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 text-white/60 hover:text-white"
            >
              ✕
            </button>

            {/* Modal content */}
            <div className="p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-white mb-1">
                  Habits for the 1%
                </h2>
                {error && (
                  <p className="text-red-500 text-sm mt-2">{error}</p>
                )}
              </div>

              {/* Plans grid - now with 3 columns */}
              <div className="grid grid-cols-3 gap-4">
                {PLANS.map((plan) => (
                  <motion.div
                    key={plan.type}
                    className={cn(
                      "relative px-5 py-6 rounded-xl border border-white/[0.08] flex flex-col",
                      plan.highlight
                        ? "bg-[#1a2e29] shadow-lg shadow-emerald-950/20"
                        : plan.type === 'free'
                        ? "bg-[#1a1a1a]/50"
                        : "bg-[#202020] shadow-lg shadow-black/10"
                    )}
                  >
                    {plan.highlight && (
                      <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2">
                        <span className="bg-emerald-500 px-3 py-1 rounded-full text-xs font-medium text-white shadow-lg shadow-emerald-950/30">
                          Best Value
                        </span>
                      </div>
                    )}

                    <div className="flex-1">
                      {/* Plan header */}
                      <div className="text-center mb-6">
                        <h3 className="text-base font-semibold text-white mb-4">{plan.title}</h3>
                        <div className="flex items-center justify-center gap-2 mb-1">
                          {plan.originalPrice && (
                            <span className="line-through text-white/40 text-sm">
                              {plan.originalPrice}
                            </span>
                          )}
                          <span className={cn(
                            "text-3xl font-bold",
                            plan.highlight 
                              ? "text-white" 
                              : plan.type === 'free'
                              ? "text-white/60"
                              : "text-emerald-400"
                          )}>
                            {plan.price}
                          </span>
                        </div>
                        <p className="text-white/50 text-xs">{plan.billingPeriod}</p>
                        {plan.savings && (
                          <span className="text-emerald-400 text-xs font-medium mt-1.5 block">
                            {plan.savings}
                          </span>
                        )}
                      </div>

                      {/* Features list */}
                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-3"
                          >
                            <span className={cn(
                              "flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full",
                              plan.highlight 
                                ? "bg-emerald-500/10"
                                : plan.type === 'free'
                                ? "bg-white/5"
                                : "bg-emerald-500/5"
                            )}>
                              {feature.icon}
                            </span>
                            <span className={cn(
                              "text-sm",
                              plan.type === 'free' ? "text-white/70" : "text-white/90"
                            )}>
                              {feature.text}
                            </span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    {/* Action button */}
                    <button
                      onClick={() => handlePlanSelect(plan)}
                      className={cn(
                        "w-full py-2.5 rounded-lg font-medium text-sm transition-all duration-200 mt-6",
                        plan.highlight
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-950/30"
                          : plan.type === 'free'
                          ? "bg-[#2a2a2a] text-white/60 cursor-default"
                          : "bg-[#2a2a2a] hover:bg-[#333] text-white"
                      )}
                      disabled={plan.type === 'free'}
                    >
                      <span className="inline-block py-0.5">
                        {loading
                          ? "Processing..."
                          : plan.type === 'free'
                          ? "Current Plan"
                          : plan.type === 'lifetime'
                          ? "Get Lifetime Access"
                          : "Start Monthly Plan"}
                      </span>
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 
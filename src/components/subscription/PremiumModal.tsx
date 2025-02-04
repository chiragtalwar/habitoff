import React from 'react';
import { useSubscription } from '../../hooks/useSubscription';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose }) => {
  const { startSubscription, loading, error } = useSubscription();

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    try {
      await startSubscription();
    } catch (err) {
      console.error('Failed to start subscription:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4 text-center">Upgrade to Premium</h2>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Unlimited habits</span>
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Advanced analytics</span>
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Special plant varieties</span>
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Priority support</span>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm mb-4 text-center">
            {error.message}
          </div>
        )}

        <div className="flex flex-col space-y-3">
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Upgrade Now - $1/month'}
          </button>
          <button
            onClick={onClose}
            className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 px-4"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}; 
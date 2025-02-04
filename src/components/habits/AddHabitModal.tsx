import React from 'react';
import { useForm } from 'react-hook-form';
import { HabitFormData } from '../../types/habit';
import { usePremiumGuard } from '../../hooks/usePremiumGuard';
import { PREMIUM_FEATURES, PlantType } from '../../constants/premium';
import { PremiumModal } from '../subscription/PremiumModal';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: HabitFormData) => Promise<void>;
}

export const AddHabitModal: React.FC<AddHabitModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<HabitFormData>();
  const { canAddHabit, canUsePlantType, remainingFreeHabits, isPremium } = usePremiumGuard();
  const [showPremiumModal, setShowPremiumModal] = React.useState(false);

  const handleFormSubmit = async (data: HabitFormData) => {
    if (!canAddHabit()) {
      setShowPremiumModal(true);
      return;
    }

    if (!canUsePlantType(data.plant_type)) {
      setShowPremiumModal(true);
      return;
    }

    await onSubmit(data);
    onClose();
  };

  if (!isOpen) return null;

  const allPlantTypes = [
    ...PREMIUM_FEATURES.PLANT_TYPES.FREE,
    ...PREMIUM_FEATURES.PLANT_TYPES.PREMIUM
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold mb-4">Add New Habit</h2>
          
          {!isPremium && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-200">
                {remainingFreeHabits > 0
                  ? `You have ${remainingFreeHabits} free habit${remainingFreeHabits === 1 ? '' : 's'} remaining`
                  : "You've reached the free habit limit. Upgrade to add more!"}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Habit Name
              </label>
              <input
                {...register('title', { required: 'Title is required' })}
                className="w-full p-2 border rounded-lg"
                placeholder="e.g., Morning Meditation"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description (Optional)
              </label>
              <textarea
                {...register('description')}
                className="w-full p-2 border rounded-lg"
                placeholder="e.g., 10 minutes of mindfulness"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Frequency
              </label>
              <select
                {...register('frequency', { required: 'Frequency is required' })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              {errors.frequency && (
                <p className="text-red-500 text-sm mt-1">{errors.frequency.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Plant Type
              </label>
              <select
                {...register('plant_type', { required: 'Plant type is required' })}
                className="w-full p-2 border rounded-lg"
              >
                {allPlantTypes.map((type) => (
                  <option 
                    key={type} 
                    value={type}
                    disabled={!isPremium && !canUsePlantType(type as PlantType)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                    {!isPremium && !canUsePlantType(type as PlantType) ? ' (Premium)' : ''}
                  </option>
                ))}
              </select>
              {errors.plant_type && (
                <p className="text-red-500 text-sm mt-1">{errors.plant_type.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                disabled={!canAddHabit()}
              >
                {canAddHabit() ? 'Create Habit' : 'Upgrade to Add More'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </>
  );
}; 

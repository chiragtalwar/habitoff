import React from 'react';
import { useForm } from 'react-hook-form';
import { HabitFormData } from '../../types/habit';
import { usePremiumGuard } from '../../hooks/usePremiumGuard';
import { PREMIUM_FEATURES, AnimalType } from '../../constants/premium';
import { PremiumModal } from '../subscription/PremiumModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';


interface AddHabitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: HabitFormData) => Promise<void>;
}

export function AddHabitModal({ open, onOpenChange, onSubmit }: AddHabitModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<HabitFormData>();
    const { canAddHabit, canUseAnimalType, remainingFreeHabits, isPremium } = usePremiumGuard();
  const [showPremiumModal, setShowPremiumModal] = React.useState(false);

  const onSubmitForm = async (data: HabitFormData) => {
    if (!canAddHabit()) {
      setShowPremiumModal(true);
      return;
    }

    if (!canUseAnimalType(data.animal_type as AnimalType)) {
      setShowPremiumModal(true);
      return;
    }

    try {
      await onSubmit(data);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create habit:', error);
    }
  };

  if (!open) return null;

  const allAnimalTypes = [
    ...PREMIUM_FEATURES.ANIMAL_TYPES.FREE,
    ...PREMIUM_FEATURES.ANIMAL_TYPES.PREMIUM
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Habit</DialogTitle>
            <DialogDescription>
              Add a new habit to track. Choose your companion wisely!
            </DialogDescription>
          </DialogHeader>

          {!isPremium && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-200">
                {remainingFreeHabits > 0
                  ? `You have ${remainingFreeHabits} free habit${remainingFreeHabits === 1 ? '' : 's'} remaining`
                  : "You've reached the free habit limit. Upgrade to add more!"}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...register('title', { required: 'Title is required' })}
                placeholder="e.g., Morning Meditation"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="What's your goal?"
              />
            </div>

            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select {...register('frequency', { required: 'Frequency is required' })}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </Select>
              {errors.frequency && (
                <p className="text-red-500 text-sm mt-1">{errors.frequency.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="animal_type">Choose Your Companion</Label>
              <Select {...register('animal_type', { required: 'Companion is required' })}>
                {allAnimalTypes.map((type) => (
                  <option 
                    key={type} 
                    value={type}
                    disabled={!isPremium && !canUseAnimalType(type as AnimalType)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                    {!isPremium && !canUseAnimalType(type as AnimalType) ? ' (Premium)' : ''}
                  </option>
                ))}
              </Select>
              {errors.animal_type && (
                <p className="text-red-500 text-sm mt-1">{errors.animal_type.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={!canAddHabit()}>
                {canAddHabit() ? 'Create Habit' : 'Upgrade to Add More'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </>
  );
} 

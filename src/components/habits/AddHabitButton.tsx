import { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Habit, PlantType } from '@/types/habit';
import { PLANT_TYPES } from '@/types/plants';
import { useAuth } from '@/contexts/AuthContext';

interface AddHabitButtonProps {
  onAdd: (habit: Habit) => Promise<void>;
}

interface FormData {
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  plant_type: PlantType;
}

export function AddHabitButton({ onAdd }: AddHabitButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    frequency: 'daily',
    plant_type: 'flower',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated || !user) {
      setError('You must be logged in to create habits');
      return;
    }

    if (!formData.title.trim()) {
      setError('Habit name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const habit: Habit = {
        id: crypto.randomUUID(),
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        frequency: formData.frequency,
        plant_type: formData.plant_type,
        streak: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      console.log('Creating habit:', habit);
      await onAdd(habit);
      
      setIsOpen(false);
      setFormData({
        title: '',
        description: '',
        frequency: 'daily',
        plant_type: 'flower',
      });
    } catch (err) {
      console.error('Error creating habit:', err);
      setError(err instanceof Error ? err.message : 'Failed to create habit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-sm"
      >
        Add Habit
      </button>

      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create New Habit">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Habit Name
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              rows={2}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
              Frequency
            </label>
            <select
              id="frequency"
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value as 'daily' | 'weekly' | 'monthly' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              disabled={isSubmitting}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Plant Type</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {PLANT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, plant_type: type })}
                  className={`p-3 text-center rounded-lg border ${
                    formData.plant_type === type
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-200'
                  }`}
                  disabled={isSubmitting}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Habit'
              )}
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
} 
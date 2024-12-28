import { useState } from 'react';
import { Habit } from '@/types/habit';
import { getPlantStage } from '@/utils/habits';
import { useHabits } from '@/contexts/HabitsContext';
import { Dialog } from '@/components/ui/Dialog';

interface HabitCardProps {
  habit: Habit;
}

export function HabitCard({ habit }: HabitCardProps) {
  const { completeHabit, deleteHabit } = useHabits();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const stage = getPlantStage(habit.streak);

  const handleComplete = async () => {
    try {
      await completeHabit(habit.id);
    } catch (error) {
      console.error('Failed to complete habit:', error);
      // TODO: Add toast notification
    }
  };

  const handleDelete = async () => {
    try {
      await deleteHabit(habit.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete habit:', error);
      // TODO: Add toast notification
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          {/* Plant Visualization */}
          <div className="w-full aspect-square bg-green-50 rounded-lg mb-4 flex items-center justify-center">
            <PlantIcon type={habit.plant_type} stage={stage} />
          </div>

          {/* Habit Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">{habit.title}</h3>
            {habit.description && (
              <p className="text-sm text-gray-500">{habit.description}</p>
            )}
            
            {/* Streak Info */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-orange-600">🔥 {habit.streak} day streak</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">{habit.frequency}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center gap-2">
            <button 
              onClick={handleComplete}
              className="flex-1 px-4 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
            >
              Complete
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                ⋮
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete Habit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        isOpen={showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Habit"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this habit? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

// Temporary placeholder for plant visualization
function PlantIcon({ type, stage }: { type: Habit['plant_type']; stage: string }) {
  // Use type and stage to determine which emoji to show
  const emoji = (() => {
    switch (stage) {
      case 'seed':
        return '🌱';
      case 'sprout':
        return type === 'flower' ? '🌸' : '🌿';
      case 'growing':
        return type === 'flower' ? '🌺' : '🌳';
      case 'blooming':
        return type === 'flower' ? '🌻' : '🌲';
      default:
        return '🌱';
    }
  })();

  return (
    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center">
      <span className="text-3xl">{emoji}</span>
    </div>
  );
} 
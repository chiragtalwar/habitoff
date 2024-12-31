import { useState } from 'react';
import { HabitWithCompletedDates } from '@/types/habit';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Trash2, Check } from 'lucide-react';
import { getPlantStage } from '@/utils/habits';

interface HabitCardProps {
  habit: HabitWithCompletedDates;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export function HabitCard({ habit, onDelete, onToggle }: HabitCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const stage = getPlantStage(habit.streak);

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
      <div className="relative p-6 bg-green-900/90 backdrop-blur-lg rounded-lg border border-green-700/90">
        {/* Plant Visualization */}
        <div className="w-full aspect-square bg-green-800/50 rounded-lg mb-4 flex items-center justify-center">
          <PlantIcon type={habit.plant_type} stage={stage} />
        </div>

        {/* Habit Info */}
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-white">{habit.title}</h3>
              {habit.description && (
                <p className="mt-1 text-sm text-emerald-300/80">{habit.description}</p>
              )}
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-white/40 hover:text-white/70 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          {/* Streak Info */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-orange-400">🔥 {habit.streak} day streak</span>
            <span className="text-white/40">•</span>
            <span className="text-emerald-300/60 capitalize">{habit.frequency}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          <button 
            onClick={() => onToggle(habit.id)}
            className="flex-1 px-4 py-2 bg-green-800/50 text-emerald-300 rounded-md hover:bg-green-700/50 transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Complete
          </button>
        </div>
      </div>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Habit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete "{habit.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(habit.id);
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 text-sm text-white bg-red-500 rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Plant visualization
function PlantIcon({ type, stage }: { type: HabitWithCompletedDates['plant_type']; stage: string }) {
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
    <div className="w-24 h-24 bg-green-800/30 rounded-full flex items-center justify-center">
      <span className="text-3xl">{emoji}</span>
    </div>
  );
} 
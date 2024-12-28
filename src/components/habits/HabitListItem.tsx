import { Habit } from '@/types/habit';
import { getPlantStage } from '@/utils/habits';

interface HabitListItemProps {
  habit: Habit;
}

export function HabitListItem({ habit }: HabitListItemProps) {
  const stage = getPlantStage(habit.streak);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4">
      {/* Plant Icon */}
      <div className="w-16 h-16 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
        <span className="text-2xl">🌱</span>
      </div>

      {/* Habit Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 truncate">{habit.title}</h3>
        {habit.description && (
          <p className="text-sm text-gray-500 truncate">{habit.description}</p>
        )}
        <div className="flex items-center gap-2 text-sm mt-1">
          <span className="text-orange-600">🔥 {habit.streak} day streak</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-500">{habit.frequency}</span>
          <span className="text-gray-400">•</span>
          <span className="text-emerald-600">{stage}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="px-4 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100">
          Complete
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600">
          ⋮
        </button>
      </div>
    </div>
  );
} 
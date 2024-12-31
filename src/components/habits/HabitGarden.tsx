import { useState } from 'react';
import { HabitList } from '@/components/habits/HabitList';
import { HabitGrid } from '@/components/habits/HabitGrid';
import { AddHabitButton } from "@/components/habits/AddHabitButton";
import { useHabits } from '@/hooks/useHabits';

export function HabitGarden() {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const { habits, isLoading, deleteHabit, toggleHabit } = useHabits();

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-lg text-gray-600">Loading your garden...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900">Your Garden</h2>
          <p className="text-sm text-gray-500">Watch your habits grow into beautiful plants</p>
        </div>
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List
            </button>
          </div>
          <AddHabitButton />
        </div>
      </div>

      {/* Content */}
      {habits.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">No habits yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start by adding a new habit to your garden
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <HabitGrid 
          habits={habits} 
          onDeleteHabit={deleteHabit}
          onToggleHabit={toggleHabit}
        />
      ) : (
        <HabitList habits={habits} />
      )}
    </div>
  );
} 
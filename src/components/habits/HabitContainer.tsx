import React, { useEffect, useState } from 'react';
import { Check, Trash2, Flame, ChevronLeft, ChevronRight } from "lucide-react";
import { FallingLeaves } from "@/components/animations/FallingLeaves";
import { HabitWithCompletedDates } from "@/types/habit";
import { EnhancedHabitList } from "./EnhancedHabitList";
import { habitService } from '../../services/habitService';
import { dateUtils } from '../../utils/dateUtils';
import { toast } from 'react-hot-toast';
import { CheckCircle, Circle } from 'lucide-react';
import { cn } from '../../lib/utils';

const PLANT_TYPES: { value: string; emoji: string }[] = [
  { value: 'flower', emoji: '🌸' },
  { value: 'tree', emoji: '🌳' },
  { value: 'succulent', emoji: '🌵' },
  { value: 'herb', emoji: '🌿' }
];

interface HabitContainerProps {
  habits: HabitWithCompletedDates[];
  onDeleteHabit: (id: string) => void;
  onUpdate: () => void;
}

export const HabitContainer: React.FC<HabitContainerProps> = ({ habits, onDeleteHabit, onUpdate }) => {
  const [animatingHabit, setAnimatingHabit] = useState<{ id: string; type: string } | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  
  useEffect(() => {
    setWeekDates(dateUtils.getCurrentWeekDates());
  }, [weekOffset]); // Update week dates when offset changes

  const handlePrevWeek = () => {
    setWeekOffset(prev => prev - 1);
  };

  const handleNextWeek = () => {
    if (weekOffset < 0) {
      setWeekOffset(prev => prev + 1);
    }
  };

  const handleToggleHabit = async (habitId: string) => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      const today = dateUtils.getToday();
      const todayStr = dateUtils.formatDate(today);
      
      if (!dateUtils.isInCurrentWeek(today)) {
        toast.error('You can only mark habits for the current week');
        return;
      }

      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      const isCompleted = habit.completedDates.includes(todayStr);

      if (!isCompleted) {
        setAnimatingHabit({ id: habitId, type: habit.plant_type });
        setTimeout(() => setAnimatingHabit(null), 6000);
      }
      
      if (isCompleted) {
        await habitService.unmarkHabitComplete(habitId);
        toast.success('Habit unmarked for today');
      } else {
        await habitService.markHabitComplete(habitId);
        toast.success('Habit marked as complete!');
      }
      
      onUpdate();
    } catch (error) {
      console.error('Error toggling habit:', error);
      toast.error('Failed to update habit status');
    } finally {
      setIsLoading(false);
    }
  };

  const getWeeklyProgress = (habit: HabitWithCompletedDates, forLastWeek = false) => {
    const startDate = new Date();
    
    // Adjust for weekOffset
    startDate.setDate(startDate.getDate() + (weekOffset * 7));
    if (forLastWeek) {
      startDate.setDate(startDate.getDate() - 7);
    }
    
    // Get the Monday of the week
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() - (startDate.getDay() === 0 ? 6 : startDate.getDay() - 1));
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const completions = habit.completedDates.filter(date => {
      const completionDate = new Date(date);
      return completionDate >= weekStart && completionDate <= weekEnd;
    }).length;

    return completions;
  };

  // Use enhanced view for 3 or more habits
  if (habits.length >= 3) {
    return (
      <>
        <FallingLeaves 
          isAnimating={animatingHabit !== null} 
          plantType={animatingHabit?.type || 'flower'} 
        />
        <EnhancedHabitList 
          habits={habits}
          onToggleHabit={handleToggleHabit}
          onDeleteHabit={onDeleteHabit}
        />
      </>
    );
  }

  // Original garden view for fewer than 3 habits
  return (
    <>
      <FallingLeaves 
        isAnimating={animatingHabit !== null} 
        plantType={animatingHabit?.type || 'flower'} 
      />

      <div className="space-y-3 p-4 animate-fade-in">
        {habits.map((habit) => {
          const plantEmoji = PLANT_TYPES.find(p => p.value === habit.plant_type)?.emoji || '🌱';
          const currentWeekProgress = getWeeklyProgress(habit);
          const lastWeekProgress = getWeeklyProgress(habit, true);
          const progressDiff = currentWeekProgress - lastWeekProgress;
          
          return (
            <div
              key={habit.id}
              className={`group bg-gradient-to-br from-[#043d2d] to-[#085e46] rounded-xl p-4 shadow-lg 
                transition-all duration-300 hover:shadow-xl hover:scale-[1.02]
                relative overflow-hidden
                before:absolute before:inset-0 before:bg-gradient-to-br before:from-emerald-500/10 before:to-transparent 
                before:opacity-0 before:transition-opacity before:duration-300 group-hover:before:opacity-100`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="bg-white/10 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl group-hover:animate-bounce">{plantEmoji}</span>
                  </div>
                  <div className="flex flex-col items-start">
                    <h3 className="text-white font-semibold text-base">{habit.title}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-emerald-400/90 text-xs font-medium">
                        {currentWeekProgress}/7 days
                        {progressDiff !== 0 && (
                          <span className={`ml-1 ${progressDiff > 0 ? 'text-emerald-400/90' : 'text-orange-400/90'}`}>
                            ({progressDiff > 0 ? '+' : ''}{progressDiff} vs last week)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-900/90 to-amber-800/90 px-2.5 py-1.5 rounded-lg border border-amber-500/20 shadow-lg">
                    <span className="text-amber-400 font-bold">{habit.streak}</span>
                    <Flame className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleToggleHabit(habit.id)}
                      disabled={isLoading}
                      className={`group relative p-2 rounded-lg transition-all duration-500 transform 
                        ${habit.completedDates.includes(dateUtils.formatDate(dateUtils.getToday()))
                          ? 'bg-emerald-500 text-white scale-110 hover:bg-emerald-600 hover:scale-105' 
                          : 'bg-white/10 text-white/60 hover:bg-emerald-500/20 hover:text-emerald-300 hover:scale-105'
                        } active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Check className={`w-4 h-4 transition-all duration-500 
                        ${habit.completedDates.includes(dateUtils.formatDate(dateUtils.getToday()))
                          ? 'group-hover:rotate-12 animate-bounce-once' 
                          : 'group-hover:-rotate-12'}`} 
                      />
                    </button>
                    <button
                      onClick={() => onDeleteHabit(habit.id)}
                      className="p-1.5 rounded-lg bg-white/10 text-white/60 hover:bg-red-500/20 hover:text-red-400 
                        transition-all duration-200 transform active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevWeek}
                  className="p-1 rounded-lg bg-white/5 text-white/30 hover:bg-emerald-500/20 hover:text-emerald-300 
                    transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                
                <div className="grid grid-cols-7 gap-2 flex-1">
                  {weekDates.map((date) => {
                    const dateStr = dateUtils.formatDate(date);
                    const isToday = dateUtils.isSameDay(date, dateUtils.getToday());
                    const isInCurrentWeek = dateUtils.isInCurrentWeek(date);
                    const isCompleted = habit.completedDates.includes(dateStr);
                    
                    return (
                      <div
                        key={dateStr}
                        className={cn(
                          'flex items-center justify-center p-2 rounded-lg transition-all',
                          isToday && 'bg-primary/10',
                          !isInCurrentWeek && 'opacity-50 cursor-not-allowed',
                          isCompleted && 'text-green-500'
                        )}
                        onClick={isInCurrentWeek ? () => handleToggleHabit(habit.id) : undefined}
                        style={{ cursor: isInCurrentWeek ? 'pointer' : 'not-allowed' }}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <div className="text-sm font-medium">
                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                          <div className="text-xs">
                            {date.getDate()}
                          </div>
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6" />
                          ) : (
                            <Circle className="w-6 h-6" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleNextWeek}
                  disabled={weekOffset >= 0}
                  className={`p-1 rounded-lg bg-white/5 text-white/30
                    transition-all duration-200 transform hover:scale-105 active:scale-95
                    ${weekOffset >= 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-emerald-500/20 hover:text-emerald-300'}`}
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}; 
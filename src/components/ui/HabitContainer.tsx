import { Check, Trash2, Flame, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { FallingLeaves } from "../animations/FallingLeaves";
import { HabitWithCompletedDates } from "@/types/habit";

const PLANT_TYPES: { value: string; emoji: string }[] = [
  { value: 'flower', emoji: '🌸' },
  { value: 'tree', emoji: '🌳' },
  { value: 'succulent', emoji: '🌵' },
  { value: 'herb', emoji: '🌿' }
];

interface HabitContainerProps {
  habits: HabitWithCompletedDates[];
  onToggleHabit: (id: string) => void;
  onDeleteHabit: (id: string) => void;
}

export const HabitContainer = ({ habits, onToggleHabit, onDeleteHabit }: HabitContainerProps) => {
  const [animatingHabit, setAnimatingHabit] = useState<{ id: string; type: string } | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  
  // Get current date and calculate the week's dates
  const today = new Date();
  const currentDay = today.getDay();
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  // Calculate the start of the week (Monday) with offset
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1) + (weekOffset * 7));

  const handlePrevWeek = () => {
    setWeekOffset(prev => prev - 1);
  };

  const handleNextWeek = () => {
    if (weekOffset < 0) {
      setWeekOffset(prev => prev + 1);
    }
  };

  const handleToggleHabit = async (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const isCompleted = habit.completedDates.includes(new Date().toISOString().split('T')[0]);
    if (!isCompleted) {
      setAnimatingHabit({ id: habitId, type: habit.plant_type });
      setTimeout(() => setAnimatingHabit(null), 6000);
    }
    
    await onToggleHabit(habitId);
  };

  const getWeeklyProgress = (habit: HabitWithCompletedDates, forLastWeek = false) => {
    const today = new Date();
    const startDate = new Date(today);
    
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleHabit(habit.id);
                      }}
                      className={`group relative p-2 rounded-lg transition-all duration-500 transform 
                        ${habit.completedDates.includes(new Date().toISOString().split('T')[0])
                          ? 'bg-emerald-500 text-white scale-110 hover:bg-emerald-600 hover:scale-105' 
                          : 'bg-white/10 text-white/60 hover:bg-emerald-500/20 hover:text-emerald-300 hover:scale-105'
                        } active:scale-95`}
                    >
                      <Check className={`w-4 h-4 transition-all duration-500 
                        ${habit.completedDates.includes(new Date().toISOString().split('T')[0])
                          ? 'group-hover:rotate-12 animate-bounce-once' 
                          : 'group-hover:-rotate-12'}`} 
                      />
                      {/* Success ripple effect */}
                      <span className={`absolute inset-0 rounded-lg transition-all duration-700
                        ${habit.completedDates.includes(new Date().toISOString().split('T')[0])
                          ? 'animate-ripple bg-emerald-400/30'
                          : 'bg-transparent'}`}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteHabit(habit.id);
                      }}
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
                  {days.map((day, index) => {
                    const date = new Date(startOfWeek);
                    date.setDate(startOfWeek.getDate() + index);
                    const dateStr = date.toISOString().split('T')[0];
                    const isToday = date.toDateString() === today.toDateString();
                    const isPast = date < today;
                    const isCompleted = habit.completedDates.includes(dateStr);
                    
                    return (
                      <button
                        key={day}
                        onClick={() => handleToggleHabit(habit.id)}
                        disabled={date > today}
                        className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-all duration-300 relative
                          transform hover:scale-105 active:scale-95
                          ${isToday ? 'bg-emerald-500/20 ring-2 ring-emerald-500/40' : 'hover:bg-white/10'}
                          ${isCompleted ? 'bg-emerald-500/40 text-emerald-200 shadow-lg shadow-emerald-500/20' : ''}
                          ${isPast && !isCompleted ? 'bg-white/10' : ''}
                          ${date > today ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <span className="text-white/80 text-[10px] font-medium">{day}</span>
                        <span className="text-white font-bold text-sm">{date.getDate()}</span>
                      </button>
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
}
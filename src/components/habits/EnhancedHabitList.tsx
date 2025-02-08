import { Check, ChevronLeft, ChevronRight, Crown, Star, Zap, Trash2 } from "lucide-react";
import { useState } from "react";
import { HabitWithCompletedDates, AnimalType } from "@/types/habit";
import { cn } from "@/lib/utils";

// Animal companions based on habit type/time
const ANIMAL_COMPANIONS = {
  lion: {
    stages: {
      baby: { image: '/animals/lion/baby.jpg' },
      growing: { image: '/animals/lion/growing.jpg' },
      achieved: { image: '/animals/lion/achieved.jpg' }
    },
    colors: {
      primary: 'from-amber-600/20 to-amber-900/20',
      accent: 'ring-amber-500/30',
      highlight: 'bg-amber-500/30',
      text: 'text-amber-400'
    },
    icon: Crown
  },
  dog: {
    stages: {
      baby: { image: '/animals/dog/baby.jpg' },
      growing: { image: '/animals/dog/growing.jpg' },
      achieved: { image: '/animals/dog/achieved.jpg' }
    },
    colors: {
      primary: 'from-blue-600/20 to-blue-900/20',
      accent: 'ring-blue-500/30',
      highlight: 'bg-blue-500/30',
      text: 'text-blue-400'
    },
    icon: Star
  },
  elephant: {
    stages: {
      baby: { image: '/animals/elephant/baby.jpg' },
      growing: { image: '/animals/elephant/growing.jpg' },
      achieved: { image: '/animals/elephant/achieved.jpg' }
    },
    colors: {
      primary: 'from-purple-600/20 to-purple-900/20',
      accent: 'ring-purple-500/30',
      highlight: 'bg-purple-500/30',
      text: 'text-purple-400'
    },
    icon: Zap
  }
} as const;

interface EnhancedHabitListProps {
  habits: HabitWithCompletedDates[];
  onToggleHabit: (id: string) => void;
  onDeleteHabit: (id: string) => void;
}

export function EnhancedHabitList({ habits, onToggleHabit, onDeleteHabit }: EnhancedHabitListProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [animatingHabit, setAnimatingHabit] = useState<string | null>(null);
  
  // Get current date and calculate the week's dates
  const today = new Date();
  const todayStr = today.toLocaleDateString('en-CA');
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  
  // Calculate the start of the week (Monday) with offset
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1) + (weekOffset * 7));
  
  // Generate dates for the week
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });

  // Helper to get normalized date string
  const getDateStr = (date: Date) => date.toLocaleDateString('en-CA');

  // Get companion for habit based on its type/title
  const getHabitCompanion = (habit: HabitWithCompletedDates) => {
    return { type: habit.animal_type as AnimalType, companion: ANIMAL_COMPANIONS[habit.animal_type as AnimalType] };
  };

  // Get evolution stage based on streak
  const getEvolutionStage = (streak: number) => {
    if (streak >= 30) return 'achieved';
    if (streak >= 7) return 'growing';
    return 'baby';
  };

  // Handle habit completion with animation
  const handleHabitComplete = async (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    const dateStr = getDateStr(today);
    const isCompleted = habit.completedDates.includes(dateStr);
    
    // Only animate when marking complete, not when unmarking
    if (!isCompleted) {
      setAnimatingHabit(habitId);
      setTimeout(() => setAnimatingHabit(null), 1000);
    }
    
    await onToggleHabit(habitId);
  };

  return (
    <div className="space-y-2 p-4">
      <div className="bg-gradient-to-br from-[#043d2d]/90 to-[#032921]/90 rounded-xl overflow-hidden border border-emerald-900/30 shadow-xl relative">
        {/* Table Header */}
        <div className="grid grid-cols-[200px_repeat(7,60px)] bg-[#032921]/80">
          {/* Habit Column Header */}
          <div className="text-white/80 text-sm font-medium px-4 py-3">Habit</div>

          {/* Day Headers */}
          <div className="col-span-7 relative">
            {/* Navigation Arrows */}
            <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                onClick={() => setWeekOffset(prev => prev - 1)}
                className="p-1 rounded-md hover:bg-emerald-500/10 transition-colors text-white/40"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button
                onClick={() => setWeekOffset(prev => prev + 1)}
                disabled={weekOffset >= 0}
                className="p-1 rounded-md hover:bg-emerald-500/10 transition-colors text-white/40 disabled:opacity-50"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-7">
              {weekDates.map((date, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-[40px] flex flex-col items-center justify-center border-l border-emerald-900/20",
                    date.toDateString() === today.toDateString() 
                      ? "bg-emerald-500/20" 
                      : ""
                  )}
                >
                  <div className="text-[9px] font-medium tracking-wider uppercase text-white/60">{days[i]}</div>
                  <div className={cn(
                    "text-xs font-medium",
                    date.toDateString() === today.toDateString()
                      ? "text-emerald-400"
                      : "text-white/80"
                  )}>{date.getDate()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Habits Grid */}
        <div className="divide-y divide-emerald-900/20">
          {habits.map(habit => {
            const { companion } = getHabitCompanion(habit);
            const evolutionStage = getEvolutionStage(habit.streak);
            const isAnimating = animatingHabit === habit.id;
            
            return (
              <div 
                key={habit.id}
                className={cn(
                  "grid grid-cols-[200px_repeat(7,60px)] items-center transition-all duration-300 group/row",
                  "bg-gradient-to-r from-emerald-900/40 to-emerald-800/20 hover:from-emerald-800/60 hover:to-emerald-700/40",
                  isAnimating && "bg-emerald-700/40"
                )}
              >
                {/* Habit Info */}
                <div className="flex items-center gap-3 px-4 py-2.5 relative">
                  <div className={cn(
                    "w-11 h-11 relative rounded-lg overflow-hidden bg-black/20",
                    `ring-2 ${companion.colors.accent}`,
                    "shadow-lg shadow-black/20",
                    isAnimating && "animate-pulse"
                  )}>
                    <img 
                      src={companion.stages[evolutionStage].image}
                      alt={`${habit.title} - ${evolutionStage} stage`}
                      className={cn(
                        "w-full h-full object-cover transition-all duration-300",
                        isAnimating ? "scale-125" : "group-hover:scale-110"
                      )}
                    />
                    {evolutionStage === 'achieved' && (
                      <div className={cn(
                        "absolute inset-0 flex items-center justify-center",
                        "bg-gradient-to-t from-black/50 to-transparent"
                      )}>
                        <companion.icon className={cn(
                          "w-4 h-4", 
                          companion.colors.text,
                          "animate-bounce"
                        )} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {habit.title}
                    </div>
                    <div className={cn(
                      "text-xs flex items-center gap-1",
                      companion.colors.text,
                      "font-medium"
                    )}>
                      <companion.icon className="w-3 h-3" />
                      <span>Streak: {habit.streak} days</span>
                    </div>
                  </div>
                </div>

                {/* Completion Cells */}
                <div className="col-span-7 grid grid-cols-7">
                  {weekDates.map((date, i) => {
                    const dateStr = getDateStr(date);
                    const isCompleted = habit.completedDates.includes(dateStr);
                    const isToday = dateStr === todayStr;
                    const isPast = date < today;

                    return (
                      <div key={i} className="relative">
                        {i === 0 && (
                          <button
                            onClick={() => onDeleteHabit(habit.id)}
                            className="absolute -left-4 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-red-500/20 hover:text-red-400 transition-all text-white/40 opacity-0 group-hover/row:opacity-100"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => handleHabitComplete(habit.id)}
                          disabled={date > today}
                          className={cn(
                            "w-full h-[40px] flex items-center justify-center transition-all duration-300 border-l border-emerald-900/20",
                            isCompleted 
                              ? "bg-emerald-500/20 hover:bg-emerald-500/30" 
                              : "text-white/60",
                            !isCompleted && isToday && "ring-1 ring-inset ring-emerald-500/20",
                            !isCompleted && isPast && "bg-black/5",
                            date > today ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-500/20",
                            "group relative active:scale-95"
                          )}
                        >
                          {isCompleted ? (
                            <div className="relative flex items-center justify-center">
                              <Check className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-all duration-300" />
                              {/* Success ripple effect */}
                              <div className="absolute inset-0 animate-ping-once opacity-0">
                                <Check className="w-4 h-4 text-emerald-400" />
                              </div>
                              <span className="absolute inset-[-8px] rounded-lg transition-all duration-700 animate-ripple bg-emerald-400/30" />
                            </div>
                          ) : isPast ? (
                            <div className="relative flex items-center justify-center w-4 h-4">
                              <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-emerald-400/40 group-hover:scale-125 transition-all duration-300" />
                              <span className="absolute inset-[-6px] rounded-lg transition-colors duration-300 group-hover:bg-emerald-400/10" />
                            </div>
                          ) : null}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 
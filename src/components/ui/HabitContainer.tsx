import { Check, Trash2, Flame, ChevronLeft, ChevronRight, Crown, Star, Zap } from "lucide-react";
import { useState } from "react";
import { FallingLeaves } from "../animations/FallingLeaves";
import { HabitWithCompletedDates, AnimalType } from "@/types/habit";
import { EnhancedHabitList } from "../habits/EnhancedHabitList";
import { habitService } from "@/services/habitService";
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

// Evolution messages for better user engagement
const EVOLUTION_MESSAGES = {
  baby: {
    start: "Just started! 🌟",
    near: "Almost growing! Keep going! ✨",
    tooltip: (daysLeft: number) => `Complete ${daysLeft} more daily habits to evolve!`
  },
  growing: {
    start: "Getting stronger! 💪",
    near: "Almost there! So close! 🌟",
    tooltip: (daysLeft: number) => `${daysLeft} more days to reach final form!`
  },
  achieved: {
    complete: "Maximum level reached! 👑",
    tooltip: "Legendary status achieved!"
  }
} as const;

// Evolution thresholds
const EVOLUTION_THRESHOLDS = {
  growing: 7,
  achieved: 30
} as const;

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

  // Get companion for habit based on its type
  const getHabitCompanion = (habit: HabitWithCompletedDates) => {
    return { type: habit.animal_type as AnimalType, companion: ANIMAL_COMPANIONS[habit.animal_type as AnimalType] };
  };

  // Get evolution stage based on streak
  const getEvolutionStage = (streak: number) => {
    if (streak >= 30) return 'achieved';
    if (streak >= 7) return 'growing';
    return 'baby';
  };

  const getEvolutionProgress = (streak: number) => {
    if (streak >= EVOLUTION_THRESHOLDS.achieved) return 100;
    if (streak >= EVOLUTION_THRESHOLDS.growing) {
      return Math.min(100, ((streak - EVOLUTION_THRESHOLDS.growing) / (EVOLUTION_THRESHOLDS.achieved - EVOLUTION_THRESHOLDS.growing)) * 100);
    }
    return Math.min(100, (streak / EVOLUTION_THRESHOLDS.growing) * 100);
  };

  const getEvolutionMessage = (streak: number, evolutionStage: string) => {
    if (evolutionStage === 'achieved') {
      return EVOLUTION_MESSAGES.achieved.complete;
    }
    
    const nextThreshold = evolutionStage === 'baby' ? EVOLUTION_THRESHOLDS.growing : EVOLUTION_THRESHOLDS.achieved;
    const daysLeft = nextThreshold - streak;
    
    if (evolutionStage === 'baby') {
      return daysLeft <= 2 ? EVOLUTION_MESSAGES.baby.near : EVOLUTION_MESSAGES.baby.start;
    }
    
    return daysLeft <= 5 ? EVOLUTION_MESSAGES.growing.near : EVOLUTION_MESSAGES.growing.start;
  };

  const getEvolutionTooltip = (streak: number, evolutionStage: string) => {
    if (evolutionStage === 'achieved') {
      return EVOLUTION_MESSAGES.achieved.tooltip;
    }
    
    const nextThreshold = evolutionStage === 'baby' ? EVOLUTION_THRESHOLDS.growing : EVOLUTION_THRESHOLDS.achieved;
    const daysLeft = nextThreshold - streak;
    
    return evolutionStage === 'baby' 
      ? EVOLUTION_MESSAGES.baby.tooltip(daysLeft)
      : EVOLUTION_MESSAGES.growing.tooltip(daysLeft);
  };

  const handleToggleHabit = async (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const todayLocal = habitService.getTodayInUserTimezone();
    const isCompleted = habit.completedDates.includes(todayLocal);
    
    if (!isCompleted) {
      setAnimatingHabit({ id: habitId, type: habit.animal_type });
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

  // Use enhanced view for 4 or more habits
  if (habits.length >= 4) {
    return (
      <>
        <FallingLeaves 
          isAnimating={animatingHabit !== null} 
          plantType={animatingHabit?.type || 'lion'} 
        />
        <EnhancedHabitList 
          habits={habits}
          onToggleHabit={handleToggleHabit}
          onDeleteHabit={onDeleteHabit}
        />
      </>
    );
  }

  // Original garden view for 3 or fewer habits
  return (
    <>
      <FallingLeaves 
        isAnimating={animatingHabit !== null} 
        plantType={animatingHabit?.type || 'lion'} 
      />

      <div className="space-y-3 p-4 animate-fade-in">
        {habits.map((habit) => {
          const { companion } = getHabitCompanion(habit);
          const evolutionStage = getEvolutionStage(habit.streak);
          const currentWeekProgress = getWeeklyProgress(habit);
          const lastWeekProgress = getWeeklyProgress(habit, true);
          const progressDiff = currentWeekProgress - lastWeekProgress;
          const todayLocal = habitService.getTodayInUserTimezone();
          
          return (
            <div
              key={habit.id}
              className={`group bg-gradient-to-br from-[#043d2d] to-[#085e46] rounded-xl p-4 shadow-lg 
                transition-all duration-300 hover:shadow-xl hover:scale-[1.02]
                relative
                before:absolute before:inset-0 before:bg-gradient-to-br before:from-emerald-500/10 before:to-transparent 
                before:opacity-0 before:transition-opacity before:duration-300 group-hover:before:opacity-100`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="relative group/animal">
                    <div className={cn(
                      "w-11 h-11 relative rounded-lg overflow-hidden bg-black/20",
                      `ring-2 ${companion.colors.accent}`,
                      "shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-300"
                    )}>
                      <img 
                        src={companion.stages[evolutionStage].image}
                        alt={`${habit.title} - ${evolutionStage} stage`}
                        className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
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
                      
                      {/* Evolution Progress Bar with Label */}
                      {evolutionStage !== 'achieved' && (
                        <div className="absolute bottom-0 left-0 right-0">
                          {/* Progress Bar */}
                          <div className="h-1.5 bg-black/30">
                            <div 
                              className={cn(
                                "h-full transition-all duration-500",
                                companion.colors.text,
                                "opacity-80"
                              )}
                              style={{ width: `${getEvolutionProgress(habit.streak)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Evolution Tooltip - Updated styling */}
                    <div className="absolute left-1/2 w-72 p-4 
                      bg-gradient-to-br from-[#043d2d]/95 to-[#032921]/95 backdrop-blur-md rounded-xl
                      border border-emerald-600/20 shadow-2xl
                      transition-all duration-300 scale-0 opacity-0 
                      group-hover/animal:scale-100 group-hover/animal:opacity-100
                      pointer-events-none z-[9999]"
                      style={{
                        top: '-240px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.3))'
                      }}
                    >
                      <div className="text-center space-y-3">
                        {/* Stage Header */}
                        <div className="space-y-1.5">
                          <p className={cn(
                            "text-base font-semibold",
                            companion.colors.text
                          )}>
                            {evolutionStage.charAt(0).toUpperCase() + evolutionStage.slice(1)} Stage
                          </p>
                          <p className="text-white/90 text-sm font-medium">
                            {getEvolutionMessage(habit.streak, evolutionStage)}
                          </p>
                          <p className="text-white/70 text-xs">
                            {getEvolutionTooltip(habit.streak, evolutionStage)}
                          </p>
                        </div>
                        
                        {/* Evolution Preview */}
                        {evolutionStage !== 'achieved' && (
                          <div className="pt-3 border-t border-white/10">
                            <div className="flex items-center justify-center gap-6">
                              {/* Current Stage */}
                              <div className="text-center space-y-2">
                                <div className={cn(
                                  "w-16 h-16 rounded-lg overflow-hidden ring-2",
                                  companion.colors.accent
                                )}>
                                  <img 
                                    src={companion.stages[evolutionStage].image}
                                    alt="Current"
                                    className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
                                  />
                                </div>
                                <span className="text-[11px] text-white/70 font-medium block">Current</span>
                              </div>

                              {/* Arrow */}
                              <div className="flex flex-col items-center gap-1">
                                <div className={cn(
                                  "w-8 h-[2px]",
                                  companion.colors.text
                                )} />
                                <companion.icon className={cn(
                                  "w-4 h-4",
                                  companion.colors.text
                                )} />
                              </div>

                              {/* Next Stage */}
                              <div className="text-center space-y-2">
                                <div className={cn(
                                  "w-16 h-16 rounded-lg overflow-hidden ring-2 ring-white/5"
                                )}>
                                  <img 
                                    src={companion.stages[evolutionStage === 'baby' ? 'growing' : 'achieved'].image}
                                    alt="Next"
                                    className="w-full h-full object-cover opacity-80 transform hover:scale-110 transition-transform duration-300"
                                  />
                                </div>
                                <span className="text-[11px] text-white/50 font-medium block">Next Stage</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Tooltip Arrow - Updated styling */}
                      <div className="absolute left-1/2 bottom-0 w-4 h-4 -mb-2 
                        bg-[#032921]/95 transform rotate-45 -translate-x-1/2 
                        border-r border-b border-emerald-600/20" 
                      />
                    </div>
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
                        ${habit.completedDates.includes(todayLocal)
                          ? 'bg-emerald-500 text-white scale-110 hover:bg-emerald-600 hover:scale-105' 
                          : 'bg-white/10 text-white/60 hover:bg-emerald-500/20 hover:text-emerald-300 hover:scale-105'
                        } active:scale-95`}
                    >
                      <Check className={`w-4 h-4 transition-all duration-500 
                        ${habit.completedDates.includes(todayLocal)
                          ? 'group-hover:rotate-12 animate-bounce-once' 
                          : 'group-hover:-rotate-12'}`} 
                      />
                      {/* Success ripple effect */}
                      {habit.completedDates.includes(todayLocal) && (
                        <span className="absolute inset-0 rounded-lg transition-all duration-700 animate-ripple bg-emerald-400/30" />
                      )}
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
                    const dateStr = habitService.normalizeDateToStartOfDay(date);
                    const todayLocal = habitService.getTodayInUserTimezone();
                    const isToday = dateStr === todayLocal;
                    const isPast = date <= new Date();
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
                        {isCompleted && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className="w-4 h-4 text-emerald-400" />
                          </div>
                        )}
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
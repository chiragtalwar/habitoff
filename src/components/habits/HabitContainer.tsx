import { Check, Trash2, Flame } from "lucide-react";
import { useState } from "react";
import { FallingLeaves } from "@/components/animations/FallingLeaves";
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
  
  // Get current date and calculate the week's dates
  const today = new Date();
  const currentDay = today.getDay();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Calculate the start of the week (Sunday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDay);

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

  return (
    <>
      {/* Falling Leaves Animation */}
      <FallingLeaves 
        isAnimating={animatingHabit !== null} 
        plantType={animatingHabit?.type || 'flower'} 
      />

      {/* Habits List */}
      <div className="space-y-3 p-4 animate-fade-in">
        {habits.map((habit) => {
          const plantEmoji = PLANT_TYPES.find(p => p.value === habit.plant_type)?.emoji || '🌱';
          
          return (
            <div
              key={habit.id}
              className={`bg-gradient-to-br from-[#043d2d] to-[#085e46] rounded-xl p-4 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="bg-white/10 p-2 rounded-lg">
                    <span className="text-2xl">{plantEmoji}</span>
                  </div>
                  <div className="flex flex-col items-start">
                    <h3 className="text-white font-semibold text-base">{habit.title}</h3>
                    <p className="text-white/60 text-xs">{habit.frequency}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg">
                    <span className="text-white/90 font-medium">{habit.streak}</span>
                    <Flame className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleHabit(habit.id);
                      }}
                      className={`p-1.5 rounded-lg transition-all duration-200 ${
                        habit.completedDates.includes(new Date().toISOString().split('T')[0])
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteHabit(habit.id);
                      }}
                      className="p-1.5 rounded-lg bg-white/10 text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-2">
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
                        ${isToday ? 'bg-emerald-500/20 ring-2 ring-emerald-500/40' : 'hover:bg-white/10'}
                        ${isCompleted ? 'bg-emerald-500/40 text-emerald-200 shadow-lg shadow-emerald-500/20 scale-105' : ''}
                        ${isPast && !isCompleted ? 'bg-white/10' : ''}
                        ${date > today ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span className="text-white/80 text-[10px] font-medium">{day}</span>
                      <span className="text-white font-bold text-sm">{date.getDate()}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}; 
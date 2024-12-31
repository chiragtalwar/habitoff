import { useMemo } from "react";
import { HabitWithCompletedDates } from "@/types/habit";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface HabitGridProps {
  habits: HabitWithCompletedDates[];
}

export const HabitGrid = ({ habits }: HabitGridProps) => {
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
  
  const currentWeek = useMemo(() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    monday.setHours(0, 0, 0, 0);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      days.push(date);
    }
    return days;
  }, []);

  const getCompletionStatus = (habit: HabitWithCompletedDates, date: Date): boolean => {
    return habit.completedDates.some(
      (completionDate: string) => {
        const completion = new Date(completionDate);
        return completion.toDateString() === date.toDateString();
      }
    );
  };

  const getCompletionRatio = (habit: HabitWithCompletedDates): string => {
    const completions = currentWeek.filter(date => 
      getCompletionStatus(habit, date)
    ).length;
    return `${completions}/${currentWeek.length}`;
  };

  const getHabitColor = (index: number): string => {
    const colors = [
      'from-blue-500/20 to-blue-600/20 border-blue-500/30',     // Exercise
      'from-purple-500/20 to-purple-600/20 border-purple-500/30', // Journal
      'from-pink-500/20 to-pink-600/20 border-pink-500/30',     // Alcohol
      'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30',     // Cold shower
      'from-green-500/20 to-green-600/20 border-green-500/30',  // Floss
      'from-orange-500/20 to-orange-600/20 border-orange-500/30', // Meditate
      'from-teal-500/20 to-teal-600/20 border-teal-500/30',     // eBook
    ] as const;
    return colors[index % colors.length];
  };

  const dateRange = `${currentWeek[0].toLocaleDateString('default', { 
    month: 'short', 
    day: 'numeric' 
  })} - ${currentWeek[6].toLocaleDateString('default', { 
    month: 'short', 
    day: 'numeric' 
  })}`;

  return (
    <div className="mt-4 p-3 rounded-2xl bg-green-900/90 backdrop-blur-lg border border-green-700/90 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="p-1 text-sm font-medium text-white">Weekly Progress</h2>
        <span className="text-xss text-emerald-300/80">{dateRange}</span>
      </div>

      <div className="space-y-2">
        {/* Days header */}
        <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-x-1 mb-2">
          <div className="w-24" /> {/* Empty space for habit names */}
          {weekDays.map(day => (
            <div key={day} className="text-[10px] font-medium text-emerald-300/80 text-center">
              {day}
            </div>
          ))}
        </div>

        {/* Habits grid */}
        <div className="space-y-1.5">
          {habits.map((habit, index) => {
            const completionRatio = getCompletionRatio(habit);

            return (
              <div 
                key={habit.id} 
                className={cn(
                  "grid grid-cols-[auto_repeat(7,1fr)] items-center gap-x-1 py-1 px-1.5 rounded-lg bg-gradient-to-br",
                  "hover:shadow-sm transition-all duration-300",
                  "border",
                  getHabitColor(index)
                )}
              >
                {/* Habit name and ratio */}
                <div className="w-24 flex items-center justify-between pr-2">
                  <span className="text-xs font-medium text-white/90 truncate max-w-[72px]">
                    {habit.title}
                  </span>
                  <span className="text-[10px] text-emerald-300/80">
                    {completionRatio}
                  </span>
                </div>

                {/* Completion checkmarks */}
                {currentWeek.map(date => {
                  const isCompleted = getCompletionStatus(habit, date);
                  const isToday = date.toDateString() === new Date().toDateString();

                  return (
                    <div 
                      key={date.toISOString()}
                      className={cn(
                        "flex items-center justify-center",
                        "w-5 h-5 rounded-md transition-all duration-300 mx-auto",
                        isCompleted ? [
                          "bg-emerald-500/20",
                          "ring-[0.5px] ring-emerald-500/30",
                          "scale-100 hover:scale-110"
                        ] : [
                          "bg-white/5",
                          isToday && "ring-[0.5px] ring-emerald-400/20"
                        ]
                      )}
                    >
                      {isCompleted && (
                        <Check 
                          className="w-3 h-3 text-emerald-400/90 drop-shadow-glow animate-in fade-in-50 duration-300" 
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

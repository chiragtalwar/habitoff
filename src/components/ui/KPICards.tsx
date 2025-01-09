import { ArrowUp, TrendingUp, Star, Trophy } from "lucide-react";
import { HabitWithCompletedDates } from "@/types/habit";

interface KPICardsProps {
  habits: HabitWithCompletedDates[];
}

export function KPICards({ habits }: KPICardsProps) {
  // Calculate current month streak and completion
  const today = new Date();
  const currentMonth = today.toLocaleString('default', { month: 'long' });
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  // Calculate total possible completions considering frequency
  const totalPossibleCompletions = habits.reduce((acc: number, habit) => {
    const daysForHabit = habit.frequency === 'daily' ? daysInMonth : 
                        habit.frequency === 'weekly' ? Math.ceil(daysInMonth / 7) : 1;
    return acc + daysForHabit;
  }, 0);

  // Calculate monthly completions
  const monthlyCompletions = habits.reduce((acc: number, habit) => {
    return acc + (habit.completedDates?.length || 0);
  }, 0);

  const currentCompletion = totalPossibleCompletions > 0 
    ? Math.round((monthlyCompletions / totalPossibleCompletions) * 100)
    : 0;

  // Calculate last month's completion with the same logic
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
  const lastMonthDays = lastMonthEnd.getDate();

  const lastMonthPossible = habits.reduce((acc: number, habit) => {
    const daysForHabit = habit.frequency === 'daily' ? lastMonthDays : 
                        habit.frequency === 'weekly' ? Math.ceil(lastMonthDays / 7) : 1;
    return acc + daysForHabit;
  }, 0);

  const lastMonthCompletions = habits.reduce((acc: number, habit) => {
    const completionsLastMonth = habit.completedDates.filter(date => {
      const completionDate = new Date(date);
      return completionDate >= lastMonthStart && completionDate <= lastMonthEnd;
    }).length;
    return acc + completionsLastMonth;
  }, 0);

  const lastMonthCompletion = lastMonthPossible > 0 
    ? Math.round((lastMonthCompletions / lastMonthPossible) * 100)
    : 0;

  const completionDiff = currentCompletion - lastMonthCompletion;

  // Calculate longest streak
  const longestStreak = habits.reduce((acc, habit) => {
    return Math.max(acc, habit.longestStreak || 0);
  }, 0);

  // Calculate current streak if not provided
  const calculateCurrentStreak = (dates: string[]): number => {
    if (dates.length === 0) return 0;
    
    const sortedDates = [...dates].sort((a, b) => b.localeCompare(a));
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // Check if the habit was completed today or yesterday
    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
      return 0;
    }

    let streak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const current = new Date(sortedDates[i]);
      const previous = new Date(sortedDates[i - 1]);
      const dayDiff = (previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24);
      
      if (dayDiff === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Calculate current streak
  const actualCurrentStreak = Math.max(
    ...habits.map(habit => calculateCurrentStreak(habit.completedDates))
  );

  // Get motivational message based on completion
  const getMotivationalMessage = (completion: number) => {
    if (completion === 0) return "Start your journey! 🌱";
    if (completion < 30) return "Great start! 🌟";
    if (completion < 60) return "You're on fire! 🔥";
    if (completion < 90) return "Unstoppable! ⚡";
    return "Legendary! 👑";
  };

  // Get streak message
  const getStreakMessage = (streak: number) => {
    if (streak === 0) return "Ready to begin!";
    if (streak === 1) return "First win! 🎯";
    if (streak < 5) return "Building momentum!";
    if (streak < 10) return "On a roll! 🎳";
    return "Incredible streak! 🏆";
  };

  // Get comparison message
  const getComparisonMessage = () => {
    const lastMonthName = lastMonthStart.toLocaleString('default', { month: 'short' });
    if (completionDiff > 0) return `+${completionDiff}% vs ${lastMonthName}`;
    if (completionDiff < 0) return `${completionDiff}% vs ${lastMonthName}`;
    return `Same as ${lastMonthName}`;
  };

  // If no habits, return null - this prevents any flashing
  if (habits.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-[#1a2234] p-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span>✨</span>
              <h3 className="text-base font-medium text-white">Welcome to Habito!</h3>
            </div>
            <p className="text-sm text-white/60">
              Ready to start your journey? Click the + button to plant your first habit.
            </p>
          </div>
        </div>
        <div className="rounded-xl bg-[#1a2234] p-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span>🌱</span>
              <h3 className="text-base font-medium text-white">Growth Awaits</h3>
            </div>
            <p className="text-sm text-white/60">
              Watch your habits grow like plants in your mindfulness garden.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 p-4">
      <div className="group flex-1 relative bg-gradient-to-br from-habit via-habit/90 to-habit-accent rounded-xl p-6 
        shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15),0_0_25px_rgba(var(--habit-success-rgb),0.3)]
        transition-all duration-300 ease-in-out hover:scale-[1.02]
        before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-habit-success/10 before:to-transparent before:opacity-0 
        before:transition-opacity before:duration-300 group-hover:before:opacity-100">
        <div className="relative">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <h3 className="text-white/90 text-sm font-medium tracking-wide">Current Progress</h3>
              <p className="text-habit-success/80 text-xs font-medium">{currentMonth}</p>
            </div>
            <div className="bg-habit-success/20 p-2 rounded-full">
              <Star className="w-5 h-5 text-habit-success group-hover:animate-glow" />
            </div>
          </div>
          
          <div className="mt-2">
            <div className="flex justify-between items-end mb-1">
              <div className="flex items-baseline">
                <p className="text-habit-success text-5xl font-bold tracking-tight">{monthlyCompletions}</p>
                <span className="text-white/50 text-lg ml-1">/{totalPossibleCompletions}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-white/90 text-base font-medium leading-none">{currentCompletion}%</span>
                <span className="text-white/50 text-[10px] leading-tight">completion</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-habit-success/90 text-sm font-medium">{getMotivationalMessage(currentCompletion)}</p>
              <div className="flex items-center text-habit-success text-xs">
                <ArrowUp className={`w-3 h-3 mr-0.5 ${completionDiff < 0 ? 'rotate-180' : ''}`} />
                <span>{getComparisonMessage()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="group flex-1 relative bg-gradient-to-br from-habit via-habit/90 to-habit-accent rounded-xl p-6 
        shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15),0_0_25px_rgba(var(--habit-highlight-rgb),0.3)]
        transition-all duration-300 ease-in-out hover:scale-[1.02]
        before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-habit-highlight/10 before:to-transparent before:opacity-0 
        before:transition-opacity before:duration-300 group-hover:before:opacity-100">
        <div className="relative">
          <div className="flex justify-between items-start">
            <h3 className="text-white/90 text-sm font-medium tracking-wide">Current Streak</h3>
            <div className="bg-habit-highlight/20 p-2 rounded-full">
              <Trophy className="w-5 h-5 text-habit-highlight group-hover:animate-glow" />
            </div>
          </div>
          
          <div className="mt-2">
            <div className="flex justify-between items-end mb-1">
              <div className="flex items-baseline">
                <p className="text-habit-highlight text-5xl font-bold tracking-tight">{actualCurrentStreak}</p>
                <span className="text-white/50 text-lg ml-1">days</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-white/90 text-base font-medium leading-none">{longestStreak}</span>
                <span className="text-white/50 text-[10px] leading-tight">best streak</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-habit-highlight/90 text-sm font-medium">{getStreakMessage(actualCurrentStreak)}</p>
              <div className="flex items-center text-habit-highlight text-xs">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                <span>{actualCurrentStreak === longestStreak ? 'All-time Best!' : 'Keep Going!'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
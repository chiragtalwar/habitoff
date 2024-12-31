import { ArrowUp, TrendingUp, Star, Trophy } from "lucide-react";
import { HabitWithCompletedDates } from "@/types/habit";

interface KPICardsProps {
  habits: HabitWithCompletedDates[];
}

export function KPICards({ habits }: KPICardsProps) {
  // Calculate current month streak and completion
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysSoFar = Math.min(today.getDate(), daysInMonth);

  // Calculate monthly completions
  const monthlyCompletions = habits.reduce((acc, habit) => {
    const completionsThisMonth = habit.completedDates.filter(date => {
      const completionDate = new Date(date);
      return completionDate >= startOfMonth && completionDate <= today;
    }).length;
    return acc + completionsThisMonth;
  }, 0);

  // Calculate total possible completions for the month so far
  const totalPossibleCompletions = habits.length * daysSoFar;
  const currentCompletion = totalPossibleCompletions > 0 
    ? Math.round((monthlyCompletions / totalPossibleCompletions) * 100)
    : 0;

  // Calculate last month's completion
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
  const lastMonthCompletions = habits.reduce((acc: number, habit) => {
    const completionsLastMonth = habit.completedDates.filter(date => {
      const completionDate = new Date(date);
      return completionDate >= lastMonthStart && completionDate <= lastMonthEnd;
    }).length;
    return acc + completionsLastMonth;
  }, 0);
  const lastMonthDays = lastMonthEnd.getDate();
  const lastMonthPossible = habits.length * lastMonthDays;
  const lastMonthCompletion = lastMonthPossible > 0 
    ? Math.round((lastMonthCompletions / lastMonthPossible) * 100)
    : 0;
  
  const completionDiff = currentCompletion - lastMonthCompletion;

  // Calculate longest streak
  const longestStreak = habits.reduce((acc, habit) => {
    const streak = habit.streak || 0;
    return Math.max(acc, streak);
  }, 0);

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

  return (
    <div className="flex gap-6 p-4">
      <div className="group flex-1 relative bg-gradient-to-br from-habit via-habit/90 to-habit-accent rounded-xl p-6 
        shadow-[0_8px_30px_rgb(0,0,0,0.12),0_0_15px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15),0_0_25px_rgba(0,0,0,0.2)]
        transition-all duration-300 ease-in-out hover:scale-[1.02]
        before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-habit-success/10 before:to-transparent before:opacity-0 
        before:transition-opacity before:duration-300 group-hover:before:opacity-100">
        <div className="relative">
          <div className="flex justify-between items-start">
            <h3 className="text-white/90 text-sm font-medium tracking-wide">Current Month Progress</h3>
            <div className="bg-habit-success/20 p-2 rounded-full animate-pulse">
              <Star className="w-5 h-5 text-habit-success animate-glow" />
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
        shadow-[0_8px_30px_rgb(0,0,0,0.12),0_0_15px_rgba(255,165,0,0.15)] hover:shadow-[0_8px_30px_rgba(255,165,0,0.15),0_0_25px_rgba(255,165,0,0.2)]
        transition-all duration-300 ease-in-out hover:scale-[1.02]
        before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-habit-highlight/10 before:to-transparent before:opacity-0 
        before:transition-opacity before:duration-300 group-hover:before:opacity-100">
        <div className="relative">
          <div className="flex justify-between items-start">
            <h3 className="text-white/90 text-sm font-medium tracking-wide">Longest Streak</h3>
            <div className="bg-habit-highlight/20 p-2 rounded-full animate-pulse">
              <Trophy className="w-5 h-5 text-habit-highlight animate-glow" />
            </div>
          </div>
          
          <div className="mt-2">
            <div className="flex justify-between items-end mb-1">
              <div className="flex items-baseline">
                <p className="text-habit-highlight text-5xl font-bold tracking-tight">{longestStreak}</p>
                <span className="text-white/50 text-lg ml-1">days</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-white/90 text-base font-medium leading-none">100%</span>
                <span className="text-white/50 text-[10px] leading-tight">mastery</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-habit-highlight/90 text-sm font-medium">{getStreakMessage(longestStreak)}</p>
              <div className="flex items-center text-habit-highlight text-xs">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                <span>Personal Best!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useMemo } from "react";
import { HabitWithCompletedDates } from "../../types/habit";
import { Timeline } from "./Timeline";
import { HabitGrid } from "./HabitGrid";
import { cn } from "../../lib/utils";

interface AnalyticsPanelProps {
  habits: HabitWithCompletedDates[];
}

export const AnalyticsPanel = ({ habits }: AnalyticsPanelProps) => {
  const habitStats = useMemo(() => {
    const allCompletedDates = habits.reduce((acc, habit) => [...acc, ...habit.completedDates], [] as string[]);
    const now = new Date();
    
    // Current periods
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    // Previous periods
    const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
    const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    const endOfLastWeek = new Date(startOfWeek);
    endOfLastWeek.setDate(endOfLastWeek.getDate() - 1);

    // Current period completions
    const yearlyCompletions = allCompletedDates.filter(date => new Date(date) >= startOfYear).length;
    const monthlyCompletions = allCompletedDates.filter(date => new Date(date) >= startOfMonth).length;
    const weeklyCompletions = allCompletedDates.filter(date => new Date(date) >= startOfWeek).length;

    // Previous period completions
    const lastYearCompletions = allCompletedDates.filter(date => {
      const d = new Date(date);
      return d >= startOfLastYear && d <= endOfLastYear;
    }).length;
    const lastMonthCompletions = allCompletedDates.filter(date => {
      const d = new Date(date);
      return d >= startOfLastMonth && d <= endOfLastMonth;
    }).length;
    const lastWeekCompletions = allCompletedDates.filter(date => {
      const d = new Date(date);
      return d >= startOfLastWeek && d <= endOfLastWeek;
    }).length;

    // Calculate percentages
    const totalYearlyPossible = habits.length * 365;
    const totalMonthlyPossible = habits.length * endOfLastMonth.getDate();
    const totalWeeklyPossible = habits.length * 7;

    const yearlyPercentage = Math.min(Math.round((yearlyCompletions / totalYearlyPossible) * 100), 100);
    const monthlyPercentage = Math.min(Math.round((monthlyCompletions / totalMonthlyPossible) * 100), 100);
    const weeklyPercentage = Math.min(Math.round((weeklyCompletions / totalWeeklyPossible) * 100), 100);

    const lastYearPercentage = Math.min(Math.round((lastYearCompletions / totalYearlyPossible) * 100), 100);
    const lastMonthPercentage = Math.min(Math.round((lastMonthCompletions / totalMonthlyPossible) * 100), 100);
    const lastWeekPercentage = Math.min(Math.round((lastWeekCompletions / totalWeeklyPossible) * 100), 100);

    return {
      yearly: yearlyPercentage,
      monthly: monthlyPercentage,
      weekly: weeklyPercentage,
      yearlyDiff: yearlyPercentage - lastYearPercentage,
      monthlyDiff: monthlyPercentage - lastMonthPercentage,
      weeklyDiff: weeklyPercentage - lastWeekPercentage,
    };
  }, [habits]);

  const CircularProgress = ({ value, label, color, diff }: { value: number; label: string; color: string; diff: number }) => {
    const radius = 25;
    const circumference = 2 * Math.PI * radius;
    const progress = (100 - value) * circumference / 100;

    const getComparisonText = () => {
      if (label === "This Week") return "last week";
      if (label === "This Month") return "last month";
      return "last year";
    };

    return (
      <div className="flex flex-col items-center group">
        <div className="relative w-16 h-16 transition-transform duration-300 group-hover:scale-110">
          <svg className="w-full h-full transform -rotate-90">
            {/* Outer glow */}
            <circle
              cx="32"
              cy="32"
              r={radius + 2}
              stroke="white"
              strokeWidth="1"
              fill="transparent"
              className="opacity-0 group-hover:opacity-20 transition-opacity duration-300"
            />
            {/* Background circle */}
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke="currentColor"
              strokeWidth="3"
              fill="transparent"
              className="text-white/10"
            />
            {/* Progress circle */}
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke={color}
              strokeWidth="3"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={progress}
              className="drop-shadow-none group-hover:drop-shadow-[0_0_3px_rgba(255,255,255,0.5)] transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium text-white tracking-wider">{value}%</span>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span className="mt-2 text-xs font-light text-white/80 tracking-wide group-hover:text-white transition-colors duration-300">{label}</span>
          {diff !== 0 && (
            <div className={cn(
              "text-[10px] font-medium mt-0.5",
              diff > 0 ? "text-emerald-400" : "text-orange-400"
            )}>
              {diff > 0 ? '+' : ''}{diff}% vs {getComparisonText()}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Progress Insights */}
      <div className="mt-1 p-5 rounded-2xl bg-green-900/90 backdrop-blur-sm border border-green-700/90 shadow-xl">
        <h2 className="text-sm font-medium text-white mb-3">Progress Insights</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 backdrop-blur-sm border border-orange-500/20 hover:border-orange-500/30 transition-all duration-300">
            <CircularProgress 
              value={habitStats.yearly} 
              label="This Year" 
              color="#f59e0b"
              diff={habitStats.yearlyDiff}
            />
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500/10 to-sky-500/5 backdrop-blur-sm border border-sky-500/20 hover:border-sky-500/30 transition-all duration-300">
            <CircularProgress 
              value={habitStats.weekly} 
              label="This Week" 
              color="#0ea5e9"
              diff={habitStats.weeklyDiff}
            />
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 backdrop-blur-sm border border-violet-500/20 hover:border-violet-500/30 transition-all duration-300">
            <CircularProgress 
              value={habitStats.monthly} 
              label="This Month" 
              color="#8b5cf6"
              diff={habitStats.monthlyDiff}
            />
          </div>
        </div>
      </div>

      {/* Timeline Chart */}
      <Timeline habits={habits} />

      {/* Weekly Habit Grid */}
      <div className="mt-6">
        <HabitGrid habits={habits} />
      </div>
    </div>
  );
};

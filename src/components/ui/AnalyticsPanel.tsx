import { useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { HabitWithCompletedDates } from '@/types/habit';
import { Timeline } from './Timeline';
import { cn } from '../../lib/utils';

interface AnalyticsPanelProps {
  habits: HabitWithCompletedDates[];
}

export const AnalyticsPanel = ({ habits }: AnalyticsPanelProps) => {
  const [currentHabitIndex, setCurrentHabitIndex] = useState(0);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [monthOffset, setMonthOffset] = useState(0);
  const currentHabit = habits[currentHabitIndex];

  const nextHabit = () => {
    setCurrentHabitIndex((prev) => (prev + 1) % habits.length);
  };

  const prevHabit = () => {
    setCurrentHabitIndex((prev) => (prev - 1 + habits.length) % habits.length);
  };

  // Calculate stats for circular progress
  const calculateStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get start of periods
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Monday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const endOfYear = new Date(today.getFullYear(), 11, 31);

    // Calculate required completions for each period
    const stats = habits.reduce((acc, habit) => {
      const habitStartDate = new Date(habit.created_at);
      habitStartDate.setHours(0, 0, 0, 0);

      // Weekly calculations - count from habit start to end of week
      const daysRemainingInWeek = Math.floor((endOfWeek.getTime() - habitStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const weeklyRequired = habit.frequency === 'daily' ? daysRemainingInWeek : 
                           habit.frequency === 'weekly' ? Math.ceil(daysRemainingInWeek / 7) : 0;

      // Monthly calculations - count from habit start to end of month
      const daysRemainingInMonth = Math.floor((endOfMonth.getTime() - habitStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const monthlyRequired = habit.frequency === 'daily' ? daysRemainingInMonth :
                            habit.frequency === 'weekly' ? Math.ceil(daysRemainingInMonth / 7) : 1;

      // Yearly calculations - count from habit start to end of year
      const daysRemainingInYear = Math.floor((endOfYear.getTime() - habitStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const yearlyRequired = habit.frequency === 'daily' ? daysRemainingInYear :
                           habit.frequency === 'weekly' ? Math.ceil(daysRemainingInYear / 7) : 12;

      // Count actual completions
      const completedDates = habit.completedDates.map(date => {
        const completionDate = new Date(date);
        completionDate.setHours(0, 0, 0, 0);
        return completionDate;
      });

      // Count completions for each period
      const weeklyCount = completedDates.filter(date => 
        date >= habitStartDate && date <= today && date >= startOfWeek
      ).length;

      const monthlyCount = completedDates.filter(date => 
        date >= habitStartDate && date <= today && date >= startOfMonth
      ).length;

      const yearlyCount = completedDates.filter(date => 
        date >= habitStartDate && date <= today && date >= startOfYear
      ).length;

      return {
        weekly: acc.weekly + weeklyCount,
        monthly: acc.monthly + monthlyCount,
        yearly: acc.yearly + yearlyCount,
        weeklyRequired: acc.weeklyRequired + weeklyRequired,
        monthlyRequired: acc.monthlyRequired + monthlyRequired,
        yearlyRequired: acc.yearlyRequired + yearlyRequired
      };
    }, {
      weekly: 0,
      monthly: 0,
      yearly: 0,
      weeklyRequired: 0,
      monthlyRequired: 0,
      yearlyRequired: 0
    });

    // Calculate percentages
    return {
      weekly: stats.weeklyRequired > 0 ? Math.round((stats.weekly / stats.weeklyRequired) * 100) : 0,
      monthly: stats.monthlyRequired > 0 ? Math.round((stats.monthly / stats.monthlyRequired) * 100) : 0,
      yearly: stats.yearlyRequired > 0 ? Math.round((stats.yearly / stats.yearlyRequired) * 100) : 0,
      weeklyDiff: 100, // First week, so 100% improvement
      monthlyDiff: 100, // First month, so 100% improvement
      yearlyDiff: 100  // First year, so 100% improvement
    };
  };

  const habitStats = calculateStats();

  const CircularProgress = ({ value, label, color, diff }: { value: number; label: string; color: string; diff: number }) => {
    // Make radius responsive based on screen size
    const radius = 18; // Slightly smaller base radius
    const circumference = 2 * Math.PI * radius;
    const progress = (100 - value) * circumference / 100;

    const getComparisonText = () => {
      if (label === "This Week") return "vs last week";
      if (label === "This Month") return "vs last month";
      return "vs last year";
    };

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-[48px] h-[48px] sm:w-[52px] sm:h-[52px] md:w-[56px] md:h-[56px]">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="currentColor"
              strokeWidth="2.5"
              fill="transparent"
              className="text-white/5"
            />
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke={color}
              strokeWidth="2.5"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={progress}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm sm:text-base font-medium text-white">{value}%</span>
          </div>
        </div>
        <span className="mt-1 text-[10px] sm:text-xs text-white/80">{label}</span>
        <div className={cn(
          "text-[9px] sm:text-[10px] font-medium mt-0.5",
          diff > 0 ? "text-emerald-300" : "text-orange-300"
        )}>
          {diff > 0 ? '+' : '-'}{Math.abs(diff)}% {getComparisonText()}
        </div>
      </div>
    );
  };

  // Get the current month's calendar
  const getMonthCalendar = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + monthOffset);
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Get first day and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get day of week for first day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();
    
    // Calculate empty cells before the 1st
    // If first day is Sunday (0), we need 6 empty cells
    // If first day is Monday (1), we need 0 empty cells
    // If first day is Tuesday (2), we need 1 empty cell
    // etc.
    const emptyCellsAtStart = (firstDayOfWeek + 6) % 7;
    
    const days = [];
    // Add empty cells for days before the 1st
    for (let i = 0; i < emptyCellsAtStart; i++) {
      days.push(null);
    }
    // Add actual days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const monthDays = getMonthCalendar();
  const today = new Date();

  // Get the current month with offset
  const getCurrentMonth = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + monthOffset);
    return date.toLocaleString('default', { month: 'long' });
  };

  const handlePrevMonth = () => {
    setMonthOffset(prev => prev - 1);
  };

  const handleNextMonth = () => {
    if (monthOffset < 0) {
      setMonthOffset(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-1.5 p-1.5 ml-auto max-h-screen overflow-y-auto">
      {/* Progress Insights */}
      <div className="rounded-xl bg-[#0F4435] p-2 sm:p-2.5">
        <h2 className="text-xs sm:text-sm font-medium text-white mb-1.5">Progress Insights</h2>
        <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
          <div className="rounded-lg bg-[#0B3B2D] p-1 sm:p-1.5">
            <CircularProgress 
              value={habitStats.weekly} 
              label="This Week" 
              color="#4ade80"
              diff={habitStats.weeklyDiff}
            />
          </div>
          <div className="rounded-lg bg-[#0B3B2D] p-1 sm:p-1.5">
            <CircularProgress 
              value={habitStats.monthly} 
              label="This Month" 
              color="#4ade80"
              diff={habitStats.monthlyDiff}
            />
          </div>
          <div className="rounded-lg bg-[#0B3B2D] p-1 sm:p-1.5">
            <CircularProgress 
              value={habitStats.yearly} 
              label="This Year" 
              color="#4ade80"
              diff={habitStats.yearlyDiff}
            />
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="rounded-xl bg-[#0F4435] p-2 sm:p-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <h2 className="text-xs sm:text-sm font-medium text-white">Activity Timeline</h2>
          <div className="flex gap-2 sm:gap-3 text-[10px] sm:text-xs">
            {(['week', 'month', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "transition-colors",
                  timeRange === range
                    ? "text-emerald-400"
                    : "text-white/60 hover:text-white/80"
                )}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-[#0B3B2D] rounded-lg p-2 sm:p-2.5 h-[100px] sm:h-[120px] md:h-[130px]">
          <Timeline habits={habits} timeRange={timeRange} />
        </div>
      </div>

      {/* Monthly Calendar */}
      <div className="rounded-xl bg-[#0F4435] p-2 sm:p-2.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="p-0.5 rounded-lg bg-white/5 text-white/30 hover:bg-emerald-500/20 hover:text-emerald-300 
                  transition-all duration-200 transform hover:scale-105 active:scale-95 flex-shrink-0"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <h2 className="text-xs sm:text-sm font-medium text-white whitespace-nowrap">{getCurrentMonth()}</h2>
              <button
                onClick={handleNextMonth}
                disabled={monthOffset >= 0}
                className={`p-0.5 rounded-lg bg-white/5 text-white/30
                  transition-all duration-200 transform hover:scale-105 active:scale-95 flex-shrink-0
                  ${monthOffset >= 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-emerald-500/20 hover:text-emerald-300'}`}
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {currentHabit && (
              <div className="text-[10px] sm:text-xs text-emerald-400/90 bg-emerald-500/10 px-1.5 py-0.5 rounded-full flex-shrink-0 min-w-[42px] text-center">
                {(() => {
                  const currentDate = new Date();
                  currentDate.setMonth(currentDate.getMonth() + monthOffset);
                  const daysInMonth = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                    0
                  ).getDate();
                  
                  const completedDays = currentHabit.completedDates.filter(date => {
                    const [year, month] = date.split('-').map(Number);
                    return year === currentDate.getFullYear() && month === (currentDate.getMonth() + 1);
                  }).length;
                  
                  return `${completedDays}/${daysInMonth}`;
                })()}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2 sm:ml-3 flex-shrink-0 w-[100px] sm:w-[120px]">
            <button
              onClick={prevHabit}
              className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#0B3B2D] hover:bg-[#0d4535] text-white/60 hover:text-white transition-colors flex items-center justify-center flex-shrink-0"
            >
              <ArrowLeft className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </button>
            <span className="text-[10px] sm:text-xs text-white/60 bg-[#0B3B2D] px-1.5 py-0.5 rounded-full flex-1 truncate text-center">
              {currentHabit?.title || 'No habits'}
            </span>
            <button
              onClick={nextHabit}
              className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#0B3B2D] hover:bg-[#0d4535] text-white/60 hover:text-white transition-colors flex items-center justify-center flex-shrink-0"
            >
              <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-[9px] sm:text-[10px] font-medium text-emerald-300/80 text-center">
              {day}
            </div>
          ))}
          {monthDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const currentDate = new Date();
            currentDate.setMonth(currentDate.getMonth() + monthOffset);
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const isCompleted = currentHabit?.completedDates.some(completedDate => {
              const [completedYear, completedMonth, completedDay] = completedDate.split('-').map(Number);
              return completedYear === date.getFullYear() && 
                     (completedMonth - 1) === date.getMonth() &&
                     completedDay === day;
            });
            const isToday = date.toDateString() === today.toDateString();
            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

            return (
              <div
                key={day}
                className={cn(
                  "aspect-square rounded-sm flex items-center justify-center text-[9px] sm:text-[10px] transition-all duration-300",
                  isCompleted ? "bg-emerald-500/80 text-emerald-50 font-medium" : "bg-[#0B3B2D]",
                  isToday && "ring-1 ring-emerald-400",
                  !isPast && "opacity-40",
                  "text-white/90 hover:bg-emerald-600/40"
                )}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

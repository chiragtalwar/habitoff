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
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Previous periods
    const lastWeekStart = new Date(startOfWeek);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);

    const stats = habits.reduce((acc, habit) => {
      const completedDates = habit.completedDates.map(date => new Date(date));
      
      // Current periods
      const weeklyCount = completedDates.filter(date => date >= startOfWeek && date <= today).length;
      const monthlyCount = completedDates.filter(date => date >= startOfMonth && date <= today).length;
      const yearlyCount = completedDates.filter(date => date >= startOfYear && date <= today).length;

      // Previous periods
      const lastWeekCount = completedDates.filter(date => date >= lastWeekStart && date < startOfWeek).length;
      const lastMonthCount = completedDates.filter(date => date >= lastMonthStart && date < startOfMonth).length;
      const lastYearCount = completedDates.filter(date => date >= lastYearStart && date < startOfYear).length;

      return {
        weekly: acc.weekly + weeklyCount,
        monthly: acc.monthly + monthlyCount,
        yearly: acc.yearly + yearlyCount,
        lastWeek: acc.lastWeek + lastWeekCount,
        lastMonth: acc.lastMonth + lastMonthCount,
        lastYear: acc.lastYear + lastYearCount
      };
    }, {
      weekly: 0,
      monthly: 0,
      yearly: 0,
      lastWeek: 0,
      lastMonth: 0,
      lastYear: 0
    });

    const getDiff = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      weekly: Math.round((stats.weekly / (habits.length * 7)) * 100),
      monthly: Math.round((stats.monthly / (habits.length * 30)) * 100),
      yearly: Math.round((stats.yearly / (habits.length * 365)) * 100),
      weeklyDiff: getDiff(stats.weekly, stats.lastWeek),
      monthlyDiff: getDiff(stats.monthly, stats.lastMonth),
      yearlyDiff: getDiff(stats.yearly, stats.lastYear)
    };
  };

  const habitStats = calculateStats();

  const CircularProgress = ({ value, label, color, diff }: { value: number; label: string; color: string; diff: number }) => {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const progress = (100 - value) * circumference / 100;

    const getComparisonText = () => {
      if (label === "This Week") return "vs last week";
      if (label === "This Month") return "vs last month";
      return "vs last year";
    };

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-[56px] h-[56px]">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="28"
              cy="28"
              r={radius}
              stroke="currentColor"
              strokeWidth="2.5"
              fill="transparent"
              className="text-white/5"
            />
            <circle
              cx="28"
              cy="28"
              r={radius}
              stroke={color}
              strokeWidth="2.5"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={progress}
              className="transition-all duration-500"
              style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-base font-medium text-white">{value}%</span>
          </div>
        </div>
        <span className="mt-1 text-xs text-white/80">{label}</span>
        <div className={cn(
          "text-[10px] font-medium mt-0.5",
          diff > 0 ? "text-emerald-300" : "text-orange-300"
        )}>
          {diff > 0 ? '+' : '-'}{Math.abs(diff)}% {getComparisonText()}
        </div>
      </div>
    );
  };

  // Get the current month's calendar
  const getMonthCalendar = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null); // Empty cells for days before the 1st
    }
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
    <div className="space-y-1.5 p-1.5 ml-auto">
      {/* Progress Insights */}
      <div className="rounded-xl bg-[#0F4435] p-2.5">
        <h2 className="text-sm font-medium text-white mb-1.5">Progress Insights</h2>
        <div className="grid grid-cols-3 gap-1.5">
          <div className="rounded-lg bg-[#0B3B2D] p-1.5">
            <CircularProgress 
              value={habitStats.yearly} 
              label="This Year" 
              color="#4ade80"
              diff={habitStats.yearlyDiff}
            />
          </div>
          <div className="rounded-lg bg-[#0B3B2D] p-1.5">
            <CircularProgress 
              value={habitStats.weekly} 
              label="This Week" 
              color="#4ade80"
              diff={habitStats.weeklyDiff}
            />
          </div>
          <div className="rounded-lg bg-[#0B3B2D] p-1.5">
            <CircularProgress 
              value={habitStats.monthly} 
              label="This Month" 
              color="#4ade80"
              diff={habitStats.monthlyDiff}
            />
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="rounded-xl bg-[#0F4435] p-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <h2 className="text-sm font-medium text-white">Activity Timeline</h2>
          <div className="flex gap-3 text-xs">
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
        <div className="bg-[#0B3B2D] rounded-lg p-2.5 h-[130px]">
          <Timeline habits={habits} timeRange={timeRange} />
        </div>
      </div>

      {/* Monthly Calendar */}
      <div className="rounded-xl bg-[#0F4435] p-2.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevMonth}
              className="p-0.5 rounded-lg bg-white/5 text-white/30 hover:bg-emerald-500/20 hover:text-emerald-300 
                transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <h2 className="text-sm font-medium text-white">{getCurrentMonth()}</h2>
            <button
              onClick={handleNextMonth}
              disabled={monthOffset >= 0}
              className={`p-0.5 rounded-lg bg-white/5 text-white/30
                transition-all duration-200 transform hover:scale-105 active:scale-95
                ${monthOffset >= 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-emerald-500/20 hover:text-emerald-300'}`}
            >
              <ChevronRight className="w-3 h-3" />
            </button>
            {currentHabit && (
              <div className="text-xs text-emerald-400/90 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
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
          <div className="flex items-center gap-1">
            <button
              onClick={prevHabit}
              className="w-4 h-4 rounded-full bg-[#0B3B2D] hover:bg-[#0d4535] text-white/60 hover:text-white transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="w-2.5 h-2.5" />
            </button>
            <span className="text-xs text-white/60 bg-[#0B3B2D] px-1.5 py-0.5 rounded-full">{currentHabit?.title || 'No habits'}</span>
            <button
              onClick={nextHabit}
              className="w-4 h-4 rounded-full bg-[#0B3B2D] hover:bg-[#0d4535] text-white/60 hover:text-white transition-colors flex items-center justify-center"
            >
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-[10px] font-medium text-emerald-300/80 text-center">
              {day}
            </div>
          ))}
          {monthDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const date = new Date(today.getFullYear(), today.getMonth(), day);
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
                  "aspect-square rounded-sm flex items-center justify-center text-[10px] transition-all duration-300",
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

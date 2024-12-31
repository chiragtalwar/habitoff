import { format } from 'date-fns';
import { HabitWithCompletedDates } from '@/types/habit';
import { Plus } from 'lucide-react';

interface KPICardsProps {
  habits: HabitWithCompletedDates[];
}

export function KPICards({ habits }: KPICardsProps) {
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = format(new Date(), 'MMMM');

  if (habits.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 p-6 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 group-hover:from-emerald-500/20 group-hover:to-emerald-500/10 transition-all duration-500" />
          <div className="relative space-y-4">
            <h2 className="text-2xl font-light text-white/90">Welcome to Your Garden! 🌱</h2>
            <p className="text-white/70">Start your journey by planting your first habit. Click the green button below to begin.</p>
            <div className="flex items-center gap-2 text-emerald-400/90">
              <Plus className="w-5 h-5 animate-bounce" />
              <span>Add your first habit</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const monthlyCompletions = habits.reduce((acc, habit) => {
    const completionsThisMonth = habit.completedDates.filter(date => 
      date.startsWith(format(new Date(), 'yyyy-MM'))
    ).length;
    return acc + completionsThisMonth;
  }, 0);

  const totalPossibleCompletions = habits.length * new Date().getDate();
  const completionPercentage = Math.round((monthlyCompletions / totalPossibleCompletions) * 100);

  const currentStreak = habits.reduce((acc, habit) => Math.max(acc, habit.streak), 0);
  const bestStreak = habits.reduce((acc, habit) => Math.max(acc, habit.streak), 0);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Current Progress */}
      <div className="p-6 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 group-hover:from-emerald-500/20 group-hover:to-emerald-500/10 transition-all duration-500" />
        <div className="relative">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-medium text-white/90">Current Progress</h2>
              <p className="text-sm text-white/60">{currentMonth}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-400">⭐</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-baseline">
              <span className="text-5xl font-light text-white">{monthlyCompletions}</span>
              <span className="text-lg text-white/60">/{totalPossibleCompletions}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-emerald-400">{completionPercentage}% completion</span>
              <span className="text-sm text-white/60">↑ Same as Dec</span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Streak */}
      <div className="p-6 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-orange-500/5 group-hover:from-orange-500/20 group-hover:to-orange-500/10 transition-all duration-500" />
        <div className="relative">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-medium text-white/90">Current Streak</h2>
              <p className="text-sm text-white/60">days</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
              <span className="text-orange-400">🏆</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-baseline">
              <span className="text-5xl font-light text-white">{currentStreak}</span>
              <span className="text-lg text-white/60">best {bestStreak}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-orange-400">Building momentum!</span>
              <span className="text-sm text-white/60">↗️ Keep Going!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
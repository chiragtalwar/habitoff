import { Flame, ArrowUp, TrendingUp } from "lucide-react";

interface KPICardsProps {
  currentMonthStreak: number;
  longestStreak: number;
  currentCompletion?: number;
  lastWeekCompletion?: number;
}

export const KPICards = ({ 
  currentMonthStreak, 
  longestStreak,
  currentCompletion = 0,
  lastWeekCompletion
}: KPICardsProps) => {
  return (
    <div className="flex gap-6 p-4">
      <div className="group flex-1 relative bg-gradient-to-br from-habit via-habit/90 to-habit-accent rounded-xl p-6 
        shadow-[0_8px_30px_rgb(0,0,0,0.12),0_0_15px_rgba(0,255,0,0.15)] hover:shadow-[0_8px_30px_rgba(0,255,0,0.15),0_0_25px_rgba(0,255,0,0.2)]
        transition-all duration-300 ease-in-out hover:scale-[1.02]
        before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-habit-success/10 before:to-transparent before:opacity-0 
        before:transition-opacity before:duration-300 group-hover:before:opacity-100">
        <div className="relative">
          {/* Top section with title and flame */}
          <div className="flex justify-between items-start">
            <h3 className="text-white/90 text-sm font-medium tracking-wide">Current Month Streak</h3>
            <div className="bg-habit-success/20 p-2 rounded-full animate-pulse">
              <Flame className="w-5 h-5 text-habit-success animate-glow" />
            </div>
          </div>
          
          {/* Middle section with numbers */}
          <div className="mt-2">
            <div className="flex justify-between items-end mb-1">
              <p className="text-habit-success text-5xl font-bold tracking-tight">{currentMonthStreak}</p>
              <div className="flex flex-col items-end">
                <span className="text-white/90 text-base font-medium leading-none">{currentCompletion}%</span>
                <span className="text-white/50 text-[10px] leading-tight">completion</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-white/70 text-sm">days</p>
              {lastWeekCompletion !== undefined && (
                <div className="flex items-center text-habit-success text-xs">
                  <ArrowUp className="w-3 h-3 mr-0.5" />
                  <span>+{(currentCompletion - lastWeekCompletion).toFixed(1)}%</span>
                </div>
              )}
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
          {/* Top section with title and flame */}
          <div className="flex justify-between items-start">
            <h3 className="text-white/90 text-sm font-medium tracking-wide">Longest Streak</h3>
            <div className="bg-habit-highlight/20 p-2 rounded-full animate-pulse">
              <Flame className="w-5 h-5 text-habit-highlight animate-glow" />
            </div>
          </div>
          
          {/* Middle section with numbers */}
          <div className="mt-2">
            <div className="flex justify-between items-end mb-1">
              <p className="text-habit-highlight text-5xl font-bold tracking-tight">{longestStreak}</p>
              <div className="flex flex-col items-end">
                <span className="text-white/90 text-base font-medium leading-none">100%</span>
                <span className="text-white/50 text-[10px] leading-tight">completion</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-white/70 text-sm">March 2024</p>
              <div className="flex items-center text-habit-highlight text-xs">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                <span>Best Record</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
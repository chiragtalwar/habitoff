import { HabitWithCompletedDates } from "@/types/habit";
import { HabitCard } from "./HabitCard";

interface HabitContainerProps {
  habits: HabitWithCompletedDates[];
  onToggleHabit: (id: string) => Promise<void>;
  onDeleteHabit: (id: string) => Promise<void>;
}

export function HabitContainer({ habits, onToggleHabit, onDeleteHabit }: HabitContainerProps) {
  if (habits.length === 0) {
    return (
      <div className="mt-4 p-6 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent" />
        <div className="relative space-y-2">
          <p className="text-white/70 text-center">
            Your garden is ready for new habits to grow. Each habit you add will be like planting a seed that grows with your daily care.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          onToggle={() => onToggleHabit(habit.id)}
          onDelete={() => onDeleteHabit(habit.id)}
        />
      ))}
    </div>
  );
}
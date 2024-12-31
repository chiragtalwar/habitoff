import { HabitWithCompletedDates } from "@/types/habit";
import { HabitCard } from "./HabitCard";

interface HabitGridProps {
  habits: HabitWithCompletedDates[];
  onToggleHabit: (id: string) => void;
  onDeleteHabit: (id: string) => void;
}

export function HabitGrid({ habits, onToggleHabit, onDeleteHabit }: HabitGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {habits.map((habit) => (
        <HabitCard key={habit.id} habit={habit} onDelete={onDeleteHabit} onToggle={onToggleHabit} />
      ))}
    </div>
  );
} 
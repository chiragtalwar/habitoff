import { Habit } from '@/types/habit';
import { HabitCard } from '@/components/habits/HabitCard';

interface HabitGridProps {
  habits: Habit[];
}

export function HabitGrid({ habits }: HabitGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {habits.map((habit) => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
    </div>
  );
} 
import { Habit } from '@/types/habit';
import { HabitListItem } from '@/components/habits/HabitListItem';

interface HabitListProps {
  habits: Habit[];
}

export function HabitList({ habits }: HabitListProps) {
  return (
    <div className="space-y-4">
      {habits.map((habit) => (
        <HabitListItem key={habit.id} habit={habit} />
      ))}
    </div>
  );
} 
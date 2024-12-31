import { Plus } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { AddHabitDialog } from "@/components/ui/AddHabitDialog";
import { useHabits } from "@/hooks/useHabits";

export function AddHabitButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { addHabit } = useHabits();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 rounded-full w-14 h-14 p-0 bg-gradient-to-br from-habit-green-from to-habit-green-to hover:from-habit-green-to hover:to-habit-green-from shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center animate-fade-in"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Habit</DialogTitle>
          </DialogHeader>
          <AddHabitDialog 
            open={isOpen} 
            onOpenChange={setIsOpen} 
            onSubmit={async (habitData) => {
              await addHabit(habitData);
              setIsOpen(false);
            }} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
} 
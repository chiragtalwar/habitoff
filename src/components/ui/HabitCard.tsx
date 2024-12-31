import { Check, Trash2, Flame } from "lucide-react";
import { HabitWithCompletedDates } from "@/types/habit";
import { FallingLeaves } from "../animations/FallingLeaves";
import { useState } from "react";

const PLANT_TYPES: { value: string; emoji: string }[] = [
  { value: 'flower', emoji: '🌸' },
  { value: 'tree', emoji: '🌳' },
  { value: 'succulent', emoji: '🌵' },
  { value: 'herb', emoji: '🌿' }
];

interface HabitCardProps {
  habit: HabitWithCompletedDates;
  onToggle: () => Promise<void>;
  onDelete: () => Promise<void>;
}

export function HabitCard({ habit, onToggle, onDelete }: HabitCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const isCompleted = habit.completedDates.includes(today);
  const plantEmoji = PLANT_TYPES.find(p => p.value === habit.plant_type)?.emoji || '🌱';

  const handleToggle = async () => {
    if (!isCompleted) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 6000);
    }
    await onToggle();
  };

  return (
    <>
      <FallingLeaves 
        isAnimating={isAnimating} 
        plantType={habit.plant_type} 
      />

      <div className="group bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 group-hover:from-emerald-500/20 group-hover:to-emerald-500/10 transition-all duration-500" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/10 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl group-hover:animate-bounce">{plantEmoji}</span>
            </div>
            <div>
              <h3 className="text-white font-medium">{habit.title}</h3>
              <p className="text-white/60 text-sm">{habit.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg">
              <span className="text-white/90 font-medium">{habit.streak}</span>
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            
            <div className="flex gap-1">
              <button
                onClick={handleToggle}
                className={`p-2 rounded-lg transition-all duration-200 transform active:scale-95
                  ${isCompleted
                    ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' 
                    : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'}`}
              >
                <Check className="w-4 h-4" />
              </button>
              
              <button
                onClick={onDelete}
                className="p-2 rounded-lg bg-white/10 text-white/60 hover:bg-red-500/20 hover:text-red-400 
                  transition-all duration-200 transform active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 
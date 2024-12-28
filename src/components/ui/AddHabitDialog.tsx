import { useState } from "react";
import { X } from "lucide-react";
import { HabitFormData, HabitFrequency, PlantType } from "@/types/habit";

interface AddHabitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (habit: HabitFormData) => Promise<void>;
}

const PLANT_TYPES: { value: PlantType; emoji: string }[] = [
  { value: 'flower', emoji: '🌸' },
  { value: 'tree', emoji: '🌳' },
  { value: 'succulent', emoji: '🌵' },
  { value: 'herb', emoji: '🌿' }
];

const FREQUENCIES: { value: HabitFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export const AddHabitDialog = ({ isOpen, onClose, onSubmit }: AddHabitDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [plantType, setPlantType] = useState<PlantType>('flower');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        frequency,
        plant_type: plantType,
      });
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create habit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setFrequency('daily');
    setPlantType('flower');
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif text-white">New Habit</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-white/60 block">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-habit-green-from"
              placeholder="e.g., Morning Meditation"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/60 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-habit-green-from resize-none"
              placeholder="What's your goal?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/60 block">Frequency</label>
            <div className="grid grid-cols-3 gap-2">
              {FREQUENCIES.map((freq) => (
                <button
                  key={freq.value}
                  type="button"
                  onClick={() => setFrequency(freq.value)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                    frequency === freq.value
                      ? 'bg-habit-green-from text-white'
                      : 'bg-black/20 text-white/60 hover:bg-black/30'
                  }`}
                >
                  {freq.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/60 block">Choose Plant</label>
            <div className="grid grid-cols-4 gap-2">
              {PLANT_TYPES.map((plant) => (
                <button
                  key={plant.value}
                  type="button"
                  onClick={() => setPlantType(plant.value)}
                  className={`p-3 text-2xl rounded-lg transition-all duration-200 ${
                    plantType === plant.value
                      ? 'bg-habit-green-from scale-110'
                      : 'bg-black/20 hover:bg-black/30'
                  }`}
                >
                  {plant.emoji}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-habit-green-from to-habit-green-to hover:from-habit-green-to hover:to-habit-green-from text-white py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 relative"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
            ) : (
              'Plant Habit'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}; 
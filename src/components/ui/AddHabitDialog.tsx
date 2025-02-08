import { useState } from "react";
import { X } from "lucide-react";
import { HabitFormData, HabitFrequency, AnimalType } from "@/types/habit";

interface AddHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (habit: HabitFormData) => Promise<void>;
}

interface AnimalCompanionType {
  type: AnimalType;
  name: string;
  description: string;
  personality: string;
  stages: {
    baby: {
      image: string;
      name: string;
      description: string;
    };
    growing: {
      image: string;
      name: string;
      description: string;
    };
    achieved: {
      image: string;
      name: string;
      description: string;
    };
  };
}

const ANIMAL_COMPANIONS: AnimalCompanionType[] = [
  { 
    type: 'lion',
    name: 'Lion',
    description: 'Perfect for leadership and courage-building habits',
    personality: 'Brave & Majestic',
    stages: {
      baby: {
        image: '/animals/lion/baby.jpg',
        name: 'Lion Cub',
        description: 'A playful cub learning to roar'
      },
      growing: {
        image: '/animals/lion/growing.jpg',
        name: 'Young Lion',
        description: 'Growing stronger and braver each day'
      },
      achieved: {
        image: '/animals/lion/achieved.jpg',
        name: 'Majestic Lion',
        description: 'A true leader of the pride'
      }
    }
  },
  { 
    type: 'dog',
    name: 'Dog',
    description: 'Great for loyalty and daily routine habits',
    personality: 'Faithful & Enthusiastic',
    stages: {
      baby: {
        image: '/animals/dog/baby.jpg',
        name: 'Puppy',
        description: 'An eager puppy ready to learn'
      },
      growing: {
        image: '/animals/dog/growing.jpg',
        name: 'Young Dog',
        description: 'Building discipline and loyalty'
      },
      achieved: {
        image: '/animals/dog/achieved.jpg',
        name: 'Wise Dog',
        description: 'A master of dedication and routine'
      }
    }
  },
  { 
    type: 'elephant',
    name: 'Elephant',
    description: 'Perfect for memory and learning habits',
    personality: 'Wise & Gentle',
    stages: {
      baby: {
        image: '/animals/elephant/baby.jpg',
        name: 'Baby Elephant',
        description: 'Taking first steps towards wisdom'
      },
      growing: {
        image: '/animals/elephant/growing.jpg',
        name: 'Young Elephant',
        description: 'Growing in wisdom and strength'
      },
      achieved: {
        image: '/animals/elephant/achieved.jpg',
        name: 'Sage Elephant',
        description: 'A master of memory and wisdom'
      }
    }
  }
];

const FREQUENCIES: { value: HabitFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
];

export function AddHabitDialog({ open, onOpenChange, onSubmit }: AddHabitDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [animalType, setAnimalType] = useState<AnimalType>('lion');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnimalSelect = (animal: typeof ANIMAL_COMPANIONS[number]) => {
    setAnimalType(animal.type);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        frequency,
        animal_type: animalType,
      });
      resetForm();
      onOpenChange(false);
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
    setAnimalType('lion');
    setError(null);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl w-full max-w-md shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-serif text-white">New Habit</h2>
          <button
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-habit-green-from"
              placeholder="Habit name (e.g., Morning Meditation)"
              required
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-habit-green-from resize-none"
              placeholder="What's your goal? (optional)"
              rows={2}
            />
          </div>

          {/* Frequency */}
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

          {/* Animal Selection with Evolution Preview */}
          <div className="grid grid-cols-3 gap-3">
            {ANIMAL_COMPANIONS.map((animal) => (
              <button
                key={animal.type}
                type="button"
                onClick={() => handleAnimalSelect(animal)}
                className={`relative group p-2 rounded-lg transition-all duration-200
                  ${animalType === animal.type
                    ? 'bg-habit-green-from ring-2 ring-habit-green-to'
                    : 'bg-black/20 hover:bg-black/30'
                  }`}
              >
                {/* Evolution Preview on Hover */}
                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 rounded-lg 
                  bg-black/90 border border-white/10 shadow-xl transition-all duration-200
                  opacity-0 group-hover:opacity-100 pointer-events-none z-10`}>
                  <div className="grid grid-cols-3 gap-1">
                    {(['baby', 'growing', 'achieved'] as const).map((stage) => (
                      <div key={stage} className="text-center">
                        <img 
                          src={animal.stages[stage].image}
                          alt={animal.stages[stage].name}
                          className="w-12 h-12 object-cover rounded-md mx-auto"
                        />
                        <p className="text-white/90 text-[10px] mt-1">
                          {stage}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main Animal Display */}
                <div className="aspect-square relative mb-1">
                  <img 
                    src={animal.stages.baby.image}
                    alt={animal.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
                <p className="text-white/90 text-xs font-medium text-center">
                  {animal.name}
                </p>
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-habit-green-from to-habit-green-to hover:from-habit-green-to hover:to-habit-green-from 
              text-white py-2.5 rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
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
              'Start Journey'
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 
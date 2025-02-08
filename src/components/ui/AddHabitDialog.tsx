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
  const [selectedAnimal, setSelectedAnimal] = useState(ANIMAL_COMPANIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEvolution, setShowEvolution] = useState(false);

  const handleAnimalSelect = (animal: typeof ANIMAL_COMPANIONS[number]) => {
    setAnimalType(animal.type);
    setSelectedAnimal(animal);
    setShowEvolution(true);
    // Hide evolution preview after 3 seconds
    setTimeout(() => setShowEvolution(false), 3000);
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
    setSelectedAnimal(ANIMAL_COMPANIONS[0]);
    setError(null);
    setShowEvolution(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif text-white">New Habit</h2>
          <button
            onClick={() => onOpenChange(false)}
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
            <label className="text-sm text-white/60 block">Choose Your Companion</label>
            <div className="grid grid-cols-1 gap-2">
              {ANIMAL_COMPANIONS.map((animal) => (
                <button
                  key={animal.type}
                  type="button"
                  onClick={() => handleAnimalSelect(animal)}
                  className={`p-3 rounded-lg transition-all duration-200 flex items-center gap-3
                    ${animalType === animal.type
                      ? 'bg-habit-green-from scale-[1.02]'
                      : 'bg-black/20 hover:bg-black/30'
                    }`}
                >
                  <div className="w-16 h-16 relative">
                    <img 
                      src={animal.stages.baby.image} 
                      alt={animal.stages.baby.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col items-start flex-1">
                    <span className="text-white font-medium">{animal.name}</span>
                    <span className="text-white/60 text-xs">{animal.description}</span>
                    <span className="text-white/40 text-xs italic mt-1">{animal.personality}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Evolution Preview */}
          {showEvolution && (
            <div className="bg-black/30 rounded-lg p-4 space-y-4">
              <h3 className="text-white/80 text-sm font-medium">Evolution Journey</h3>
              <div className="grid grid-cols-3 gap-4">
                {(['baby', 'growing', 'achieved'] as const).map((stage) => (
                  <div key={stage} className="text-center space-y-2">
                    <div className="w-full aspect-square relative">
                      <img 
                        src={selectedAnimal.stages[stage].image}
                        alt={selectedAnimal.stages[stage].name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-white/90 text-xs font-medium">
                        {selectedAnimal.stages[stage].name}
                      </p>
                      <p className="text-white/50 text-[10px]">
                        {selectedAnimal.stages[stage].description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
              'Start Journey with ' + selectedAnimal.name
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 
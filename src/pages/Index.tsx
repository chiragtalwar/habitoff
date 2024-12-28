import { Plus, BarChart3, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { QuoteSection } from "../components/ui/QuoteSection";
import { KPICards } from "@/components/ui/KPICards";
import { HabitContainer } from "@/components/ui/HabitContainer";
import { AddHabitDialog } from "@/components/ui/AddHabitDialog";
import { useEffect, useState } from "react";
import { HabitService } from "@/services/habitService";
import { HabitFormData, HabitWithCompletedDates } from "@/types/habit";
import { supabase } from "@/lib/supabase";

const Index = () => {
  const { signOut, user } = useAuth();
  const [habits, setHabits] = useState<HabitWithCompletedDates[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchHabits();
    }
  }, [user]);

  const fetchHabits = async () => {
    if (!user?.id) return;
    
    try {
      const fetchedHabits = await HabitService.fetchHabits(user.id);
      setHabits(fetchedHabits);
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleHabit = async (habitId: string) => {
    try {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      const today = new Date().toISOString().split('T')[0];
      const isCompleted = habit.completedDates.includes(today);
      
      let newCompletedDates: string[];
      let newStreak: number;

      if (isCompleted) {
        // Remove today's completion
        newCompletedDates = habit.completedDates.filter(date => date !== today);
        newStreak = Math.max(0, habit.streak - 1);
      } else {
        // Add today's completion
        newCompletedDates = [...habit.completedDates, today];
        
        // Calculate new streak
        const sortedDates = [...newCompletedDates].sort();
        let streak = 1;
        for (let i = sortedDates.length - 2; i >= 0; i--) {
          const curr = new Date(sortedDates[i + 1]);
          const prev = new Date(sortedDates[i]);
          const diffDays = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 1) {
            streak++;
          } else {
            break;
          }
        }
        newStreak = streak;
      }

      // Update in Supabase
      const { error } = await supabase
        .from('habits')
        .update({
          last_completed: newCompletedDates,
          streak: newStreak,
          updated_at: new Date().toISOString()
        })
        .eq('id', habitId);

      if (error) throw error;

      // Update local state
      setHabits(habits.map(h => 
        h.id === habitId 
          ? { ...h, completedDates: newCompletedDates, streak: newStreak }
          : h
      ));
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  const deleteHabit = async (habitId: string) => {
    try {
      await HabitService.deleteHabit(habitId);
      setHabits(habits.filter(h => h.id !== habitId));
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const calculateStreaks = (completedDates: string[]) => {
    if (!completedDates.length) return { currentStreak: 0, longestStreak: 0 };

    const sortedDates = [...completedDates].sort();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate = new Date(sortedDates[0]);

    // Calculate longest streak
    for (let i = 0; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i]);
      const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
      
      longestStreak = Math.max(longestStreak, tempStreak);
      lastDate = currentDate;
    }

    // Calculate current streak
    const lastCompletedDate = new Date(sortedDates[sortedDates.length - 1]);
    const diffFromToday = Math.floor((today.getTime() - lastCompletedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffFromToday <= 1) {
      currentStreak = 1;
      for (let i = sortedDates.length - 2; i >= 0; i--) {
        const currentDate = new Date(sortedDates[i]);
        const prevDate = new Date(sortedDates[i + 1]);
        const diffDays = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    return { currentStreak, longestStreak };
  };

  const { currentMonthStreak, longestStreak, currentCompletion, lastWeekCompletion } = (() => {
    const allCompletedDates = habits.reduce((acc: string[], habit) => [...acc, ...habit.completedDates], []);
    const uniqueDates = [...new Set(allCompletedDates)];
    const { currentStreak, longestStreak } = calculateStreaks(uniqueDates);

    // Calculate current completion
    const today = new Date().toISOString().split('T')[0];
    const completedToday = habits.filter(habit => habit.completedDates.includes(today)).length;
    const currentCompletion = habits.length ? Math.round((completedToday / habits.length) * 100) : 0;

    // Calculate last week's completion
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastWeekDate = lastWeek.toISOString().split('T')[0];
    const completedLastWeek = habits.filter(habit => 
      habit.completedDates.includes(lastWeekDate)
    ).length;
    const lastWeekCompletion = habits.length ? Math.round((completedLastWeek / habits.length) * 100) : 0;

    return {
      currentMonthStreak: currentStreak,
      longestStreak,
      currentCompletion,
      lastWeekCompletion
    };
  })();

  const createHabit = async (habitData: HabitFormData) => {
    if (!user?.id) {
      console.error('No user ID found');
      return;
    }

    try {
      const newHabit = await HabitService.createHabit(user.id, habitData);
      setHabits(prevHabits => [...prevHabits, newHabit]);
      setIsAddHabitOpen(false);
    } catch (error) {
      console.error('Error creating habit:', error);
      throw error;
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-zinc-900 grid place-items-center">
      <div className="text-white">Loading...</div>
    </div>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 10, 100), rgba(0, 0, 0, 0.1)), url('/lovable-uploads/80968ddb-e188-4ea5-a8af-e82c7fa02f22.png'`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 pb-8 px-8">
          <div className="flex items-center justify-between md:col-span-2 mb-4">
            <h1 className="text-4xl font-thin tracking-[0.2em] bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">
              HABITO
            </h1>
            <button
              onClick={signOut}
              className="text-white/60 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center justify-center h-[calc(100vh-200px)] sticky top-[100px]">
            <QuoteSection />
          </div>
          
          <div className="space-y-2 -mt-14">
            <KPICards 
              currentMonthStreak={currentMonthStreak} 
              longestStreak={longestStreak}
              currentCompletion={currentCompletion}
              lastWeekCompletion={lastWeekCompletion}
            />
            <HabitContainer 
              habits={habits} 
              onToggleHabit={toggleHabit}
              onDeleteHabit={deleteHabit}
            />
          </div>
        </div>

        {/* Add Habit Button */}
        <button 
          onClick={() => setIsAddHabitOpen(true)}
          className="fixed bottom-8 right-8 rounded-full w-14 h-14 p-0 bg-gradient-to-br from-habit-green-from to-habit-green-to hover:from-habit-green-to hover:to-habit-green-from shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center animate-fade-in"
        >
          <Plus className="w-6 h-6 text-white" />
        </button>

        {/* Analytics Button */}
        <button 
          className="fixed bottom-24 right-8 rounded-full w-14 h-14 p-0 bg-gradient-to-br from-zinc-900 to-zinc-800 hover:from-zinc-800 hover:to-zinc-700 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center animate-fade-in"
        >
          <BarChart3 className="w-6 h-6 text-white" />
        </button>

        <AddHabitDialog
          isOpen={isAddHabitOpen}
          onClose={() => setIsAddHabitOpen(false)}
          onSubmit={createHabit}
        />
      </div>
    </div>
  );
};

export default Index; 
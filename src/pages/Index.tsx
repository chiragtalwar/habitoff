import { Plus, BarChart3 } from "lucide-react";
// import { useAuth } from "@/contexts/AuthContext";
import { QuoteSection } from "@/components/ui/QuoteSection";
import { KPICards } from "@/components/ui/KPICards";
import { HabitContainer } from "@/components/ui/HabitContainer";
import { AddHabitDialog } from "@/components/ui/AddHabitDialog";
import { useState } from "react";
import { useHabits } from "@/hooks/useHabits";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AnalyticsPanel } from "@/components/ui/AnalyticsPanel";
import { TestPaymentFlow } from "@/components/subscription/TestPaymentFlow";

export default function Index() {
  const { habits, addHabit, toggleHabit, deleteHabit } = useHabits();
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);

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
          </div>
          
          <div className="flex items-center justify-center h-[calc(100vh-200px)] sticky top-[100px]">
            <QuoteSection />
          </div>
          
          <div className="space-y-2 -mt-14">
            {/* Payment Test Component - REMOVE IN PRODUCTION */}
            <TestPaymentFlow />
            
            <KPICards habits={habits} />
            <HabitContainer 
              habits={habits} 
              onToggleHabit={toggleHabit}
              onDeleteHabit={deleteHabit}
            />
          </div>
        </div>

        {/* Analytics Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <button 
              className="fixed bottom-24 right-8 rounded-full w-14 h-14 p-0 bg-gradient-to-br from-zinc-900 to-zinc-800 hover:from-zinc-800 hover:to-zinc-700 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
            >
              <BarChart3 className="w-6 h-6 text-white" />
            </button>
          </SheetTrigger>
          <SheetContent 
            side="right" 
            className="w-full max-w-2xl bg-[url('/freepik__candid-image-photography-natural-textures-highly-r__93443.jpeg')] bg-cover bg-center border-white/20 p-0"
          >
            <div className="px-8 py-12 min-h-screen">
              <AnalyticsPanel habits={habits} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Add Habit Button */}
        <button 
          onClick={() => setIsAddHabitOpen(true)}
          className="fixed bottom-8 right-8 rounded-full w-14 h-14 p-0 bg-gradient-to-br from-habit-green-from to-habit-green-to hover:from-habit-green-to hover:to-habit-green-from shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        >
          <Plus className="w-6 h-6 text-yellow-500" />
        </button>

        {/* Add Habit Dialog */}
        <AddHabitDialog 
          open={isAddHabitOpen} 
          onOpenChange={setIsAddHabitOpen}
          onSubmit={async (habitData) => {
            await addHabit(habitData);
          }}
        />
      </div>
    </div>
  );
} 
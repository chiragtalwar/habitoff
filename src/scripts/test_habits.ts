import 'dotenv/config';
import { supabase } from '../lib/supabase';
import { habitService } from '../services/habitService';

async function testHabitOperations() {
  try {
    // 1. Sign in (you need to be signed in first)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ No user logged in. Please sign in first.');
      return;
    }
    console.log('✅ User logged in:', user.id);

    // 2. Add a test habit
    const testHabit = {
      title: 'Test Habit',
      description: 'Testing habit operations',
      frequency: 'daily',
      plant_type: 'flower'
    } as const;

    console.log('\nAdding test habit...');
    await habitService.addHabit(user.id, testHabit);
    
    // 3. Get habits and verify
    console.log('\nFetching habits...');
    const habits = await habitService.getHabits(user.id);
    const addedHabit = habits.find(h => h.title === testHabit.title);
    
    if (!addedHabit) {
      throw new Error('Failed to find added habit');
    }
    console.log('✅ Habit added successfully:', addedHabit.id);

    // 4. Mark habit as complete
    console.log('\nMarking habit as complete...');
    await habitService.markHabitComplete(user.id, addedHabit.id);
    
    // 5. Verify completion
    const updatedHabits = await habitService.getHabits(user.id);
    const completedHabit = updatedHabits.find(h => h.id === addedHabit.id);
    
    if (!completedHabit || completedHabit.completedDates.length === 0) {
      throw new Error('Failed to mark habit as complete');
    }
    console.log('✅ Habit marked as complete');
    console.log('Completion dates:', completedHabit.completedDates);
    console.log('Streak:', completedHabit.streak);

    // 6. Unmark completion
    console.log('\nUnmarking habit completion...');
    await habitService.unmarkHabitComplete(user.id, addedHabit.id);
    
    // 7. Verify unmarking
    const finalHabits = await habitService.getHabits(user.id);
    const unmarkedHabit = finalHabits.find(h => h.id === addedHabit.id);
    
    if (!unmarkedHabit || unmarkedHabit.completedDates.length > 0) {
      throw new Error('Failed to unmark habit');
    }
    console.log('✅ Habit unmarked successfully');

    // 8. Delete test habit
    console.log('\nCleaning up - deleting test habit...');
    await habitService.deleteHabit(user.id, addedHabit.id);
    
    // 9. Verify deletion
    const remainingHabits = await habitService.getHabits(user.id);
    if (remainingHabits.some(h => h.id === addedHabit.id)) {
      throw new Error('Failed to delete habit');
    }
    console.log('✅ Test habit deleted successfully');

    console.log('\n✨ All tests passed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

// Run the tests
testHabitOperations(); 
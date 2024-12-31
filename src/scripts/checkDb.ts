import 'dotenv/config';
import { checkHabitsTable, addSampleHabits } from '../lib/supabase';

async function main() {
  const result = await checkHabitsTable();
  
  if (result.exists && result.recordCount === 0) {
    console.log('\nTable exists but is empty. Adding sample habits...');
    await addSampleHabits();
    
    // Check again to see the new records
    console.log('\nChecking updated table:');
    await checkHabitsTable();
  }
}

main(); 
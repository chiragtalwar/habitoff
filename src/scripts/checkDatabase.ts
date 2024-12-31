import { supabase } from '../lib/supabase';

const REQUIRED_COLUMNS = {
  id: 'uuid',
  user_id: 'uuid',
  title: 'text',
  description: 'text',
  frequency: 'text',
  plant_type: 'text',
  completed_dates: 'text[]',
  created_at: 'timestamp with time zone',
  updated_at: 'timestamp with time zone'
};

const REQUIRED_POLICIES = [
  'Users can view their own habits',
  'Users can create their own habits',
  'Users can update their own habits',
  'Users can delete their own habits'
];

async function validateDatabase() {
  console.log('Checking database structure...');

  try {
    // Get table information
    const { data: columns, error: columnError } = await supabase
      .rpc('get_table_info', { table_name: 'habits' });

    if (columnError) {
      console.error('Error getting table info:', columnError);
      return;
    }

    // Check columns
    console.log('\nChecking columns:');
    const missingColumns = [];
    for (const [colName, colType] of Object.entries(REQUIRED_COLUMNS)) {
      const column = columns?.find((col: any) => col.column_name === colName);
      if (!column) {
        missingColumns.push(colName);
        console.log(`❌ Missing column: ${colName} (${colType})`);
      } else {
        console.log(`✅ Found column: ${colName}`);
      }
    }

    // Get RLS policies
    const { data: policies, error: policyError } = await supabase
      .rpc('get_policies', { table_name: 'habits' });

    if (policyError) {
      console.error('Error getting policies:', policyError);
      return;
    }

    // Check policies
    console.log('\nChecking RLS policies:');
    const missingPolicies = [];
    for (const policy of REQUIRED_POLICIES) {
      const hasPolicy = policies?.some((p: any) => p.policy_name === policy);
      if (!hasPolicy) {
        missingPolicies.push(policy);
        console.log(`❌ Missing policy: ${policy}`);
      } else {
        console.log(`✅ Found policy: ${policy}`);
      }
    }

    // Summary
    console.log('\nSummary:');
    if (missingColumns.length === 0 && missingPolicies.length === 0) {
      console.log('✅ Database structure is correct!');
    } else {
      console.log('❌ Database needs updates:');
      if (missingColumns.length > 0) {
        console.log('Missing columns:', missingColumns);
      }
      if (missingPolicies.length > 0) {
        console.log('Missing policies:', missingPolicies);
      }
    }

  } catch (error) {
    console.error('Error validating database:', error);
  }
}

// Run the validation
validateDatabase(); 
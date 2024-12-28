import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase credentials
const supabaseUrl = 'https://qdwbkkkutvgqdkrzknep.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkd2Jra2t1dHZncWRrcnprbmVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0MDg2OTQsImV4cCI6MjA1MDk4NDY5NH0.V2hBROwLoBN4oBI8aMRBEbsYsyHOMGEIFDBwhn35PFw';

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Tables = {
  habits: {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    frequency: 'daily' | 'weekly' | 'monthly';
    plant_type: 'flower' | 'tree' | 'succulent' | 'herb';
    streak: number;
    last_completed: string | null;
    created_at: string;
    updated_at: string;
  };
}; 
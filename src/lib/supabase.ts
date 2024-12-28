import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = 'https://qdwbkkkutvgqdkrzknep.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkd2Jra2t1dHZncWRrcnprbmVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0MDg2OTQsImV4cCI6MjA1MDk4NDY5NH0.V2hBROwLoBN4oBI8aMRBEbsYsyHOMGEIFDBwhn35PFw';

// Custom storage implementation for Chrome extension
const chromeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    const result = await chrome.storage.local.get([key]);
    return result[key] || null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await chrome.storage.local.set({ [key]: value });
  },
  removeItem: async (key: string): Promise<void> => {
    await chrome.storage.local.remove([key]);
  },
};

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: chromeStorage,
    detectSessionInUrl: false
  },
});

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
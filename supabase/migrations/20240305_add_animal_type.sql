-- Add animal_type column to habits table
ALTER TABLE habits ADD COLUMN IF NOT EXISTS animal_type text NOT NULL DEFAULT 'lion';

-- Add check constraint to ensure valid animal types
ALTER TABLE habits ADD CONSTRAINT habits_animal_type_check 
  CHECK (animal_type IN ('lion', 'dog', 'elephant'));

-- Update existing habits to have a default animal type
UPDATE habits SET animal_type = 'lion' WHERE animal_type IS NULL; 
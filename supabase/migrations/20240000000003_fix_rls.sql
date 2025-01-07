-- First check if habit_completions table exists, if not create it
CREATE TABLE IF NOT EXISTS habit_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(habit_id, completed_at)
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS habit_completions_habit_id_idx ON habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS habit_completions_user_id_idx ON habit_completions(user_id);
CREATE INDEX IF NOT EXISTS habit_completions_completed_at_idx ON habit_completions(completed_at);

-- Enable RLS on all tables
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for habit_completions
DROP POLICY IF EXISTS "Users can manage their own habit completions" ON habit_completions;

-- Create separate policies for habit_completions
CREATE POLICY "Users can view their own habit completions"
    ON habit_completions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM habits 
            WHERE habits.id = habit_completions.habit_id 
            AND habits.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own habit completions"
    ON habit_completions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM habits 
            WHERE habits.id = habit_id 
            AND habits.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own habit completions"
    ON habit_completions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM habits 
            WHERE habits.id = habit_completions.habit_id 
            AND habits.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own habit completions"
    ON habit_completions FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM habits 
            WHERE habits.id = habit_completions.habit_id 
            AND habits.user_id = auth.uid()
        )
    );

-- Create trigger to update updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_habit_completions_updated_at ON habit_completions;
CREATE TRIGGER update_habit_completions_updated_at
    BEFORE UPDATE ON habit_completions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify policies are created
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname; 
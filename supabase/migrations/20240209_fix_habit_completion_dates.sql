ALTER TABLE habit_completions ADD CONSTRAINT unique_habit_completion_per_day UNIQUE (habit_id, DATE(completed_date));

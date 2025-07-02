/*
  # Create missing tables for PrepBuddy

  1. New Tables
    - `progress` - tracks user progress with current day and streak
    - `user_settings` - stores notification preferences

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own data

  3. Functions and Triggers
    - Create update function for timestamps
    - Add trigger for user_settings updated_at
*/

-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL,
  current_day integer DEFAULT 1,
  streak integer DEFAULT 0,
  last_completed timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create user_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_settings (
  user_id uuid PRIMARY KEY,
  email_notifications boolean DEFAULT true,
  daily_reminders boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index on user_settings.user_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'user_settings' AND indexname = 'user_settings_user_id_idx'
  ) THEN
    CREATE INDEX user_settings_user_id_idx ON user_settings(user_id);
  END IF;
END $$;

-- Enable RLS on progress table
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_settings table
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DO $$
BEGIN
  -- Drop and recreate progress policies
  DROP POLICY IF EXISTS "Users can manage their own progress" ON progress;
  CREATE POLICY "Users can manage their own progress"
    ON progress
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  -- Drop and recreate user_settings policies
  DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
  DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
  DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
  DROP POLICY IF EXISTS "Users can manage their own settings" ON user_settings;

  CREATE POLICY "Users can view their own settings"
    ON user_settings
    FOR SELECT
    TO public
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert their own settings"
    ON user_settings
    FOR INSERT
    TO public
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update their own settings"
    ON user_settings
    FOR UPDATE
    TO public
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can manage their own settings"
    ON user_settings
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
END $$;

-- Add trigger to user_settings for updating updated_at
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
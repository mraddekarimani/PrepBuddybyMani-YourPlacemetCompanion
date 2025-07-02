/*
  # Fix RLS policies for progress table

  1. Security Updates
    - Drop existing policy that uses uid() function
    - Create new policies using auth.uid() function for proper authentication
    - Add separate INSERT and UPDATE policies for better granular control
    - Ensure users can only access their own progress data

  2. Changes
    - Replace uid() with auth.uid() in all policies
    - Add explicit INSERT policy for creating progress records
    - Add explicit UPDATE policy for modifying progress records
    - Add explicit SELECT policy for reading progress records
*/

-- Drop the existing policy that uses uid() function
DROP POLICY IF EXISTS "Users can manage their own progress" ON progress;

-- Create new policies using auth.uid() function
CREATE POLICY "Users can insert their own progress"
  ON progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select their own progress"
  ON progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress"
  ON progress
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
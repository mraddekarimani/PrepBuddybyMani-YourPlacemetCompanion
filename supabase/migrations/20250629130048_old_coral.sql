/*
  # Enhanced Interview System Schema

  1. Updates to existing tables
    - Add new columns to interview_sessions for enhanced features
    - Add indexes for better performance

  2. New functionality
    - Support for different interview types (coding, system-design, behavioral)
    - Platform-specific interview styles
    - Enhanced analytics and tracking
*/

-- Add new columns to interview_sessions table
DO $$
BEGIN
  -- Add interview_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'interview_sessions' AND column_name = 'interview_type'
  ) THEN
    ALTER TABLE interview_sessions ADD COLUMN interview_type text DEFAULT 'standard';
  END IF;

  -- Add platform_focus column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'interview_sessions' AND column_name = 'platform_focus'
  ) THEN
    ALTER TABLE interview_sessions ADD COLUMN platform_focus text DEFAULT 'general';
  END IF;

  -- Add hints_used column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'interview_sessions' AND column_name = 'hints_used'
  ) THEN
    ALTER TABLE interview_sessions ADD COLUMN hints_used integer DEFAULT 0;
  END IF;

  -- Add code_submissions column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'interview_sessions' AND column_name = 'code_submissions'
  ) THEN
    ALTER TABLE interview_sessions ADD COLUMN code_submissions jsonb DEFAULT '[]';
  END IF;

  -- Add performance_metrics column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'interview_sessions' AND column_name = 'performance_metrics'
  ) THEN
    ALTER TABLE interview_sessions ADD COLUMN performance_metrics jsonb DEFAULT '{}';
  END IF;
END $$;

-- Add check constraint for interview_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'interview_sessions_interview_type_check'
  ) THEN
    ALTER TABLE interview_sessions 
    ADD CONSTRAINT interview_sessions_interview_type_check 
    CHECK (interview_type IN ('standard', 'coding', 'system-design', 'behavioral'));
  END IF;
END $$;

-- Create additional indexes for better query performance
CREATE INDEX IF NOT EXISTS interview_sessions_interview_type_idx ON interview_sessions(interview_type);
CREATE INDEX IF NOT EXISTS interview_sessions_platform_focus_idx ON interview_sessions(platform_focus);
CREATE INDEX IF NOT EXISTS interview_sessions_user_category_idx ON interview_sessions(user_id, category);
CREATE INDEX IF NOT EXISTS interview_sessions_difficulty_score_idx ON interview_sessions(difficulty, overall_score);

-- Create a view for interview analytics
CREATE OR REPLACE VIEW interview_analytics AS
SELECT 
  user_id,
  category,
  difficulty,
  interview_type,
  platform_focus,
  COUNT(*) as total_interviews,
  AVG(overall_score) as avg_score,
  MAX(overall_score) as best_score,
  MIN(overall_score) as worst_score,
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at))/60) as avg_duration_minutes,
  SUM(hints_used) as total_hints_used,
  COUNT(CASE WHEN overall_score >= 80 THEN 1 END) as excellent_count,
  COUNT(CASE WHEN overall_score >= 60 AND overall_score < 80 THEN 1 END) as good_count,
  COUNT(CASE WHEN overall_score < 60 THEN 1 END) as needs_improvement_count
FROM interview_sessions 
WHERE completed_at IS NOT NULL
GROUP BY user_id, category, difficulty, interview_type, platform_focus;

-- Enable RLS on the view (inherits from base table)
ALTER VIEW interview_analytics SET (security_invoker = true);

-- Create function to get user interview statistics
CREATE OR REPLACE FUNCTION get_user_interview_stats(target_user_id uuid)
RETURNS TABLE (
  total_interviews bigint,
  avg_score numeric,
  improvement_trend numeric,
  favorite_category text,
  strongest_difficulty text,
  total_time_spent interval
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH user_stats AS (
    SELECT 
      COUNT(*) as total_count,
      AVG(overall_score) as average_score,
      SUM(EXTRACT(EPOCH FROM (completed_at - started_at))) as total_seconds
    FROM interview_sessions 
    WHERE user_id = target_user_id AND completed_at IS NOT NULL
  ),
  trend_stats AS (
    SELECT 
      CASE 
        WHEN COUNT(*) >= 2 THEN
          (SELECT overall_score FROM interview_sessions 
           WHERE user_id = target_user_id AND completed_at IS NOT NULL 
           ORDER BY completed_at DESC LIMIT 1) -
          (SELECT overall_score FROM interview_sessions 
           WHERE user_id = target_user_id AND completed_at IS NOT NULL 
           ORDER BY completed_at ASC LIMIT 1)
        ELSE 0
      END as trend
    FROM interview_sessions 
    WHERE user_id = target_user_id AND completed_at IS NOT NULL
  ),
  category_stats AS (
    SELECT category, COUNT(*) as count
    FROM interview_sessions 
    WHERE user_id = target_user_id AND completed_at IS NOT NULL
    GROUP BY category
    ORDER BY count DESC
    LIMIT 1
  ),
  difficulty_stats AS (
    SELECT difficulty, AVG(overall_score) as avg_score
    FROM interview_sessions 
    WHERE user_id = target_user_id AND completed_at IS NOT NULL
    GROUP BY difficulty
    ORDER BY avg_score DESC
    LIMIT 1
  )
  SELECT 
    us.total_count,
    ROUND(us.average_score, 2),
    ROUND(ts.trend, 2),
    cs.category,
    ds.difficulty,
    INTERVAL '1 second' * us.total_seconds
  FROM user_stats us
  CROSS JOIN trend_stats ts
  LEFT JOIN category_stats cs ON true
  LEFT JOIN difficulty_stats ds ON true;
END;
$$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION get_user_interview_stats(uuid) TO authenticated;
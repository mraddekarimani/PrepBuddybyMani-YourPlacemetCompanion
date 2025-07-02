-- Update RLS policies to include category validation
CREATE POLICY "Users can only add tasks with categories they own"
ON tasks
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM categories 
    WHERE categories.id = tasks.category_id 
    AND categories.user_id = auth.uid()
  )
);

CREATE POLICY "Users can only update tasks with categories they own"
ON tasks
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM categories 
    WHERE categories.id = tasks.category_id 
    AND categories.user_id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM categories 
    WHERE categories.id = tasks.category_id 
    AND categories.user_id = auth.uid()
  )
);
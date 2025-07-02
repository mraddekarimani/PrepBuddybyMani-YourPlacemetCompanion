export interface Task {
  id: string;
  title: string;
  description?: string;
  day: number;
  category_id: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  created_at: string;  // Updated to match database column name
}

export interface Category {
  id: string;
  name: string;
  color: string;
}
import React, { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { Check, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Task, Category } from '../types';

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { toggleComplete, deleteTask, updateTask, categories } = useTaskContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description || '');
  const [editedCategoryId, setEditedCategoryId] = useState(task.category_id);
  const [editedPriority, setEditedPriority] = useState(task.priority);

  const category = categories.find(cat => cat.id === task.category_id);

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedTitle(task.title);
      setEditedDescription(task.description || '');
      setEditedCategoryId(task.category_id);
      setEditedPriority(task.priority);
    }
  };

  const handleSaveEdit = () => {
    updateTask({
      ...task,
      title: editedTitle,
      description: editedDescription,
      category_id: editedCategoryId,
      priority: editedPriority as 'low' | 'medium' | 'high',
    });
    setIsEditing(false);
  };

  return (
    <div className={`mb-4 rounded-lg border transition-all duration-200 ${task.completed ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'}`}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 w-full">
            <button
              onClick={() => toggleComplete(task.id)}
              className={`flex-shrink-0 mt-1 h-5 w-5 rounded-full border ${task.completed ? 'bg-indigo-500 border-indigo-500 dark:bg-indigo-600 dark:border-indigo-600' : 'border-gray-300 dark:border-gray-600'} flex items-center justify-center transition-colors duration-200`}
              aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
            >
              {task.completed && <Check className="h-3 w-3 text-white" />}
            </button>
            
            <div className="w-full">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Task title"
                  />
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Task description (optional)"
                    rows={3}
                  />
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    <select
                      value={editedCategoryId}
                      onChange={(e) => setEditedCategoryId(e.target.value)}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={editedPriority}
                      onChange={(e) => setEditedPriority(e.target.value as 'low' | 'medium' | 'high')}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors duration-200"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <h3 className={`font-medium text-base ${task.completed ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center space-x-1 ml-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                      {category && (
                        <span className={`text-xs px-2 py-1 rounded-full text-white ${category.color}`}>
                          {category.name}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {task.description && (
                    <div className="mt-2">
                      <button
                        onClick={handleToggleExpand}
                        className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-200"
                      >
                        {isExpanded ? 'Hide details' : 'Show details'}
                        {isExpanded ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          
          {!isEditing && (
            <div className="flex items-center space-x-2 ml-2">
              <button
                onClick={handleToggleEdit}
                className="text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-200"
                aria-label="Edit task"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200"
                aria-label="Delete task"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        
        {isExpanded && task.description && !isEditing && (
          <div className="mt-3 text-sm text-gray-700 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700 pt-3">
            {task.description}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
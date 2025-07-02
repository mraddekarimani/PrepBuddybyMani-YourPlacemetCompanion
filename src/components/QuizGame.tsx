import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Brain, 
  Code, 
  Calculator, 
  Trophy, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Play, 
  Star,
  Target,
  Zap,
  Award,
  TrendingUp,
  BookOpen,
  Gamepad2,
  Timer,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  Flag
} from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  points: number;
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  timeSpent: number;
  correctAnswers: number;
  category: string;
  difficulty: string;
}

interface GameStats {
  totalQuizzes: number;
  totalScore: number;
  averageScore: number;
  bestStreak: number;
  categoriesCompleted: string[];
}

const QuizGame: React.FC = () => {
  const { user } = useAuth();
  const [gameMode, setGameMode] = useState<'menu' | 'quiz' | 'results' | 'stats'>('menu');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { 
      id: 'dsa', 
      name: 'Data Structures & Algorithms', 
      icon: <Code className="h-6 w-6" />,
      color: 'bg-blue-500',
      description: 'Arrays, Trees, Graphs, Sorting, Searching'
    },
    { 
      id: 'aptitude', 
      name: 'Quantitative Aptitude', 
      icon: <Calculator className="h-6 w-6" />,
      color: 'bg-green-500',
      description: 'Math, Logic, Reasoning, Probability'
    },
    { 
      id: 'programming', 
      name: 'Programming Concepts', 
      icon: <Brain className="h-6 w-6" />,
      color: 'bg-purple-500',
      description: 'OOP, Design Patterns, Best Practices'
    },
    { 
      id: 'system-design', 
      name: 'System Design', 
      icon: <Target className="h-6 w-6" />,
      color: 'bg-orange-500',
      description: 'Scalability, Architecture, Databases'
    },
    { 
      id: 'cs-fundamentals', 
      name: 'CS Fundamentals', 
      icon: <BookOpen className="h-6 w-6" />,
      color: 'bg-indigo-500',
      description: 'OS, Networks, DBMS, Compilers'
    }
  ];

  // Sample questions database
  const questionBank: Record<string, Question[]> = {
    dsa: [
      {
        id: 'dsa_1',
        question: 'What is the time complexity of binary search in a sorted array?',
        options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
        correctAnswer: 1,
        explanation: 'Binary search divides the search space in half with each comparison, resulting in O(log n) time complexity.',
        difficulty: 'easy',
        category: 'dsa',
        points: 10
      },
      {
        id: 'dsa_2',
        question: 'Which data structure is best for implementing a LRU cache?',
        options: ['Array', 'Stack', 'HashMap + Doubly Linked List', 'Binary Tree'],
        correctAnswer: 2,
        explanation: 'LRU cache requires O(1) access and update operations, which is achieved using HashMap for fast lookup and Doubly Linked List for maintaining order.',
        difficulty: 'medium',
        category: 'dsa',
        points: 20
      },
      {
        id: 'dsa_3',
        question: 'What is the worst-case time complexity of QuickSort?',
        options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'],
        correctAnswer: 1,
        explanation: 'QuickSort has O(n²) worst-case complexity when the pivot is always the smallest or largest element, but O(n log n) average case.',
        difficulty: 'medium',
        category: 'dsa',
        points: 20
      }
    ],
    aptitude: [
      {
        id: 'apt_1',
        question: 'If 5 machines can produce 5 widgets in 5 minutes, how many widgets can 100 machines produce in 100 minutes?',
        options: ['100', '500', '1000', '2000'],
        correctAnswer: 3,
        explanation: 'Each machine produces 1 widget in 5 minutes, so 1 widget per minute per machine. 100 machines × 100 minutes = 2000 widgets.',
        difficulty: 'medium',
        category: 'aptitude',
        points: 20
      },
      {
        id: 'apt_2',
        question: 'What is 15% of 80?',
        options: ['10', '12', '15', '20'],
        correctAnswer: 1,
        explanation: '15% of 80 = (15/100) × 80 = 0.15 × 80 = 12',
        difficulty: 'easy',
        category: 'aptitude',
        points: 10
      }
    ],
    programming: [
      {
        id: 'prog_1',
        question: 'Which principle states that software entities should be open for extension but closed for modification?',
        options: ['Single Responsibility', 'Open/Closed', 'Liskov Substitution', 'Dependency Inversion'],
        correctAnswer: 1,
        explanation: 'The Open/Closed Principle states that classes should be open for extension but closed for modification.',
        difficulty: 'medium',
        category: 'programming',
        points: 20
      }
    ]
  };

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameMode === 'quiz' && timeLeft > 0 && !showExplanation) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && !showExplanation) {
      handleAnswerSubmit();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameMode, showExplanation]);

  // Load game stats
  useEffect(() => {
    if (user) {
      loadGameStats();
    }
  }, [user]);

  const loadGameStats = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        const totalQuizzes = data.length;
        const totalScore = data.reduce((sum, result) => sum + result.score, 0);
        const averageScore = Math.round(totalScore / totalQuizzes);
        const categoriesCompleted = [...new Set(data.map(result => result.category))];
        
        setGameStats({
          totalQuizzes,
          totalScore,
          averageScore,
          bestStreak: Math.max(...data.map(result => result.streak || 0), 0),
          categoriesCompleted
        });
      }
    } catch (error) {
      console.error('Error loading game stats:', error);
    }
  };

  const startQuiz = (category: string, difficulty: 'easy' | 'medium' | 'hard') => {
    const categoryQuestions = questionBank[category] || [];
    const filteredQuestions = categoryQuestions.filter(q => q.difficulty === difficulty);
    
    if (filteredQuestions.length === 0) {
      // Generate some questions if none exist
      const sampleQuestions = generateSampleQuestions(category, difficulty);
      setQuestions(sampleQuestions);
    } else {
      setQuestions(filteredQuestions.slice(0, 5)); // Limit to 5 questions
    }
    
    setSelectedCategory(category);
    setSelectedDifficulty(difficulty);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setTimeLeft(30);
    setQuizStartTime(new Date());
    setGameMode('quiz');
  };

  const generateSampleQuestions = (category: string, difficulty: 'easy' | 'medium' | 'hard'): Question[] => {
    const points = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30;
    
    return [
      {
        id: `${category}_sample_1`,
        question: `Sample ${category} question (${difficulty} level)`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0,
        explanation: `This is a sample explanation for ${category} at ${difficulty} level.`,
        difficulty,
        category,
        points
      }
    ];
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return;
    setSelectedAnswer(answerIndex);
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer === null && timeLeft > 0) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    setUserAnswers([...userAnswers, selectedAnswer || -1]);
    setShowExplanation(true);
    
    if (isCorrect) {
      setStreak(streak + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setTimeLeft(30);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    if (!quizStartTime) return;
    
    const endTime = new Date();
    const timeSpent = Math.round((endTime.getTime() - quizStartTime.getTime()) / 1000);
    const correctAnswers = userAnswers.filter((answer, index) => 
      answer === questions[index].correctAnswer
    ).length;
    const totalPoints = questions.reduce((sum, q, index) => 
      userAnswers[index] === q.correctAnswer ? sum + q.points : sum, 0
    );
    
    const result: QuizResult = {
      score: totalPoints,
      totalQuestions: questions.length,
      timeSpent,
      correctAnswers,
      category: selectedCategory,
      difficulty: selectedDifficulty
    };
    
    setQuizResult(result);
    setGameMode('results');
    
    // Save result to database
    if (user) {
      try {
        await supabase
          .from('quiz_results')
          .insert({
            user_id: user.id,
            category: selectedCategory,
            difficulty: selectedDifficulty,
            score: totalPoints,
            total_questions: questions.length,
            correct_answers: correctAnswers,
            time_spent: timeSpent,
            streak: streak,
            created_at: new Date().toISOString()
          });
        
        await loadGameStats();
      } catch (error) {
        console.error('Error saving quiz result:', error);
      }
    }
  };

  const resetQuiz = () => {
    setGameMode('menu');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuizResult(null);
    setStreak(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (gameMode === 'menu') {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center">
                  <Gamepad2 className="h-8 w-8 mr-3" />
                  PrepBuddy Quiz Arena
                </h1>
                <p className="text-purple-100 mt-2">Test your knowledge and boost your placement preparation!</p>
              </div>
              <div className="text-right">
                <button
                  onClick={() => setGameMode('stats')}
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <Trophy className="h-5 w-5" />
                  <span>My Stats</span>
                </button>
              </div>
            </div>
          </div>

          {/* Game Stats Overview */}
          {gameStats && (
            <div className="p-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{gameStats.totalQuizzes}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Quizzes Taken</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{gameStats.averageScore}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Average Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{gameStats.bestStreak}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Best Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{gameStats.categoriesCompleted.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
                </div>
              </div>
            </div>
          )}

          {/* Category Selection */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
              <Target className="h-6 w-6 mr-2 text-indigo-600" />
              Choose Your Challenge
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 hover:shadow-lg"
                >
                  <div className="flex items-center mb-4">
                    <div className={`${category.color} text-white p-3 rounded-lg mr-4`}>
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{category.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select Difficulty:</div>
                    {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
                      <button
                        key={difficulty}
                        onClick={() => startQuiz(category.id, difficulty)}
                        className={`w-full p-3 rounded-lg text-left transition-all duration-200 border-2 hover:border-indigo-300 dark:hover:border-indigo-600 ${getDifficultyColor(difficulty)} hover:shadow-md`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex items-center mr-3">
                              {difficulty === 'easy' && <Star className="h-4 w-4" />}
                              {difficulty === 'medium' && (
                                <>
                                  <Star className="h-4 w-4" />
                                  <Star className="h-4 w-4" />
                                </>
                              )}
                              {difficulty === 'hard' && (
                                <>
                                  <Star className="h-4 w-4" />
                                  <Star className="h-4 w-4" />
                                  <Star className="h-4 w-4" />
                                </>
                              )}
                            </div>
                            <span className="font-medium capitalize">{difficulty}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>5 mins</span>
                          </div>
                        </div>
                        <div className="text-xs mt-1 opacity-75">
                          {difficulty === 'easy' && '10 points per question'}
                          {difficulty === 'medium' && '20 points per question'}
                          {difficulty === 'hard' && '30 points per question'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
              Quick Tips for Success
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start space-x-2">
                <Timer className="h-4 w-4 text-indigo-600 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">Each question has a 30-second timer</span>
              </div>
              <div className="flex items-start space-x-2">
                <Zap className="h-4 w-4 text-yellow-600 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">Build streaks for bonus points</span>
              </div>
              <div className="flex items-start space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">Track progress across categories</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameMode === 'quiz') {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Quiz Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {categories.find(c => c.id === selectedCategory)?.name}
                </h2>
                <div className="flex items-center space-x-4 mt-2 text-indigo-100">
                  <span className="flex items-center">
                    <Flag className="h-4 w-4 mr-1" />
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(selectedDifficulty)}`}>
                    {selectedDifficulty.toUpperCase()}
                  </span>
                  {streak > 0 && (
                    <span className="flex items-center bg-yellow-500 text-yellow-900 px-2 py-1 rounded text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      Streak: {streak}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${timeLeft <= 10 ? 'text-red-300 animate-pulse' : 'text-white'}`}>
                  {timeLeft}s
                </div>
                <div className="text-indigo-100 text-sm">Time Left</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-indigo-800 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="p-8">
            <div className="mb-8">
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-6 leading-relaxed">
                {currentQuestion.question}
              </h3>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showExplanation}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                      showExplanation
                        ? index === currentQuestion.correctAnswer
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                          : selectedAnswer === index
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400'
                        : selectedAnswer === index
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200'
                          : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 text-sm font-medium ${
                        showExplanation
                          ? index === currentQuestion.correctAnswer
                            ? 'border-green-500 bg-green-500 text-white'
                            : selectedAnswer === index
                              ? 'border-red-500 bg-red-500 text-white'
                              : 'border-gray-300 dark:border-gray-600'
                          : selectedAnswer === index
                            ? 'border-indigo-500 bg-indigo-500 text-white'
                            : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="flex-1">{option}</span>
                      {showExplanation && index === currentQuestion.correctAnswer && (
                        <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                      )}
                      {showExplanation && selectedAnswer === index && index !== currentQuestion.correctAnswer && (
                        <XCircle className="h-5 w-5 text-red-500 ml-2" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Explanation */}
            {showExplanation && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  Explanation
                </h4>
                <p className="text-blue-800 dark:text-blue-200">{currentQuestion.explanation}</p>
                <div className="mt-3 flex items-center text-sm text-blue-700 dark:text-blue-300">
                  <Award className="h-4 w-4 mr-1" />
                  <span>Points: {currentQuestion.points}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={resetQuiz}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Exit Quiz
              </button>
              
              <div className="flex space-x-3">
                {!showExplanation ? (
                  <button
                    onClick={handleAnswerSubmit}
                    disabled={selectedAnswer === null}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
                  >
                    Submit Answer
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
                  >
                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameMode === 'results' && quizResult) {
    const percentage = Math.round((quizResult.correctAnswers / quizResult.totalQuestions) * 100);
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Results Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-300" />
            <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
            <p className="text-green-100">Great job on completing the {selectedCategory} quiz!</p>
          </div>

          {/* Score Display */}
          <div className="p-8">
            <div className="text-center mb-8">
              <div className={`text-6xl font-bold mb-4 ${getScoreColor(percentage)}`}>
                {percentage}%
              </div>
              <div className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                {quizResult.correctAnswers} out of {quizResult.totalQuestions} correct
              </div>
              
              {/* Performance Message */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {percentage >= 80 ? '🎉 Excellent!' : percentage >= 60 ? '👍 Good Job!' : '💪 Keep Practicing!'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {percentage >= 80 
                    ? 'Outstanding performance! You have a strong grasp of this topic.'
                    : percentage >= 60 
                      ? 'Good work! Review the explanations to improve further.'
                      : 'Don\'t worry! Practice makes perfect. Review the concepts and try again.'}
                </p>
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{quizResult.score}</div>
                <div className="text-sm text-blue-800 dark:text-blue-200">Total Points</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatTime(quizResult.timeSpent)}</div>
                <div className="text-sm text-green-800 dark:text-green-200">Time Taken</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{streak}</div>
                <div className="text-sm text-purple-800 dark:text-purple-200">Best Streak</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 capitalize">{selectedDifficulty}</div>
                <div className="text-sm text-yellow-800 dark:text-yellow-200">Difficulty</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => startQuiz(selectedCategory, selectedDifficulty)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry Quiz
              </button>
              <button
                onClick={() => setGameMode('stats')}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
              >
                <Trophy className="h-4 w-4 mr-2" />
                View All Stats
              </button>
              <button
                onClick={resetQuiz}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameMode === 'stats') {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Stats Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center">
                  <Trophy className="h-8 w-8 mr-3" />
                  Your Quiz Statistics
                </h2>
                <p className="text-purple-100 mt-2">Track your learning progress across all categories</p>
              </div>
              <button
                onClick={resetQuiz}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Menu</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {gameStats ? (
              <div className="space-y-8">
                {/* Overall Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{gameStats.totalQuizzes}</div>
                        <div className="text-blue-800 dark:text-blue-200 font-medium">Total Quizzes</div>
                      </div>
                      <Gamepad2 className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">{gameStats.averageScore}%</div>
                        <div className="text-green-800 dark:text-green-200 font-medium">Average Score</div>
                      </div>
                      <Target className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{gameStats.bestStreak}</div>
                        <div className="text-yellow-800 dark:text-yellow-200 font-medium">Best Streak</div>
                      </div>
                      <Zap className="h-8 w-8 text-yellow-500" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{gameStats.categoriesCompleted.length}</div>
                        <div className="text-purple-800 dark:text-purple-200 font-medium">Categories</div>
                      </div>
                      <BookOpen className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>
                </div>

                {/* Categories Progress */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Category Progress</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => {
                      const isCompleted = gameStats.categoriesCompleted.includes(category.id);
                      return (
                        <div
                          key={category.id}
                          className={`p-6 rounded-lg border-2 transition-all duration-200 ${
                            isCompleted
                              ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
                          }`}
                        >
                          <div className="flex items-center mb-4">
                            <div className={`${category.color} text-white p-3 rounded-lg mr-4`}>
                              {category.icon}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100">{category.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
                            </div>
                            {isCompleted && (
                              <CheckCircle className="h-6 w-6 text-green-500" />
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
                              <div key={difficulty} className="flex items-center justify-between">
                                <span className={`text-sm px-2 py-1 rounded ${getDifficultyColor(difficulty)}`}>
                                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                                </span>
                                <button
                                  onClick={() => startQuiz(category.id, difficulty)}
                                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 flex items-center"
                                >
                                  <Play className="h-3 w-3 mr-1" />
                                  {isCompleted ? 'Retry' : 'Start'}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Achievements */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Achievements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-lg border ${
                      gameStats.totalQuizzes >= 5 
                        ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20' 
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
                    }`}>
                      <div className="flex items-center">
                        <Award className={`h-6 w-6 mr-3 ${gameStats.totalQuizzes >= 5 ? 'text-yellow-500' : 'text-gray-400'}`} />
                        <div>
                          <div className="font-medium">Quiz Master</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Complete 5 quizzes</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-lg border ${
                      gameStats.averageScore >= 80 
                        ? 'border-green-300 bg-green-50 dark:bg-green-900/20' 
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
                    }`}>
                      <div className="flex items-center">
                        <Star className={`h-6 w-6 mr-3 ${gameStats.averageScore >= 80 ? 'text-green-500' : 'text-gray-400'}`} />
                        <div>
                          <div className="font-medium">High Achiever</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">80%+ average score</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-lg border ${
                      gameStats.categoriesCompleted.length >= 3 
                        ? 'border-purple-300 bg-purple-50 dark:bg-purple-900/20' 
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
                    }`}>
                      <div className="flex items-center">
                        <Trophy className={`h-6 w-6 mr-3 ${gameStats.categoriesCompleted.length >= 3 ? 'text-purple-500' : 'text-gray-400'}`} />
                        <div>
                          <div className="font-medium">Well Rounded</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Complete 3 categories</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Gamepad2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Quiz Data Yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Start taking quizzes to see your statistics here!</p>
                <button
                  onClick={resetQuiz}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  Take Your First Quiz
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default QuizGame;
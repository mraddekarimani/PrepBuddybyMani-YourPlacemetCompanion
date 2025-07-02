const AI_INTERVIEW_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL || 'https://qtiakfqqfqbghytgzlcq.supabase.co'}/functions/v1/ai-interview`;

export interface Question {
  id: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  expectedPoints: string[];
  timeLimit: number;
  interviewType?: string;
  platformFocus?: string;
  testCases?: Array<{
    input: string;
    expectedOutput: string;
    description: string;
  }>;
  hints?: string[];
  codeTemplate?: string;
  followUpQuestions?: string[];
}

export interface AnalysisResult {
  score: number;
  feedback: string;
  difficulty_rating?: number;
  strengths?: string[];
  improvements?: string[];
  codeQuality?: number;
  timeComplexity?: string;
  spaceComplexity?: string;
}

export const generateQuestions = async (
  category: string,
  difficulty: 'easy' | 'medium' | 'hard',
  count: number = 3,
  interviewType: string = 'standard',
  platformFocus: string = 'general'
): Promise<Question[]> => {
  try {
    const response = await fetch(`${AI_INTERVIEW_ENDPOINT}/generate-questions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0aWFrZnFxZnFiZ2h5dGd6bGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMTI5NjQsImV4cCI6MjA2NjU4ODk2NH0.UhC8V4R4E2DhG0Tn27KZYnqojI1YKjM3imJ_HB6vlLc'}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ category, difficulty, count, interviewType, platformFocus }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate questions');
    }

    const data = await response.json();
    return data.questions;
  } catch (error) {
    console.error('Error generating questions:', error);
    // Fallback to enhanced local questions if API fails
    return getEnhancedFallbackQuestions(category, difficulty, count, interviewType, platformFocus);
  }
};

export const analyzeResponse = async (
  question: string,
  response: string,
  expectedPoints: string[],
  category: string,
  interviewType: string = 'standard',
  codeSubmission?: string
): Promise<AnalysisResult> => {
  try {
    const response_data = await fetch(`${AI_INTERVIEW_ENDPOINT}/analyze-response`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0aWFrZnFxZnFiZ2h5dGd6bGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMTI5NjQsImV4cCI6MjA2NjU4ODk2NH0.UhC8V4R4E2DhG0Tn27KZYnqojI1YKjM3imJ_HB6vlLc'}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question, response, expectedPoints, category, interviewType, codeSubmission }),
    });

    if (!response_data.ok) {
      throw new Error('Failed to analyze response');
    }

    return await response_data.json();
  } catch (error) {
    console.error('Error analyzing response:', error);
    // Fallback to enhanced scoring
    return getEnhancedFallbackAnalysis(response, codeSubmission, interviewType);
  }
};

// Enhanced fallback functions with more comprehensive question banks
const getEnhancedFallbackQuestions = (
  category: string, 
  difficulty: 'easy' | 'medium' | 'hard', 
  count: number,
  interviewType: string,
  platformFocus: string
): Question[] => {
  const enhancedQuestionBank: Record<string, Record<string, Record<string, Question[]>>> = {
    technical: {
      standard: {
        easy: [
          {
            id: 'tech_std_easy_1',
            category: 'technical',
            difficulty: 'easy',
            question: 'Explain the difference between a stack and a queue. When would you use each?',
            expectedPoints: ['LIFO vs FIFO explanation', 'Stack use cases (function calls, undo operations)', 'Queue use cases (BFS, task scheduling)', 'Basic implementation concepts'],
            timeLimit: 300,
            interviewType: 'standard',
            hints: ['Think about the order of insertion and removal', 'Consider real-world examples like browser history vs printer queue']
          },
          {
            id: 'tech_std_easy_2',
            category: 'technical',
            difficulty: 'easy',
            question: 'What is the time complexity of searching in a sorted array? Explain your reasoning.',
            expectedPoints: ['Binary search concept', 'O(log n) time complexity', 'Comparison with linear search', 'Divide and conquer approach'],
            timeLimit: 300,
            interviewType: 'standard'
          }
        ],
        medium: [
          {
            id: 'tech_std_med_1',
            category: 'technical',
            difficulty: 'medium',
            question: 'Design a data structure that supports insert, delete, and getRandom operations in O(1) time.',
            expectedPoints: ['Array + HashMap combination', 'Swap with last element for deletion', 'Random index generation', 'Handle edge cases'],
            timeLimit: 450,
            interviewType: 'standard',
            hints: ['Think about how to maintain O(1) for all operations', 'Consider using both array and hash map']
          }
        ],
        hard: [
          {
            id: 'tech_std_hard_1',
            category: 'technical',
            difficulty: 'hard',
            question: 'Implement a LRU cache with O(1) operations. Explain your design choices.',
            expectedPoints: ['HashMap + Doubly Linked List', 'O(1) get/put operations', 'Capacity management', 'Edge cases handling'],
            timeLimit: 600,
            interviewType: 'standard'
          }
        ]
      },
      coding: {
        easy: [
          {
            id: 'tech_code_easy_1',
            category: 'technical',
            difficulty: 'easy',
            question: 'Write a function to reverse a string. Optimize for both time and space complexity.',
            expectedPoints: ['Multiple approaches (two pointers, recursion)', 'Time complexity O(n)', 'Space complexity considerations', 'Edge cases (empty string, single character)'],
            timeLimit: 900,
            interviewType: 'coding',
            testCases: [
              { input: '"hello"', expectedOutput: '"olleh"', description: 'Basic string reversal' },
              { input: '""', expectedOutput: '""', description: 'Empty string' },
              { input: '"a"', expectedOutput: '"a"', description: 'Single character' }
            ],
            codeTemplate: 'function reverseString(s) {\n    // Your implementation here\n    return "";\n}'
          }
        ],
        medium: [
          {
            id: 'tech_code_med_1',
            category: 'technical',
            difficulty: 'medium',
            question: 'Implement a function to find the longest palindromic substring in a given string.',
            expectedPoints: ['Expand around centers approach', 'Handle even/odd length palindromes', 'O(n²) time complexity', 'Edge cases and optimization'],
            timeLimit: 1200,
            interviewType: 'coding',
            testCases: [
              { input: '"babad"', expectedOutput: '"bab" or "aba"', description: 'Multiple valid answers' },
              { input: '"cbbd"', expectedOutput: '"bb"', description: 'Even length palindrome' },
              { input: '"a"', expectedOutput: '"a"', description: 'Single character' }
            ]
          }
        ]
      }
    },
    'system-design': {
      standard: {
        easy: [
          {
            id: 'sys_std_easy_1',
            category: 'system-design',
            difficulty: 'easy',
            question: 'Design a URL shortener like bit.ly. Focus on the core functionality.',
            expectedPoints: ['URL encoding/decoding', 'Database schema', 'Basic API design', 'Scalability considerations'],
            timeLimit: 1200,
            interviewType: 'standard'
          }
        ],
        medium: [
          {
            id: 'sys_std_med_1',
            category: 'system-design',
            difficulty: 'medium',
            question: 'Design a chat application like WhatsApp. Consider real-time messaging and scalability.',
            expectedPoints: ['WebSocket connections', 'Message storage', 'User presence', 'Load balancing', 'Database partitioning'],
            timeLimit: 1800,
            interviewType: 'standard'
          }
        ]
      }
    },
    behavioral: {
      standard: {
        easy: [
          {
            id: 'behav_std_easy_1',
            category: 'behavioral',
            difficulty: 'easy',
            question: 'Tell me about yourself and why you\'re interested in this role.',
            expectedPoints: ['Professional background', 'Relevant skills', 'Career motivation', 'Company alignment'],
            timeLimit: 180,
            interviewType: 'standard'
          }
        ],
        medium: [
          {
            id: 'behav_std_med_1',
            category: 'behavioral',
            difficulty: 'medium',
            question: 'Describe a time when you had to work with a difficult team member. How did you handle the situation?',
            expectedPoints: ['STAR method (Situation, Task, Action, Result)', 'Conflict resolution skills', 'Communication approach', 'Positive outcome'],
            timeLimit: 240,
            interviewType: 'standard'
          }
        ]
      }
    }
  };

  // Platform-specific question modifications
  const platformModifications: Record<string, (question: Question) => Question> = {
    google: (q) => ({
      ...q,
      question: q.question + ' (Focus on scalability and efficiency as Google would expect)',
      expectedPoints: [...q.expectedPoints, 'Scalability considerations', 'Performance optimization']
    }),
    amazon: (q) => ({
      ...q,
      question: q.question + ' (Consider Amazon\'s leadership principles in your approach)',
      expectedPoints: [...q.expectedPoints, 'Customer obsession', 'Ownership mindset']
    }),
    microsoft: (q) => ({
      ...q,
      question: q.question + ' (Think about enterprise-level solutions)',
      expectedPoints: [...q.expectedPoints, 'Enterprise considerations', 'Integration capabilities']
    })
  };

  const categoryQuestions = enhancedQuestionBank[category]?.[interviewType]?.[difficulty] || 
                           enhancedQuestionBank.technical.standard.easy;
  
  let selectedQuestions = categoryQuestions.slice(0, count);
  
  // Apply platform-specific modifications
  if (platformFocus !== 'general' && platformModifications[platformFocus]) {
    selectedQuestions = selectedQuestions.map(platformModifications[platformFocus]);
  }
  
  return selectedQuestions;
};

const getEnhancedFallbackAnalysis = (
  response: string, 
  codeSubmission?: string, 
  interviewType: string = 'standard'
): AnalysisResult => {
  const responseLength = response.trim().length;
  const words = response.toLowerCase().split(/\s+/);
  
  let score = 0;
  const feedback: string[] = [];
  const strengths: string[] = [];
  const improvements: string[] = [];
  
  // Basic length and structure analysis
  if (responseLength < 50) {
    score += 20;
    improvements.push("Provide more detailed explanations");
  } else if (responseLength < 200) {
    score += 40;
    feedback.push("Good length, but could be more comprehensive");
  } else {
    score += 60;
    strengths.push("Comprehensive and detailed response");
  }
  
  // Technical keyword analysis
  const technicalKeywords = {
    technical: ['algorithm', 'complexity', 'implementation', 'data structure', 'time', 'space', 'optimize', 'efficient'],
    behavioral: ['situation', 'action', 'result', 'learned', 'team', 'challenge', 'solution', 'leadership'],
    'system-design': ['scalability', 'database', 'api', 'architecture', 'load', 'cache', 'distributed', 'microservices'],
    coding: ['function', 'loop', 'condition', 'variable', 'return', 'array', 'object', 'method']
  };
  
  const relevantKeywords = technicalKeywords[interviewType as keyof typeof technicalKeywords] || technicalKeywords.technical;
  const keywordMatches = relevantKeywords.filter(keyword => words.includes(keyword)).length;
  
  if (keywordMatches >= 4) {
    score += 25;
    strengths.push("Excellent use of technical terminology");
  } else if (keywordMatches >= 2) {
    score += 15;
    feedback.push("Good technical vocabulary, could include more specific terms");
  } else {
    improvements.push("Use more specific technical terminology");
  }
  
  // Code analysis for coding interviews
  let codeQuality = 0;
  if (codeSubmission && interviewType === 'coding') {
    const codeLines = codeSubmission.split('\n').filter(line => line.trim().length > 0);
    const hasComments = codeSubmission.includes('//') || codeSubmission.includes('/*');
    const hasProperNaming = /[a-zA-Z][a-zA-Z0-9]*/.test(codeSubmission);
    
    if (codeLines.length > 5) {
      codeQuality += 30;
      strengths.push("Well-structured code implementation");
    }
    if (hasComments) {
      codeQuality += 20;
      strengths.push("Good code documentation");
    }
    if (hasProperNaming) {
      codeQuality += 20;
      strengths.push("Clear variable naming");
    }
    
    score += codeQuality * 0.3; // Code contributes 30% to overall score
  }
  
  // Structure and clarity analysis
  const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length >= 3) {
    score += 15;
    strengths.push("Well-structured response with clear points");
  }
  
  // Ensure score is within bounds
  score = Math.min(100, Math.max(0, score));
  
  const overallFeedback = [
    ...feedback,
    `Score breakdown: Content depth (${Math.min(60, responseLength/4)}%), Technical accuracy (${keywordMatches * 5}%), Structure (${sentences.length >= 3 ? 15 : 5}%)`,
    ...(codeSubmission ? [`Code quality: ${codeQuality}%`] : [])
  ].join(' ');
  
  return { 
    score: Math.round(score), 
    feedback: overallFeedback,
    difficulty_rating: Math.min(5, Math.max(1, Math.round(score / 20))),
    strengths,
    improvements,
    codeQuality: codeSubmission ? codeQuality : undefined,
    timeComplexity: codeSubmission ? 'O(n)' : undefined,
    spaceComplexity: codeSubmission ? 'O(1)' : undefined
  };
};
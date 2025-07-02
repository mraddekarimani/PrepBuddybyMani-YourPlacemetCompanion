import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

interface Question {
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

interface GenerateQuestionsRequest {
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  count?: number;
  interviewType?: string;
  platformFocus?: string;
}

interface AnalyzeResponseRequest {
  question: string;
  response: string;
  expectedPoints: string[];
  category: string;
  interviewType?: string;
  codeSubmission?: string;
}

interface HintRequest {
  question: string;
  category: string;
  difficulty: string;
  hintsUsed: number;
}

interface SuggestionsRequest {
  question: string;
  currentResponse: string;
  category: string;
  interviewType: string;
}

// Enhanced question templates with platform-specific variations
const enhancedQuestionTemplates = {
  technical: {
    standard: {
      easy: [
        {
          base: "Explain the difference between {concept1} and {concept2}. Provide examples of when to use each.",
          concepts: [
            { concept1: "Array", concept2: "Linked List" },
            { concept1: "Stack", concept2: "Queue" },
            { concept1: "BFS", concept2: "DFS" },
            { concept1: "HashMap", concept2: "TreeMap" }
          ]
        },
        {
          base: "What is {algorithm} and what is its time complexity? Explain with an example.",
          algorithms: ["Binary Search", "Merge Sort", "Quick Sort", "Bubble Sort"]
        }
      ],
      medium: [
        {
          base: "Design a {dataStructure} that supports {operations} in O(1) time. Explain your approach.",
          dataStructures: ["LRU Cache", "Min Stack", "Random Set"],
          operations: ["insert, delete, getRandom", "push, pop, getMin", "get, put"]
        },
        {
          base: "Implement {algorithm} and analyze its time and space complexity. Discuss optimizations.",
          algorithms: ["Two Pointers technique", "Sliding Window", "Dynamic Programming solution"]
        }
      ],
      hard: [
        {
          base: "Design and implement {complexSystem}. Consider scalability and edge cases.",
          systems: ["Distributed Cache", "Rate Limiter", "Consistent Hashing", "Load Balancer"]
        }
      ]
    },
    coding: {
      easy: [
        {
          question: "Write a function to reverse a string without using built-in reverse methods.",
          testCases: [
            { input: '"hello"', expectedOutput: '"olleh"', description: 'Basic string reversal' },
            { input: '""', expectedOutput: '""', description: 'Empty string' },
            { input: '"a"', expectedOutput: '"a"', description: 'Single character' }
          ],
          codeTemplate: 'function reverseString(s) {\n    // Your implementation here\n    return "";\n}',
          hints: ["Try using two pointers approach", "Consider the time and space complexity"]
        },
        {
          question: "Implement a function to check if a string is a palindrome (case-insensitive).",
          testCases: [
            { input: '"racecar"', expectedOutput: 'true', description: 'Simple palindrome' },
            { input: '"A man a plan a canal Panama"', expectedOutput: 'true', description: 'Palindrome with spaces' },
            { input: '"hello"', expectedOutput: 'false', description: 'Not a palindrome' }
          ]
        }
      ],
      medium: [
        {
          question: "Find the longest palindromic substring in a given string.",
          testCases: [
            { input: '"babad"', expectedOutput: '"bab" or "aba"', description: 'Multiple valid answers' },
            { input: '"cbbd"', expectedOutput: '"bb"', description: 'Even length palindrome' }
          ],
          hints: ["Consider expanding around centers", "Handle both odd and even length palindromes"]
        },
        {
          question: "Implement a function to find all anagrams of a string in a list of strings.",
          testCases: [
            { input: '["eat","tea","tan","ate","nat","bat"], "eat"', expectedOutput: '["tea","ate"]', description: 'Find anagrams' }
          ]
        }
      ]
    }
  },
  'system-design': {
    standard: {
      easy: [
        "Design a URL shortener like bit.ly. Focus on core functionality and basic scalability.",
        "Design a simple chat application. Consider real-time messaging requirements.",
        "Design a basic file storage system like Dropbox. Focus on upload/download functionality."
      ],
      medium: [
        "Design a social media feed system like Twitter. Consider scalability and real-time updates.",
        "Design a ride-sharing service like Uber. Focus on matching drivers and riders.",
        "Design a notification system that can handle millions of users across different platforms."
      ],
      hard: [
        "Design a distributed cache system like Redis. Consider consistency, availability, and partition tolerance.",
        "Design a global content delivery network (CDN) with edge servers worldwide.",
        "Design a real-time collaborative document editing system like Google Docs."
      ]
    }
  },
  behavioral: {
    standard: {
      easy: [
        "Tell me about yourself and why you're interested in this role.",
        "Describe a project you're proud of and what you learned from it.",
        "Why do you want to work at our company?"
      ],
      medium: [
        "Tell me about a time when you had to work with a difficult team member. How did you handle it?",
        "Describe a situation where you had to learn a new technology quickly. What was your approach?",
        "Give me an example of a time when you had to meet a tight deadline. How did you manage it?"
      ],
      hard: [
        "Describe a time when you had to make a difficult technical decision with limited information.",
        "Tell me about a project that failed. What went wrong and what did you learn?",
        "How would you handle a situation where you disagree with your manager's technical decision?"
      ]
    }
  }
};

// Platform-specific question modifications
const platformModifications = {
  google: {
    suffix: " (Focus on scalability, efficiency, and Google's scale)",
    additionalPoints: ["Scalability to billions of users", "Performance optimization", "Data structure efficiency"]
  },
  amazon: {
    suffix: " (Consider Amazon's leadership principles and customer obsession)",
    additionalPoints: ["Customer impact", "Ownership mindset", "Long-term thinking"]
  },
  microsoft: {
    suffix: " (Think about enterprise solutions and integration)",
    additionalPoints: ["Enterprise scalability", "Integration capabilities", "Security considerations"]
  },
  meta: {
    suffix: " (Consider social scale and real-time requirements)",
    additionalPoints: ["Social graph implications", "Real-time processing", "Privacy considerations"]
  },
  apple: {
    suffix: " (Focus on user experience and performance)",
    additionalPoints: ["User experience", "Performance optimization", "Design simplicity"]
  },
  netflix: {
    suffix: " (Consider streaming scale and content delivery)",
    additionalPoints: ["Content delivery", "Streaming optimization", "Global scale"]
  },
  uber: {
    suffix: " (Think about real-time systems and marketplace dynamics)",
    additionalPoints: ["Real-time processing", "Marketplace efficiency", "Location-based services"]
  },
  startup: {
    suffix: " (Focus on MVP, rapid iteration, and resource constraints)",
    additionalPoints: ["MVP approach", "Resource efficiency", "Rapid iteration"]
  }
};

function generateQuestions(
  category: string, 
  difficulty: 'easy' | 'medium' | 'hard', 
  count: number = 3,
  interviewType: string = 'standard',
  platformFocus: string = 'general'
): Question[] {
  const questions: Question[] = [];
  
  // Get base templates
  const templates = enhancedQuestionTemplates[category as keyof typeof enhancedQuestionTemplates]?.[interviewType as keyof typeof enhancedQuestionTemplates.technical]?.[difficulty] || 
                   enhancedQuestionTemplates.technical.standard.easy;
  
  for (let i = 0; i < Math.min(count, templates.length); i++) {
    const template = templates[i];
    let questionText: string;
    let testCases: any[] = [];
    let codeTemplate: string | undefined;
    let hints: string[] = [];
    
    if (typeof template === 'string') {
      questionText = template;
    } else if (typeof template === 'object' && 'base' in template) {
      // Handle template with concepts/algorithms
      questionText = template.base;
      if ('concepts' in template && template.concepts) {
        const concept = template.concepts[i % template.concepts.length];
        questionText = questionText.replace('{concept1}', concept.concept1).replace('{concept2}', concept.concept2);
      }
      if ('algorithms' in template && template.algorithms) {
        const algorithm = template.algorithms[i % template.algorithms.length];
        questionText = questionText.replace('{algorithm}', algorithm);
      }
    } else {
      // Handle coding question object
      questionText = template.question;
      testCases = template.testCases || [];
      codeTemplate = template.codeTemplate;
      hints = template.hints || [];
    }
    
    // Apply platform-specific modifications
    if (platformFocus !== 'general' && platformModifications[platformFocus as keyof typeof platformModifications]) {
      const platformMod = platformModifications[platformFocus as keyof typeof platformModifications];
      questionText += platformMod.suffix;
    }
    
    const question: Question = {
      id: `${category}_${interviewType}_${difficulty}_${i + 1}`,
      category,
      difficulty,
      question: questionText,
      expectedPoints: generateExpectedPoints(category, difficulty, interviewType, platformFocus),
      timeLimit: getTimeLimit(category, difficulty, interviewType),
      interviewType,
      platformFocus,
      testCases: testCases.length > 0 ? testCases : undefined,
      codeTemplate,
      hints
    };
    
    questions.push(question);
  }
  
  return questions;
}

function generateExpectedPoints(
  category: string, 
  difficulty: 'easy' | 'medium' | 'hard',
  interviewType: string,
  platformFocus: string
): string[] {
  const basePoints = {
    technical: {
      standard: ['Clear explanation of concepts', 'Correct analysis', 'Time/space complexity discussion'],
      coding: ['Working solution', 'Optimal approach', 'Edge cases handling', 'Code quality']
    },
    behavioral: ['STAR method (Situation, Task, Action, Result)', 'Specific examples', 'Lessons learned', 'Impact demonstration'],
    'system-design': ['System architecture', 'Scalability considerations', 'Database design', 'API design', 'Trade-offs discussion'],
    database: ['Schema design', 'Query optimization', 'Indexing strategy', 'Normalization concepts'],
    frontend: ['Component architecture', 'State management', 'Performance optimization', 'User experience'],
    backend: ['API design', 'Database integration', 'Error handling', 'Security considerations'],
    mobile: ['Platform-specific considerations', 'Performance optimization', 'User interface design', 'Offline functionality']
  };
  
  // Fix: Properly handle the basePoints structure to ensure we get an array
  let initialPoints: string[] = [];
  
  if (category === 'technical') {
    // For technical category, we need to access the nested structure
    const technicalPoints = basePoints.technical[interviewType as keyof typeof basePoints.technical];
    if (Array.isArray(technicalPoints)) {
      initialPoints = [...technicalPoints];
    } else {
      // Fallback to standard if interviewType is not found
      initialPoints = [...basePoints.technical.standard];
    }
  } else {
    // For other categories, check if it's an array
    const categoryPoints = basePoints[category as keyof typeof basePoints];
    if (Array.isArray(categoryPoints)) {
      initialPoints = [...categoryPoints];
    } else {
      // Fallback to technical standard if category is not found
      initialPoints = [...basePoints.technical.standard];
    }
  }
  
  // Add difficulty-specific points
  if (difficulty === 'hard') {
    initialPoints = [...initialPoints, 'Advanced optimizations', 'Edge cases handling', 'Scalability considerations'];
  } else if (difficulty === 'medium') {
    initialPoints = [...initialPoints, 'Alternative approaches', 'Performance considerations'];
  }
  
  // Add platform-specific points
  if (platformFocus !== 'general' && platformModifications[platformFocus as keyof typeof platformModifications]) {
    const platformMod = platformModifications[platformFocus as keyof typeof platformModifications];
    initialPoints = [...initialPoints, ...platformMod.additionalPoints];
  }
  
  return initialPoints;
}

function getTimeLimit(category: string, difficulty: 'easy' | 'medium' | 'hard', interviewType: string): number {
  const baseTimes = {
    technical: {
      standard: { easy: 300, medium: 450, hard: 600 },
      coding: { easy: 900, medium: 1200, hard: 1800 }
    },
    behavioral: { easy: 180, medium: 240, hard: 300 },
    'system-design': { easy: 1200, medium: 1800, hard: 2400 },
    database: { easy: 600, medium: 900, hard: 1200 },
    frontend: { easy: 900, medium: 1200, hard: 1800 },
    backend: { easy: 900, medium: 1200, hard: 1800 },
    mobile: { easy: 900, medium: 1200, hard: 1800 }
  };
  
  if (category === 'technical') {
    return baseTimes.technical[interviewType as keyof typeof baseTimes.technical]?.[difficulty] || baseTimes.technical.standard[difficulty];
  }
  
  return baseTimes[category as keyof typeof baseTimes]?.[difficulty] || 300;
}

function analyzeResponse(
  question: string, 
  response: string, 
  expectedPoints: string[], 
  category: string,
  interviewType: string = 'standard',
  codeSubmission?: string
): { score: number; feedback: string; difficulty_rating?: number; strengths?: string[]; improvements?: string[] } {
  const responseLength = response.trim().length;
  const words = response.toLowerCase().split(/\s+/);
  
  let score = 0;
  const feedback: string[] = [];
  const strengths: string[] = [];
  const improvements: string[] = [];
  
  // Content depth analysis
  if (responseLength < 50) {
    score += 20;
    improvements.push("Provide more detailed explanations and examples");
  } else if (responseLength < 200) {
    score += 40;
    feedback.push("Good response length, consider adding more specific details");
  } else if (responseLength < 500) {
    score += 60;
    strengths.push("Comprehensive response with good detail");
  } else {
    score += 70;
    strengths.push("Very thorough and detailed explanation");
  }
  
  // Technical accuracy based on keywords
  const technicalKeywords = {
    technical: ['algorithm', 'complexity', 'implementation', 'data structure', 'time', 'space', 'optimize', 'efficient', 'performance'],
    behavioral: ['situation', 'action', 'result', 'learned', 'team', 'challenge', 'solution', 'leadership', 'collaboration'],
    'system-design': ['scalability', 'database', 'api', 'architecture', 'load', 'cache', 'distributed', 'microservices', 'consistency'],
    coding: ['function', 'loop', 'condition', 'variable', 'return', 'array', 'object', 'method', 'optimization']
  };
  
  const relevantKeywords = technicalKeywords[category as keyof typeof technicalKeywords] || technicalKeywords.technical;
  const keywordMatches = relevantKeywords.filter(keyword => words.includes(keyword)).length;
  
  if (keywordMatches >= 5) {
    score += 20;
    strengths.push("Excellent use of technical terminology and concepts");
  } else if (keywordMatches >= 3) {
    score += 15;
    strengths.push("Good technical vocabulary");
  } else if (keywordMatches >= 1) {
    score += 10;
    feedback.push("Some technical terms used, could include more specific vocabulary");
  } else {
    improvements.push("Include more specific technical terminology relevant to the topic");
  }
  
  // Code quality analysis for coding interviews
  if (codeSubmission && interviewType === 'coding') {
    const codeLines = codeSubmission.split('\n').filter(line => line.trim().length > 0);
    const hasComments = codeSubmission.includes('//') || codeSubmission.includes('/*');
    const hasProperNaming = /[a-zA-Z][a-zA-Z0-9]*/.test(codeSubmission);
    const hasFunctionStructure = codeSubmission.includes('function') || codeSubmission.includes('def ') || codeSubmission.includes('public ');
    
    let codeScore = 0;
    if (codeLines.length > 3) {
      codeScore += 5;
      strengths.push("Well-structured code implementation");
    }
    if (hasComments) {
      codeScore += 3;
      strengths.push("Good code documentation");
    }
    if (hasProperNaming) {
      codeScore += 3;
      strengths.push("Clear variable and function naming");
    }
    if (hasFunctionStructure) {
      codeScore += 4;
      strengths.push("Proper function structure");
    }
    
    score += codeScore;
  }
  
  // Structure and clarity analysis
  const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length >= 4) {
    score += 10;
    strengths.push("Well-structured response with clear organization");
  } else if (sentences.length >= 2) {
    score += 5;
    feedback.push("Good structure, could benefit from more detailed breakdown");
  }
  
  // Expected points coverage
  const pointsCovered = expectedPoints.filter(point => {
    const pointWords = point.toLowerCase().split(/\s+/);
    return pointWords.some(word => words.includes(word));
  }).length;
  
  const coverageScore = (pointsCovered / expectedPoints.length) * 15;
  score += coverageScore;
  
  if (pointsCovered >= expectedPoints.length * 0.8) {
    strengths.push("Excellent coverage of key concepts");
  } else if (pointsCovered >= expectedPoints.length * 0.5) {
    feedback.push("Good coverage of main points, consider addressing all key concepts");
  } else {
    improvements.push("Address more of the key points mentioned in the question");
  }
  
  // Ensure score is within bounds
  score = Math.min(100, Math.max(0, score));
  
  const overallFeedback = [
    ...feedback,
    ...(strengths.length > 0 ? [`Strengths: ${strengths.join(', ')}`] : []),
    ...(improvements.length > 0 ? [`Areas for improvement: ${improvements.join(', ')}`] : []),
    `Coverage: ${pointsCovered}/${expectedPoints.length} key points addressed`
  ].join(' ');
  
  return { 
    score: Math.round(score), 
    feedback: overallFeedback,
    difficulty_rating: Math.min(5, Math.max(1, Math.round(score / 20))),
    strengths,
    improvements
  };
}

function generateHint(question: string, category: string, difficulty: string, hintsUsed: number): string {
  const hintTemplates = {
    technical: [
      "Think about the fundamental data structures that could solve this problem efficiently.",
      "Consider the time and space complexity trade-offs of different approaches.",
      "Break down the problem into smaller subproblems.",
      "Think about edge cases and how your solution handles them."
    ],
    coding: [
      "Start with a brute force approach, then optimize.",
      "Consider using two pointers or sliding window technique.",
      "Think about what data structure would give you the fastest lookup.",
      "Draw out a few examples to understand the pattern."
    ],
    'system-design': [
      "Start with the basic components and their interactions.",
      "Consider how the system would scale with millions of users.",
      "Think about data consistency and availability trade-offs.",
      "Consider caching strategies and database partitioning."
    ],
    behavioral: [
      "Use the STAR method: Situation, Task, Action, Result.",
      "Be specific about your role and contributions.",
      "Focus on the impact and what you learned.",
      "Quantify your results where possible."
    ]
  };
  
  const hints = hintTemplates[category as keyof typeof hintTemplates] || hintTemplates.technical;
  return hints[hintsUsed % hints.length];
}

function generateSuggestions(question: string, currentResponse: string, category: string, interviewType: string): string[] {
  const suggestions = [];
  
  if (currentResponse.length < 100) {
    suggestions.push("Consider expanding on your explanation with more details and examples.");
  }
  
  if (interviewType === 'coding') {
    suggestions.push("Think about the algorithm's time and space complexity.");
    suggestions.push("Consider edge cases like empty inputs or single elements.");
  }
  
  if (category === 'system-design') {
    suggestions.push("Discuss scalability and how the system handles increased load.");
    suggestions.push("Consider data storage and retrieval strategies.");
  }
  
  if (category === 'behavioral') {
    suggestions.push("Use specific examples and quantify your impact where possible.");
    suggestions.push("Explain what you learned from the experience.");
  }
  
  return suggestions.slice(0, 3); // Return top 3 suggestions
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    if (action === 'generate-questions') {
      const { category, difficulty, count = 3, interviewType = 'standard', platformFocus = 'general' }: GenerateQuestionsRequest = await req.json();
      
      if (!category || !difficulty) {
        return new Response(
          JSON.stringify({ error: 'Category and difficulty are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const questions = generateQuestions(category, difficulty, count, interviewType, platformFocus);
      
      return new Response(
        JSON.stringify({ questions }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'analyze-response') {
      const { question, response, expectedPoints, category, interviewType = 'standard', codeSubmission }: AnalyzeResponseRequest = await req.json();
      
      if (!question || !response || !category) {
        return new Response(
          JSON.stringify({ error: 'Question, response, and category are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const analysis = analyzeResponse(question, response, expectedPoints || [], category, interviewType, codeSubmission);
      
      return new Response(
        JSON.stringify(analysis),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'hint') {
      const { question, category, difficulty, hintsUsed }: HintRequest = await req.json();
      
      if (!question || !category) {
        return new Response(
          JSON.stringify({ error: 'Question and category are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const hint = generateHint(question, category, difficulty, hintsUsed);
      
      return new Response(
        JSON.stringify({ hint }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'suggestions') {
      const { question, currentResponse, category, interviewType }: SuggestionsRequest = await req.json();
      
      if (!question || !currentResponse || !category) {
        return new Response(
          JSON.stringify({ error: 'Question, current response, and category are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const suggestions = generateSuggestions(question, currentResponse, category, interviewType);
      
      return new Response(
        JSON.stringify({ suggestions }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
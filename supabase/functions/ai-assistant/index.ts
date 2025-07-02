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

// OpenAI API configuration
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || 'your-openai-api-key';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Groq API configuration (free alternative)
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY') || 'your-groq-api-key';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatRequest {
  message: string;
  context?: string;
  userId?: string;
  conversationHistory?: ChatMessage[];
  stream?: boolean;
}

const SYSTEM_PROMPT = `You are PrepBuddy AI, an expert placement preparation mentor created by Mani. You provide personalized, actionable guidance for students preparing for technical interviews and placements.

## Your Core Expertise:

### Technical Skills
- Data Structures & Algorithms (DSA)
- System Design & Architecture
- Programming Languages (Java, Python, C++, JavaScript)
- Database Design & Optimization
- Computer Science Fundamentals

### Career Preparation
- Resume Building & Optimization
- Interview Strategies (Technical & Behavioral)
- Company Research & Application Strategy
- Salary Negotiation & Offer Evaluation

### Study Planning
- Personalized Learning Roadmaps
- Resource Recommendations
- Progress Tracking & Milestone Setting
- Time Management & Productivity

## Response Guidelines:

1. **Be Conversational**: Write like a knowledgeable mentor, not a textbook
2. **Be Specific**: Provide concrete examples, code snippets, and actionable steps
3. **Be Encouraging**: Maintain a positive, motivational tone while being realistic
4. **Be Structured**: Use clear formatting with headers, bullet points, and examples
5. **Be Current**: Reference modern practices, latest interview trends, and current market insights
6. **Ask Follow-ups**: When appropriate, ask clarifying questions to provide better guidance

## Important Notes:
- Always provide genuine, thoughtful responses based on the user's specific question
- Avoid generic templates - tailor each response to the user's context
- Include practical examples and real-world applications
- Suggest specific resources, tools, or next steps when relevant
- If you don't know something specific, be honest and suggest where they can find accurate information

Remember: You're a mentor helping students achieve their career goals through practical, proven strategies.`;

async function streamOpenAIResponse(prompt: string, conversationHistory: ChatMessage[] = []): Promise<Response> {
  try {
    // Build conversation context
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];
    
    // Add conversation history (last 10 messages for context)
    conversationHistory.slice(-10).forEach(msg => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });
    
    // Add current message
    messages.push({ role: 'user', content: prompt });

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 2000,
        temperature: 0.7,
        stream: true,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    // Return streaming response
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('OpenAI Streaming Error:', error);
    throw error;
  }
}

async function streamGroqResponse(prompt: string, conversationHistory: ChatMessage[] = []): Promise<Response> {
  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];
    
    conversationHistory.slice(-8).forEach(msg => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });
    
    messages.push({ role: 'user', content: prompt });

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: messages,
        max_tokens: 2000,
        temperature: 0.7,
        stream: true,
        top_p: 0.9
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Groq Streaming Error:', error);
    throw error;
  }
}

async function callRegularAI(prompt: string, conversationHistory: ChatMessage[] = []): Promise<string> {
  try {
    // Try OpenAI first
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];
    
    conversationHistory.slice(-10).forEach(msg => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });
    
    messages.push({ role: 'user', content: prompt });

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 2000,
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    } else {
      throw new Error('Invalid response format from OpenAI API');
    }
  } catch (error) {
    console.error('OpenAI API Error:', error);
    // Try Groq as fallback
    return await callGroqAI(prompt, conversationHistory);
  }
}

async function callGroqAI(prompt: string, conversationHistory: ChatMessage[] = []): Promise<string> {
  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];
    
    conversationHistory.slice(-8).forEach(msg => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });
    
    messages.push({ role: 'user', content: prompt });

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: messages,
        max_tokens: 2000,
        temperature: 0.7,
        top_p: 0.9
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    } else {
      throw new Error('Invalid response format from Groq API');
    }
  } catch (error) {
    console.error('Groq API Error:', error);
    return getIntelligentFallback(prompt);
  }
}

// Intelligent fallback that provides contextual responses
function getIntelligentFallback(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  // Analyze the prompt to provide contextual responses
  if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi') || lowerPrompt.includes('hey')) {
    return `Hello! 👋 I'm PrepBuddy AI, your personal placement preparation mentor.

I'm here to help you succeed in your technical interviews and land your dream job. I can assist you with:

**🔧 Technical Preparation**
- Data Structures & Algorithms guidance
- System Design concepts and practice
- Programming best practices and code reviews
- Mock interview sessions

**💼 Career Strategy**
- Resume optimization for ATS systems
- Interview preparation (technical + behavioral)
- Company research and application strategy
- Salary negotiation tips

**📚 Study Planning**
- Personalized learning roadmaps
- Resource recommendations
- Progress tracking and milestone setting

What specific area would you like to focus on today? I'm here to provide personalized guidance based on your current level and goals.`;
  }
  
  if (lowerPrompt.includes('dsa') || lowerPrompt.includes('algorithm') || lowerPrompt.includes('data structure')) {
    return `# Data Structures & Algorithms Mastery Guide

Based on your question about DSA, here's a personalized approach:

## **Strategic Learning Path**

### **Phase 1: Foundation (Weeks 1-3)**
**Arrays & Strings**
- Master two-pointer technique and sliding window
- Practice string manipulation and pattern matching
- **Goal**: Solve 25-30 easy problems
- **Key Problems**: Two Sum, Valid Palindrome, Longest Substring

**Linked Lists**
- Understand pointer manipulation thoroughly
- Practice reversal, cycle detection, and merging
- **Goal**: Solve 15-20 problems
- **Key Problems**: Reverse Linked List, Detect Cycle, Merge Two Lists

### **Phase 2: Core Structures (Weeks 4-7)**
**Trees & Binary Search**
- Binary tree traversals (iterative + recursive)
- Binary Search Tree operations
- **Goal**: Solve 30-35 problems
- **Key Problems**: Binary Tree Inorder, Validate BST, Lowest Common Ancestor

**Stacks & Queues**
- Understand LIFO/FIFO principles
- Practice monotonic stack problems
- **Goal**: Solve 20 problems
- **Key Problems**: Valid Parentheses, Next Greater Element

### **Phase 3: Advanced Topics (Weeks 8-12)**
**Dynamic Programming**
- Start with 1D DP, progress to 2D
- Master common patterns: knapsack, LIS, LCS
- **Goal**: Solve 40-50 problems
- **Key Problems**: Climbing Stairs, Coin Change, Longest Common Subsequence

**Graphs**
- DFS/BFS traversals
- Shortest path algorithms
- **Goal**: Solve 25-30 problems
- **Key Problems**: Number of Islands, Course Schedule, Dijkstra's Algorithm

## **Daily Practice Strategy**
- **Morning (1 hour)**: Solve 1 new problem
- **Evening (30 mins)**: Review and optimize previous solutions
- **Weekend**: Mock interviews and harder problems

## **Recommended Resources**
- **Primary**: LeetCode (start with Top Interview 150)
- **Theory**: GeeksforGeeks for concept clarity
- **Books**: "Cracking the Coding Interview" for patterns
- **Videos**: NeetCode for visual explanations

## **Progress Tracking**
- Maintain a spreadsheet with problem categories
- Track time taken for each problem
- Note patterns and techniques learned
- Review mistakes weekly

What specific DSA topic would you like me to dive deeper into? I can provide more targeted guidance based on your current level.`;
  }

  // Generic but helpful response for other queries
  return `I understand you're looking for guidance on "${prompt}". While I'm currently experiencing some connectivity issues with my advanced AI capabilities, I'm still here to help!

## Here's how I can assist you:

**🎯 Specific Areas I Excel In:**
- **Technical Interview Prep**: DSA problems, coding patterns, system design
- **Resume & Career Strategy**: ATS optimization, interview preparation
- **Study Planning**: Personalized roadmaps, resource recommendations
- **Company Research**: Interview processes, salary insights

**💡 To Get the Best Help:**
1. **Be Specific**: Instead of "help with coding," try "explain dynamic programming approach for longest common subsequence"
2. **Share Context**: Your current level, target companies, timeline
3. **Ask Follow-ups**: I can dive deeper into any topic you're interested in

**🔄 Quick Actions You Can Take:**
- Ask me about a specific DSA topic or problem
- Request a customized study plan for your timeline
- Get help with resume optimization
- Practice system design concepts

What specific aspect of placement preparation would you like to focus on? I'm here to provide detailed, actionable guidance tailored to your needs!

*Note: My full AI capabilities will be restored shortly. In the meantime, I can still provide comprehensive guidance based on proven placement preparation strategies.*`;
}

async function saveChatMessage(userId: string, message: string, response: string) {
  try {
    await supabase
      .from('chat_history')
      .insert({
        user_id: userId,
        user_message: message,
        ai_response: response,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error saving chat message:', error);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, userId, conversationHistory, stream }: ChatRequest = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Add context if provided
    let enhancedMessage = message;
    if (context) {
      enhancedMessage = `Context: ${context}\n\nQuestion: ${message}`;
    }

    // Handle streaming requests
    if (stream) {
      try {
        // Try OpenAI streaming first
        const streamResponse = await streamOpenAIResponse(enhancedMessage, conversationHistory || []);
        return streamResponse;
      } catch (error) {
        console.error('OpenAI streaming failed, trying Groq:', error);
        try {
          // Fallback to Groq streaming
          const groqStreamResponse = await streamGroqResponse(enhancedMessage, conversationHistory || []);
          return groqStreamResponse;
        } catch (groqError) {
          console.error('Groq streaming failed, using fallback:', groqError);
          // Return fallback response as stream
          const fallbackResponse = getIntelligentFallback(enhancedMessage);
          
          // Simulate streaming for fallback
          const encoder = new TextEncoder();
          const stream = new ReadableStream({
            start(controller) {
              const words = fallbackResponse.split(' ');
              let index = 0;
              
              const sendWord = () => {
                if (index < words.length) {
                  const chunk = words[index] + ' ';
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ response: chunk })}\n\n`));
                  index++;
                  setTimeout(sendWord, 50); // 50ms delay between words
                } else {
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                  controller.close();
                }
              };
              
              sendWord();
            }
          });
          
          return new Response(stream, {
            headers: {
              ...corsHeaders,
              'Content-Type': 'text/plain; charset=utf-8',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
          });
        }
      }
    }

    // Handle regular (non-streaming) requests
    const aiResponse = await callRegularAI(enhancedMessage, conversationHistory || []);

    // Save to database if userId provided
    if (userId) {
      await saveChatMessage(userId, message, aiResponse);
    }

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    
    // Provide intelligent fallback response
    const fallbackResponse = getIntelligentFallback(
      typeof error === 'object' && 'message' in error ? error.message : 'general help'
    );
    
    return new Response(
      JSON.stringify({ 
        response: fallbackResponse,
        timestamp: new Date().toISOString(),
        fallback: true
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
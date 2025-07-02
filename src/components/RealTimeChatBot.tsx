import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Loader, 
  X, 
  Minimize2, 
  Maximize2,
  Copy,
  RotateCcw,
  Sparkles,
  Zap,
  ArrowLeft,
  Plus,
  Trash2,
  StopCircle,
  LogOut,
  ChevronDown
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

const RealTimeChatBot: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [showSessions, setShowSessions] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [showExitMenu, setShowExitMenu] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Initialize with welcome session
  useEffect(() => {
    if (sessions.length === 0) {
      createWelcomeSession();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [abortController]);

  const createWelcomeSession = () => {
    const welcomeSession: ChatSession = {
      id: 'welcome',
      title: 'Welcome Chat',
      messages: [
        {
          id: '1',
          role: 'assistant',
          content: `# Welcome to PrepBuddy AI! 🎯

I'm your personal placement preparation assistant. I can help you with:

## 🔧 **Technical Skills**
- **Data Structures & Algorithms** - Master DSA concepts and problem-solving
- **System Design** - Learn scalable architecture patterns
- **Programming** - Java, Python, C++, JavaScript guidance
- **Database Design** - SQL, NoSQL, optimization techniques

## 💼 **Career Preparation**
- **Resume Building** - Create compelling, ATS-optimized resumes
- **Interview Prep** - Technical and behavioral interview strategies
- **Company Research** - Insights for FAANG, startups, and product companies
- **Salary Negotiation** - Tips for getting the best offers

## 🗺️ **Study Planning**
- **Roadmaps** - 30, 60, 100-day preparation plans
- **Resource Recommendations** - Best books, courses, platforms
- **Progress Tracking** - Milestone-based learning approaches
- **Time Management** - Efficient study schedules

## Quick Start Examples:
- "Create a 100-day DSA preparation plan"
- "How to build a strong technical resume?"
- "Explain system design basics"
- "Best strategy for FAANG interviews"

**What would you like to focus on today?**`,
          timestamp: new Date()
        }
      ],
      createdAt: new Date()
    };
    
    setSessions([welcomeSession]);
    setCurrentSessionId('welcome');
    setMessages(welcomeSession.messages);
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date()
    };
    
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages([]);
    setShowSessions(false);
  };

  const switchSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      setShowSessions(false);
    }
  };

  const deleteSession = (sessionId: string) => {
    if (sessions.length <= 1) return;
    
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    
    if (currentSessionId === sessionId) {
      const remainingSessions = sessions.filter(s => s.id !== sessionId);
      if (remainingSessions.length > 0) {
        switchSession(remainingSessions[0].id);
      }
    }
  };

  const updateSessionTitle = (sessionId: string, firstMessage: string) => {
    const title = firstMessage.length > 30 
      ? firstMessage.substring(0, 30) + '...' 
      : firstMessage;
    
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, title } : s
    ));
  };

  const stopStreaming = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setIsStreaming(false);
    setStreamingMessageId(null);
    setIsLoading(false);
  };

  // Real-time streaming AI response
  const streamAIResponse = async (message: string, conversationHistory: Message[]): Promise<void> => {
    const controller = new AbortController();
    setAbortController(controller);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          userId: user?.id,
          stream: true,
          conversationHistory: conversationHistory.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp.toISOString()
          }))
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      // Create initial assistant message
      const assistantMessageId = Date.now().toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true
      };

      setMessages(prev => [...prev, assistantMessage]);
      setStreamingMessageId(assistantMessageId);
      setIsStreaming(true);
      setIsLoading(false);

      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done || controller.signal.aborted) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            
            if (data === '[DONE]') {
              setIsStreaming(false);
              setStreamingMessageId(null);
              setAbortController(null);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || parsed.response || '';
              
              if (content) {
                fullContent += content;
                
                // Update the streaming message
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: fullContent }
                    : msg
                ));
              }
            } catch (e) {
              // Handle non-JSON chunks (might be plain text)
              if (data && data !== '[DONE]') {
                fullContent += data;
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: fullContent }
                    : msg
                ));
              }
            }
          }
        }
      }

      // Finalize the message
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, isStreaming: false }
          : msg
      ));

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Streaming aborted by user');
        return;
      }
      
      console.error('Streaming Error:', error);
      
      // Fallback to regular API call
      const fallbackResponse = await callRegularAI(message, conversationHistory);
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: fallbackResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsStreaming(false);
      setStreamingMessageId(null);
      setAbortController(null);
      setIsLoading(false);
    }
  };

  // Fallback regular AI call
  const callRegularAI = async (message: string, conversationHistory: Message[]): Promise<string> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          userId: user?.id,
          conversationHistory: conversationHistory.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp.toISOString()
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('AI API Error:', error);
      return "I apologize, but I'm having trouble connecting right now. Please try again in a moment.";
    }
  };

  const sendMessage = async () => {
    const message = inputMessage.trim();
    if (!message || isLoading || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    // Update session title if first message
    if (currentSessionId && messages.length === 0) {
      updateSessionTitle(currentSessionId, message);
    }

    try {
      // Start streaming response
      await streamAIResponse(message, messages);

      // Update session with final messages
      if (currentSessionId) {
        setSessions(prev => prev.map(s => 
          s.id === currentSessionId 
            ? { ...s, messages: [...newMessages, ...messages.slice(newMessages.length)] }
            : s
        ));
      }
    } catch (error) {
      console.error('Send message error:', error);
      setIsLoading(false);
    }
  };

  const regenerateLastResponse = async () => {
    if (messages.length < 2 || isLoading || isStreaming) return;
    
    const lastUserMessage = messages[messages.length - 2];
    if (lastUserMessage.role !== 'user') return;

    const messagesWithoutLast = messages.slice(0, -1);
    setMessages(messagesWithoutLast);
    setIsLoading(true);

    try {
      await streamAIResponse(lastUserMessage.content, messagesWithoutLast.slice(0, -1));
    } catch (error) {
      console.error('Regenerate error:', error);
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatMessage = (content: string) => {
    return content
      .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-md font-medium mb-2 text-gray-700 dark:text-gray-300">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto my-2"><code class="text-sm font-mono">$1</code></pre>')
      .replace(/^- (.*$)/gm, '<li class="ml-4 mb-1">• $1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 mb-1 list-decimal">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/\n/g, '<br>');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Quick questions for easy start
  const quickQuestions = [
    "Create a 100-day placement preparation roadmap",
    "How to build an ATS-optimized resume?",
    "Explain system design fundamentals",
    "Best DSA practice strategy for interviews",
    "How to prepare for behavioral interviews?",
    "FAANG interview preparation tips"
  ];

  // Close chatbot function
  const closeChatbot = () => {
    if (isStreaming) {
      stopStreaming();
    }
    setIsOpen(false);
    setIsMinimized(false);
    setShowSessions(false);
    setShowExitMenu(false);
  };

  // Minimize chatbot function
  const minimizeChatbot = () => {
    setIsMinimized(true);
    setShowSessions(false);
    setShowExitMenu(false);
  };

  // Maximize chatbot function
  const maximizeChatbot = () => {
    setIsMinimized(false);
    setShowExitMenu(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 group hover:scale-110 animate-pulse"
        aria-label="Open PrepBuddy AI Chat"
      >
        <MessageCircle className="h-6 w-6" />
        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
          <Sparkles className="h-3 w-3" />
        </div>
        <div className="absolute bottom-full right-0 mb-2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg">
          Chat with PrepBuddy AI ✨
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-[500px] h-[700px]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-t-xl">
        <div className="flex items-center space-x-3">
          {/* Back Button - Primary Exit */}
          <button
            onClick={closeChatbot}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200 border border-white/30"
            title="Exit Chat"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <span className="font-semibold">PrepBuddy AI</span>
            <div className="flex items-center space-x-1 text-xs opacity-90">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                isStreaming ? 'bg-yellow-400' : 'bg-green-400'
              }`}></div>
              <span>{isStreaming ? 'Typing...' : 'Online & Ready'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSessions(!showSessions)}
            className="p-2 hover:bg-white/20 rounded transition-colors duration-200"
            title="Chat History"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
          <button
            onClick={createNewSession}
            className="p-2 hover:bg-white/20 rounded transition-colors duration-200"
            title="New Chat"
          >
            <Plus className="h-4 w-4" />
          </button>
          
          {/* Exit Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExitMenu(!showExitMenu)}
              className="p-2 hover:bg-white/20 rounded transition-colors duration-200 flex items-center space-x-1"
              title="Exit Options"
            >
              <LogOut className="h-4 w-4" />
              <ChevronDown className="h-3 w-3" />
            </button>
            
            {showExitMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 min-w-[160px] z-10">
                <button
                  onClick={minimizeChatbot}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <Minimize2 className="h-4 w-4" />
                  <span>Minimize</span>
                </button>
                <button
                  onClick={closeChatbot}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                  <span>Close Chat</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Minimized State */}
      {isMinimized && (
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">PrepBuddy AI</span>
            {isStreaming && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Typing...</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={maximizeChatbot}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200"
              title="Maximize"
            >
              <Maximize2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={closeChatbot}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors duration-200"
              title="Close"
            >
              <X className="h-4 w-4 text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>
      )}

      {!isMinimized && (
        <>
          {/* Chat Sessions Sidebar */}
          {showSessions && (
            <div className="absolute top-16 left-0 w-64 h-[calc(100%-4rem)] bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-10 overflow-y-auto">
              <div className="p-3 space-y-2">
                <button
                  onClick={createNewSession}
                  className="w-full flex items-center space-x-2 p-3 bg-indigo-100 dark:bg-indigo-900 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-lg transition-colors duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm font-medium">New Chat</span>
                </button>
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                      currentSessionId === session.id
                        ? 'bg-indigo-100 dark:bg-indigo-900'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => switchSession(session.id)}
                  >
                    <span className="text-sm truncate flex-1">{session.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-200 dark:hover:bg-red-800 rounded text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex flex-col h-[656px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Quick Questions for empty chat */}
              {messages.length === 0 && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Quick Start Questions
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Click any question to get started!
                    </p>
                  </div>
                  <div className="grid gap-2">
                    {quickQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setInputMessage(question);
                          setTimeout(() => sendMessage(), 100);
                        }}
                        className="text-left p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 text-sm border border-gray-200 dark:border-gray-700"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-[85%] ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
                    }`}>
                      {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className="group">
                      <div className={`rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                      }`}>
                        <div 
                          className="text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                        />
                        {message.isStreaming && (
                          <div className="inline-block w-2 h-4 bg-indigo-600 animate-pulse ml-1"></div>
                        )}
                      </div>
                      {message.role === 'assistant' && !message.isStreaming && (
                        <div className="flex items-center space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => copyToClipboard(message.content)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400"
                            title="Copy"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                          <button
                            onClick={regenerateLastResponse}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400"
                            title="Regenerate"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading State */}
              {isLoading && !isStreaming && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2">
                        <Loader className="h-4 w-4 animate-spin text-indigo-600" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">PrepBuddy is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              {/* Stop Streaming Button */}
              {isStreaming && (
                <div className="mb-3 flex justify-center">
                  <button
                    onClick={stopStreaming}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    <StopCircle className="h-4 w-4" />
                    <span>Stop Generating</span>
                  </button>
                </div>
              )}
              
              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask PrepBuddy anything about placement preparation..."
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm resize-none max-h-32"
                    disabled={isLoading || isStreaming}
                    rows={1}
                    style={{ minHeight: '44px' }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || isStreaming || !inputMessage.trim()}
                    className="absolute right-2 bottom-2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                  >
                    {isLoading || isStreaming ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Press Enter to send, Shift+Enter for new line</span>
                <div className="flex items-center space-x-1">
                  <Zap className="h-3 w-3 text-yellow-500" />
                  <span>Real-time AI Streaming</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Exit Confirmation Overlay */}
      {showExitMenu && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setShowExitMenu(false)}
        />
      )}
    </div>
  );
};

export default RealTimeChatBot;
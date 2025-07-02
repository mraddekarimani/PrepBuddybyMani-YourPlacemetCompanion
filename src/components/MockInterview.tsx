import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { generateQuestions, analyzeResponse, Question } from '../lib/aiInterview';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle,
  Clock,
  Brain,
  MessageSquare,
  Star,
  TrendingUp,
  User,
  Loader,
  History,
  Award,
  Camera,
  Download,
  Upload,
  Settings,
  Monitor,
  Smartphone,
  Globe,
  Code,
  Database,
  Users,
  Lightbulb,
  Zap,
  Target,
  StopCircle,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCw,
  Save,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

interface InterviewResponse {
  questionId: string;
  response: string;
  timeSpent: number;
  score: number;
  feedback: string;
  videoRecording?: string;
  audioRecording?: string;
  codeSubmission?: string;
}

interface InterviewSession {
  id: string;
  questions: Question[];
  currentQuestionIndex: number;
  responses: InterviewResponse[];
  startTime: Date;
  endTime?: Date;
  overallScore?: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  interviewType: string;
  platformFocus: string;
  hintsUsed: number;
  codeSubmissions: any[];
  performanceMetrics: any;
}

interface PastSession {
  id: string;
  category: string;
  difficulty: string;
  interview_type: string;
  platform_focus: string;
  overall_score: number;
  started_at: string;
  completed_at: string;
  hints_used: number;
}

interface RecordingSettings {
  videoEnabled: boolean;
  audioEnabled: boolean;
  videoQuality: 'low' | 'medium' | 'high';
  audioQuality: 'low' | 'medium' | 'high';
  recordScreen: boolean;
  recordCamera: boolean;
}

const MockInterview: React.FC = () => {
  const { user } = useAuth();
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [codeSubmission, setCodeSubmission] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('technical');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedInterviewType, setSelectedInterviewType] = useState<string>('standard');
  const [selectedPlatformFocus, setSelectedPlatformFocus] = useState<string>('general');
  const [showResults, setShowResults] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [pastSessions, setPastSessions] = useState<PastSession[]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentHint, setCurrentHint] = useState<string>('');
  const [showHint, setShowHint] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Recording states
  const [recordingSettings, setRecordingSettings] = useState<RecordingSettings>({
    videoEnabled: true,
    audioEnabled: true,
    videoQuality: 'medium',
    audioQuality: 'medium',
    recordScreen: false,
    recordCamera: true
  });
  const [recordings, setRecordings] = useState<{
    video: Blob | null;
    audio: Blob | null;
    screen: Blob | null;
  }>({
    video: null,
    audio: null,
    screen: null
  });
  const [recordingUrls, setRecordingUrls] = useState<{
    video: string | null;
    audio: string | null;
    screen: string | null;
  }>({
    video: null,
    audio: null,
    screen: null
  });
  const [isVideoMinimized, setIsVideoMinimized] = useState(false);
  const [showRecordingPreview, setShowRecordingPreview] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const screenRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordedChunksRef = useRef<{
    video: Blob[];
    audio: Blob[];
    screen: Blob[];
  }>({
    video: [],
    audio: [],
    screen: []
  });

  const categories = [
    { value: 'technical', label: 'Technical/DSA', icon: <Brain className="h-4 w-4" /> },
    { value: 'behavioral', label: 'Behavioral', icon: <MessageSquare className="h-4 w-4" /> },
    { value: 'system-design', label: 'System Design', icon: <TrendingUp className="h-4 w-4" /> },
    { value: 'coding', label: 'Live Coding', icon: <Code className="h-4 w-4" /> },
    { value: 'database', label: 'Database Design', icon: <Database className="h-4 w-4" /> },
    { value: 'frontend', label: 'Frontend', icon: <Monitor className="h-4 w-4" /> },
    { value: 'backend', label: 'Backend', icon: <Globe className="h-4 w-4" /> },
    { value: 'mobile', label: 'Mobile Development', icon: <Smartphone className="h-4 w-4" /> },
  ];

  const interviewTypes = [
    { value: 'standard', label: 'Standard Interview', description: 'Traditional Q&A format' },
    { value: 'coding', label: 'Coding Interview', description: 'Live coding with test cases' },
    { value: 'system-design', label: 'System Design', description: 'Architecture and scalability' },
    { value: 'behavioral', label: 'Behavioral', description: 'STAR method questions' },
  ];

  const platformFocus = [
    { value: 'general', label: 'General', description: 'Standard interview approach' },
    { value: 'google', label: 'Google', description: 'Focus on scalability & efficiency' },
    { value: 'amazon', label: 'Amazon', description: 'Leadership principles focused' },
    { value: 'microsoft', label: 'Microsoft', description: 'Enterprise solutions' },
    { value: 'meta', label: 'Meta', description: 'Social scale & real-time systems' },
    { value: 'apple', label: 'Apple', description: 'User experience & performance' },
    { value: 'netflix', label: 'Netflix', description: 'Streaming & content delivery' },
    { value: 'uber', label: 'Uber', description: 'Real-time & marketplace systems' },
    { value: 'startup', label: 'Startup', description: 'MVP & resource constraints' },
  ];

  useEffect(() => {
    if (user) {
      fetchPastSessions();
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      stopAllRecording();
    };
  }, [user]);

  const fetchPastSessions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('id, category, difficulty, interview_type, platform_focus, overall_score, started_at, completed_at, hints_used')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)
        .order('started_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setPastSessions(data || []);
    } catch (error) {
      console.error('Error fetching past sessions:', error);
    }
  };

  const saveSession = async (session: InterviewSession) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('interview_sessions')
        .insert({
          user_id: user.id,
          category: session.category,
          difficulty: session.difficulty,
          interview_type: session.interviewType,
          platform_focus: session.platformFocus,
          questions: session.questions,
          responses: session.responses,
          overall_score: session.overallScore,
          started_at: session.startTime.toISOString(),
          completed_at: session.endTime?.toISOString(),
          hints_used: session.hintsUsed,
          code_submissions: session.codeSubmissions,
          performance_metrics: session.performanceMetrics,
        });

      if (error) throw error;
      await fetchPastSessions();
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const startInterview = async () => {
    setIsLoading(true);
    
    try {
      const questions = await generateQuestions(
        selectedCategory, 
        selectedDifficulty, 
        3,
        selectedInterviewType,
        selectedPlatformFocus
      );
      
      const session: InterviewSession = {
        id: Date.now().toString(),
        questions,
        currentQuestionIndex: 0,
        responses: [],
        startTime: new Date(),
        category: selectedCategory,
        difficulty: selectedDifficulty,
        interviewType: selectedInterviewType,
        platformFocus: selectedPlatformFocus,
        hintsUsed: 0,
        codeSubmissions: [],
        performanceMetrics: {}
      };
      
      setCurrentSession(session);
      setIsInterviewActive(true);
      setTimeRemaining(session.questions[0].timeLimit);
      setHintsUsed(0);
      
      // Start timer
      startTimer(session.questions[0].timeLimit);
      
      // Auto-start recording if enabled
      if (recordingSettings.videoEnabled || recordingSettings.audioEnabled) {
        await startRecording();
      }
    } catch (error) {
      console.error('Error starting interview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startTimer = (duration: number) => {
    setTimeRemaining(duration);
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          nextQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Enhanced recording functions
  const getVideoConstraints = () => {
    const constraints: MediaStreamConstraints = {
      audio: recordingSettings.audioEnabled,
      video: recordingSettings.videoEnabled ? {
        width: recordingSettings.videoQuality === 'high' ? 1920 : 
               recordingSettings.videoQuality === 'medium' ? 1280 : 640,
        height: recordingSettings.videoQuality === 'high' ? 1080 : 
                recordingSettings.videoQuality === 'medium' ? 720 : 480,
        frameRate: recordingSettings.videoQuality === 'high' ? 30 : 
                   recordingSettings.videoQuality === 'medium' ? 24 : 15,
        facingMode: 'user'
      } : false
    };
    return constraints;
  };

  const getAudioConstraints = () => {
    return {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: recordingSettings.audioQuality === 'high' ? 48000 : 
                    recordingSettings.audioQuality === 'medium' ? 44100 : 22050,
        channelCount: 2
      }
    };
  };

  const startRecording = async () => {
    try {
      recordedChunksRef.current = { video: [], audio: [], screen: [] };
      
      // Start camera recording
      if (recordingSettings.recordCamera && recordingSettings.videoEnabled) {
        const videoStream = await navigator.mediaDevices.getUserMedia(getVideoConstraints());
        videoStreamRef.current = videoStream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = videoStream;
        }
        
        const videoRecorder = new MediaRecorder(videoStream, {
          mimeType: 'video/webm;codecs=vp9'
        });
        mediaRecorderRef.current = videoRecorder;
        
        videoRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.video.push(event.data);
          }
        };
        
        videoRecorder.onstop = () => {
          const videoBlob = new Blob(recordedChunksRef.current.video, { type: 'video/webm' });
          setRecordings(prev => ({ ...prev, video: videoBlob }));
          setRecordingUrls(prev => ({ ...prev, video: URL.createObjectURL(videoBlob) }));
        };
        
        videoRecorder.start(1000); // Record in 1-second chunks
        setIsVideoOn(true);
      }
      
      // Start screen recording
      if (recordingSettings.recordScreen) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            mediaSource: 'screen',
            width: 1920,
            height: 1080,
            frameRate: 30
          },
          audio: true
        });
        screenStreamRef.current = screenStream;
        
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = screenStream;
        }
        
        const screenRecorder = new MediaRecorder(screenStream, {
          mimeType: 'video/webm;codecs=vp9'
        });
        screenRecorderRef.current = screenRecorder;
        
        screenRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.screen.push(event.data);
          }
        };
        
        screenRecorder.onstop = () => {
          const screenBlob = new Blob(recordedChunksRef.current.screen, { type: 'video/webm' });
          setRecordings(prev => ({ ...prev, screen: screenBlob }));
          setRecordingUrls(prev => ({ ...prev, screen: URL.createObjectURL(screenBlob) }));
        };
        
        screenRecorder.start(1000);
      }
      
      // Start audio-only recording
      if (recordingSettings.audioEnabled && !recordingSettings.videoEnabled) {
        const audioStream = await navigator.mediaDevices.getUserMedia(getAudioConstraints());
        audioStreamRef.current = audioStream;
        
        const audioRecorder = new MediaRecorder(audioStream, {
          mimeType: 'audio/webm;codecs=opus'
        });
        audioRecorderRef.current = audioRecorder;
        
        audioRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.audio.push(event.data);
          }
        };
        
        audioRecorder.onstop = () => {
          const audioBlob = new Blob(recordedChunksRef.current.audio, { type: 'audio/webm' });
          setRecordings(prev => ({ ...prev, audio: audioBlob }));
          setRecordingUrls(prev => ({ ...prev, audio: URL.createObjectURL(audioBlob) }));
        };
        
        audioRecorder.start(1000);
        setIsAudioOn(true);
      }
      
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please check your camera and microphone permissions.');
    }
  };

  const stopAllRecording = () => {
    // Stop video recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    // Stop screen recording
    if (screenRecorderRef.current && screenRecorderRef.current.state !== 'inactive') {
      screenRecorderRef.current.stop();
    }
    
    // Stop audio recording
    if (audioRecorderRef.current && audioRecorderRef.current.state !== 'inactive') {
      audioRecorderRef.current.stop();
    }
    
    // Stop all streams
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(track => track.stop());
      videoStreamRef.current = null;
    }
    
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    
    setIsRecording(false);
    setIsVideoOn(false);
    setIsAudioOn(false);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      stopAllRecording();
    } else {
      await startRecording();
    }
  };

  const downloadRecording = (type: 'video' | 'audio' | 'screen') => {
    const recording = recordings[type];
    const url = recordingUrls[type];
    
    if (recording && url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = `interview-${type}-${new Date().toISOString()}.${type === 'audio' ? 'webm' : 'webm'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const clearRecordings = () => {
    // Revoke object URLs to free memory
    Object.values(recordingUrls).forEach(url => {
      if (url) URL.revokeObjectURL(url);
    });
    
    setRecordings({ video: null, audio: null, screen: null });
    setRecordingUrls({ video: null, audio: null, screen: null });
  };

  const getHint = async () => {
    if (!currentSession) return;
    
    try {
      const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex];
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-interview/hint`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: currentQuestion.question,
          category: currentQuestion.category,
          difficulty: currentQuestion.difficulty,
          hintsUsed: hintsUsed
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentHint(data.hint);
        setShowHint(true);
        setHintsUsed(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error getting hint:', error);
    }
  };

  const getSuggestions = async () => {
    if (!currentSession) return;
    
    try {
      const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex];
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-interview/suggestions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: currentQuestion.question,
          currentResponse: currentResponse,
          category: currentQuestion.category,
          interviewType: currentSession.interviewType
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
  };

  const nextQuestion = async () => {
    if (!currentSession) return;
    
    stopTimer();
    setIsLoading(true);
    
    try {
      const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex];
      const timeSpent = currentQuestion.timeLimit - timeRemaining;
      
      // Analyze response using AI
      const analysis = await analyzeResponse(
        currentQuestion.question,
        currentResponse,
        currentQuestion.expectedPoints,
        currentSession.category,
        currentSession.interviewType,
        codeSubmission
      );
      
      const newResponse: InterviewResponse = {
        questionId: currentQuestion.id,
        response: currentResponse,
        timeSpent,
        score: analysis.score,
        feedback: analysis.feedback,
        codeSubmission: codeSubmission || undefined,
        videoRecording: recordingUrls.video || undefined,
        audioRecording: recordingUrls.audio || undefined
      };
      
      const updatedSession = {
        ...currentSession,
        responses: [...currentSession.responses, newResponse],
        hintsUsed: hintsUsed,
        codeSubmissions: codeSubmission ? [...currentSession.codeSubmissions, { 
          questionId: currentQuestion.id, 
          code: codeSubmission,
          timestamp: new Date().toISOString()
        }] : currentSession.codeSubmissions
      };
      
      if (currentSession.currentQuestionIndex < currentSession.questions.length - 1) {
        // Move to next question
        const nextIndex = currentSession.currentQuestionIndex + 1;
        const nextQuestion = currentSession.questions[nextIndex];
        
        updatedSession.currentQuestionIndex = nextIndex;
        setCurrentSession(updatedSession);
        setCurrentResponse('');
        setCodeSubmission('');
        setShowHint(false);
        setShowSuggestions(false);
        startTimer(nextQuestion.timeLimit);
      } else {
        // Interview complete
        const overallScore = updatedSession.responses.reduce((sum, r) => sum + r.score, 0) / updatedSession.responses.length;
        updatedSession.endTime = new Date();
        updatedSession.overallScore = overallScore;
        updatedSession.performanceMetrics = {
          totalHintsUsed: hintsUsed,
          averageResponseTime: updatedSession.responses.reduce((sum, r) => sum + r.timeSpent, 0) / updatedSession.responses.length,
          codeSubmissionsCount: updatedSession.codeSubmissions.length,
          recordingsGenerated: {
            video: !!recordingUrls.video,
            audio: !!recordingUrls.audio,
            screen: !!recordingUrls.screen
          }
        };
        
        setCurrentSession(updatedSession);
        setIsInterviewActive(false);
        setShowResults(true);
        stopAllRecording();
        
        // Save session to database
        await saveSession(updatedSession);
      }
    } catch (error) {
      console.error('Error processing question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetInterview = () => {
    setCurrentSession(null);
    setIsInterviewActive(false);
    setShowResults(false);
    setShowHistory(false);
    setShowSettings(false);
    setCurrentResponse('');
    setCodeSubmission('');
    setTimeRemaining(0);
    setHintsUsed(0);
    setShowHint(false);
    setShowSuggestions(false);
    stopTimer();
    stopAllRecording();
    clearRecordings();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Recording Settings Component
  const RecordingSettingsPanel = () => (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
        <Settings className="h-5 w-5 mr-2" />
        Recording Settings
      </h3>
      
      <div className="space-y-6">
        {/* Recording Options */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Recording Options</h4>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={recordingSettings.recordCamera}
                onChange={(e) => setRecordingSettings(prev => ({ ...prev, recordCamera: e.target.checked }))}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Record Camera</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={recordingSettings.recordScreen}
                onChange={(e) => setRecordingSettings(prev => ({ ...prev, recordScreen: e.target.checked }))}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Record Screen</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={recordingSettings.videoEnabled}
                onChange={(e) => setRecordingSettings(prev => ({ ...prev, videoEnabled: e.target.checked }))}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Enable Video Recording</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={recordingSettings.audioEnabled}
                onChange={(e) => setRecordingSettings(prev => ({ ...prev, audioEnabled: e.target.checked }))}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Enable Audio Recording</span>
            </label>
          </div>
        </div>

        {/* Quality Settings */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Quality Settings</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Video Quality
              </label>
              <select
                value={recordingSettings.videoQuality}
                onChange={(e) => setRecordingSettings(prev => ({ ...prev, videoQuality: e.target.value as 'low' | 'medium' | 'high' }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="low">Low (640x480)</option>
                <option value="medium">Medium (1280x720)</option>
                <option value="high">High (1920x1080)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Audio Quality
              </label>
              <select
                value={recordingSettings.audioQuality}
                onChange={(e) => setRecordingSettings(prev => ({ ...prev, audioQuality: e.target.value as 'low' | 'medium' | 'high' }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="low">Low (22kHz)</option>
                <option value="medium">Medium (44kHz)</option>
                <option value="high">High (48kHz)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Recording Preview Component
  const RecordingPreview = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recording Preview</h3>
        <button
          onClick={() => setShowRecordingPreview(false)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="space-y-4">
        {recordingUrls.video && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Camera Recording</h4>
            <video
              src={recordingUrls.video}
              controls
              className="w-full max-w-md rounded-lg"
            />
            <button
              onClick={() => downloadRecording('video')}
              className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
            >
              <Download className="h-4 w-4 mr-1 inline" />
              Download Video
            </button>
          </div>
        )}
        
        {recordingUrls.screen && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Screen Recording</h4>
            <video
              src={recordingUrls.screen}
              controls
              className="w-full max-w-md rounded-lg"
            />
            <button
              onClick={() => downloadRecording('screen')}
              className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
            >
              <Download className="h-4 w-4 mr-1 inline" />
              Download Screen
            </button>
          </div>
        )}
        
        {recordingUrls.audio && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Audio Recording</h4>
            <audio
              src={recordingUrls.audio}
              controls
              className="w-full"
            />
            <button
              onClick={() => downloadRecording('audio')}
              className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
            >
              <Download className="h-4 w-4 mr-1 inline" />
              Download Audio
            </button>
          </div>
        )}
        
        <button
          onClick={clearRecordings}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All Recordings
        </button>
      </div>
    </div>
  );

  if (showHistory) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Interview History</h2>
              <p className="text-gray-600 dark:text-gray-400">Your past interview sessions with enhanced features</p>
            </div>
            <button
              onClick={() => setShowHistory(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              Back
            </button>
          </div>
          
          <div className="p-6">
            {pastSessions.length > 0 ? (
              <div className="space-y-4">
                {pastSessions.map((session) => (
                  <div key={session.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {categories.find(c => c.value === session.category)?.label || session.category}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                          <span>Type: {session.interview_type}</span>
                          <span>Platform: {session.platform_focus}</span>
                          <span>Difficulty: {session.difficulty}</span>
                          <span>Hints Used: {session.hints_used}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {formatDate(session.started_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          session.overall_score >= 80 
                            ? 'text-green-600 dark:text-green-400'
                            : session.overall_score >= 60
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-red-600 dark:text-red-400'
                        }`}>
                          {session.overall_score}%
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Score</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No interview sessions yet</p>
                <button
                  onClick={() => setShowHistory(false)}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
                >
                  Start Your First Interview
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showResults && currentSession) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Interview Results</h2>
            <p className="text-gray-600 dark:text-gray-400">Here's how you performed with enhanced analytics</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Overall Score */}
            <div className="text-center p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900 dark:to-purple-900 rounded-lg">
              <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                {currentSession.overallScore?.toFixed(0)}%
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-300 mt-2">Overall Score</p>
              <div className="flex justify-center mt-4 space-x-4 text-sm">
                <span className="flex items-center text-gray-600 dark:text-gray-400">
                  <Lightbulb className="h-4 w-4 mr-1" />
                  Hints Used: {currentSession.hintsUsed}
                </span>
                <span className="flex items-center text-gray-600 dark:text-gray-400">
                  <Code className="h-4 w-4 mr-1" />
                  Code Submissions: {currentSession.codeSubmissions.length}
                </span>
              </div>
              {currentSession.overallScore && currentSession.overallScore >= 80 && (
                <div className="flex justify-center mt-4">
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <Award className="h-5 w-5 mr-2" />
                    <span className="font-medium">Excellent Performance!</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Recording Downloads */}
            {(recordingUrls.video || recordingUrls.audio || recordingUrls.screen) && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Your Interview Recordings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recordingUrls.video && (
                    <button
                      onClick={() => downloadRecording('video')}
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <Video className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Camera Recording</div>
                      <div className="text-xs text-gray-500">Download Video</div>
                    </button>
                  )}
                  {recordingUrls.screen && (
                    <button
                      onClick={() => downloadRecording('screen')}
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <Monitor className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Screen Recording</div>
                      <div className="text-xs text-gray-500">Download Screen</div>
                    </button>
                  )}
                  {recordingUrls.audio && (
                    <button
                      onClick={() => downloadRecording('audio')}
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <Volume2 className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Audio Recording</div>
                      <div className="text-xs text-gray-500">Download Audio</div>
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Question-wise Results */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Question-wise Performance</h3>
              {currentSession.responses.map((response, index) => {
                const question = currentSession.questions.find(q => q.id === response.questionId);
                return (
                  <div key={response.questionId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Question {index + 1}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-sm ${
                          response.score >= 80 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : response.score >= 70
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {response.score}%
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatTime(response.timeSpent)}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">{question?.question}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">{response.feedback}</p>
                    {response.codeSubmission && (
                      <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Code Submission:</h5>
                        <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                          {response.codeSubmission}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowRecordingPreview(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                <Eye className="h-4 w-4 mr-2 inline" />
                View Recordings
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <History className="h-4 w-4 mr-2 inline" />
                View History
              </button>
              <button
                onClick={resetInterview}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
              >
                Start New Interview
              </button>
            </div>
          </div>
        </div>
        
        {/* Recording Preview Modal */}
        {showRecordingPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <RecordingPreview />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Enhanced AI Mock Interview</h2>
            <p className="text-gray-600 dark:text-gray-400">Practice with AI-powered questions, video recording, and real-time feedback</p>
          </div>
          <div className="flex space-x-2">
            {pastSessions.length > 0 && (
              <button
                onClick={() => setShowHistory(true)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <History className="h-4 w-4 mr-2 inline" />
                History
              </button>
            )}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
            >
              <Settings className="h-4 w-4 mr-2 inline" />
              Settings
            </button>
          </div>
        </div>
        
        {!isInterviewActive ? (
          <div className="p-6 space-y-6">
            {/* Recording Settings */}
            {showSettings && <RecordingSettingsPanel />}
            
            {/* Interview Setup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Interview Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Interview Type
                </label>
                <select
                  value={selectedInterviewType}
                  onChange={(e) => setSelectedInterviewType(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {interviewTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Platform Focus
                </label>
                <select
                  value={selectedPlatformFocus}
                  onChange={(e) => setSelectedPlatformFocus(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {platformFocus.map(platform => (
                    <option key={platform.value} value={platform.value}>
                      {platform.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Enhanced Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900 rounded-lg">
                <Camera className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-2" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Video Recording</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Record your interview for review</p>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                <Monitor className="h-8 w-8 text-green-600 dark:text-green-400 mb-2" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Screen Recording</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Capture coding sessions</p>
              </div>
              
              <div className="p-4 bg-amber-50 dark:bg-amber-900 rounded-lg">
                <Lightbulb className="h-8 w-8 text-amber-600 dark:text-amber-400 mb-2" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Smart Hints</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get contextual hints when stuck</p>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
                <Zap className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Live Suggestions</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Real-time response guidance</p>
              </div>
            </div>
            
            {/* Start Button */}
            <div className="text-center">
              <button
                onClick={startInterview}
                disabled={isLoading}
                className="px-8 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 flex items-center mx-auto disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Start Enhanced Interview
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Interview Header */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Question {(currentSession?.currentQuestionIndex || 0) + 1} of {currentSession?.questions.length}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>Category: {categories.find(c => c.value === selectedCategory)?.label}</span>
                  <span>Type: {selectedInterviewType}</span>
                  <span>Platform: {selectedPlatformFocus}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-lg font-semibold">
                  <Clock className="h-5 w-5 mr-2 text-amber-500" />
                  <span className={timeRemaining <= 30 ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
                {hintsUsed > 0 && (
                  <div className="flex items-center text-sm text-purple-600 dark:text-purple-400">
                    <Lightbulb className="h-4 w-4 mr-1" />
                    <span>Hints: {hintsUsed}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Question */}
            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-4">
                {currentSession?.questions[currentSession.currentQuestionIndex]?.question}
              </h4>
              
              {/* Expected Points */}
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key points to consider:</p>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {currentSession?.questions[currentSession.currentQuestionIndex]?.expectedPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
              
              {/* Test Cases for Coding Questions */}
              {selectedInterviewType === 'coding' && currentSession?.questions[currentSession.currentQuestionIndex]?.testCases && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Test Cases:</p>
                  <div className="space-y-2">
                    {currentSession.questions[currentSession.currentQuestionIndex].testCases?.map((testCase, index) => (
                      <div key={index} className="p-2 bg-white dark:bg-gray-800 rounded border">
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          <strong>Input:</strong> {testCase.input} | <strong>Output:</strong> {testCase.expectedOutput}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">{testCase.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Recording Controls */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setIsVideoMinimized(!isVideoMinimized)}
                className={`p-3 rounded-full ${isVideoOn ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
                title={isVideoMinimized ? 'Show Video' : 'Minimize Video'}
              >
                {isVideoMinimized ? <Maximize className="h-5 w-5" /> : <Minimize className="h-5 w-5" />}
              </button>
              
              <button
                onClick={toggleRecording}
                className={`p-3 rounded-full ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
                title={isRecording ? 'Stop Recording' : 'Start Recording'}
              >
                {isRecording ? <StopCircle className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
              </button>
              
              <button
                onClick={() => setIsAudioOn(!isAudioOn)}
                className={`p-3 rounded-full ${isAudioOn ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
                title={isAudioOn ? 'Mute Audio' : 'Enable Audio'}
              >
                {isAudioOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </button>
            </div>
            
            {/* Video Display */}
            {isVideoOn && !isVideoMinimized && (
              <div className="flex justify-center space-x-4">
                {recordingSettings.recordCamera && (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      className="w-64 h-48 bg-gray-900 rounded-lg"
                    />
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                      Camera
                    </div>
                  </div>
                )}
                
                {recordingSettings.recordScreen && (
                  <div className="relative">
                    <video
                      ref={screenVideoRef}
                      autoPlay
                      muted
                      className="w-64 h-48 bg-gray-900 rounded-lg"
                    />
                    <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                      Screen
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Response Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Response
              </label>
              <textarea
                value={currentResponse}
                onChange={(e) => setCurrentResponse(e.target.value)}
                rows={6}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Type your response here or use voice recording..."
                disabled={isLoading}
              />
            </div>
            
            {/* Code Submission for Coding Questions */}
            {selectedInterviewType === 'coding' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Code Solution
                </label>
                <textarea
                  value={codeSubmission}
                  onChange={(e) => setCodeSubmission(e.target.value)}
                  rows={8}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
                  placeholder="Write your code solution here..."
                  disabled={isLoading}
                />
              </div>
            )}
            
            {/* Hints and Suggestions */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={getHint}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200 flex items-center"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Get Hint ({hintsUsed})
              </button>
              
              <button
                onClick={getSuggestions}
                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors duration-200 flex items-center"
              >
                <Zap className="h-4 w-4 mr-2" />
                Get Suggestions
              </button>
            </div>
            
            {/* Hint Display */}
            {showHint && currentHint && (
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  Hint
                </h4>
                <p className="text-purple-800 dark:text-purple-200">{currentHint}</p>
                <button
                  onClick={() => setShowHint(false)}
                  className="mt-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                >
                  Hide Hint
                </button>
              </div>
            )}
            
            {/* Suggestions Display */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Suggestions
                </h4>
                <ul className="list-disc list-inside text-amber-800 dark:text-amber-200 space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="mt-2 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200"
                >
                  Hide Suggestions
                </button>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={resetInterview}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4 mr-2 inline" />
                Reset
              </button>
              
              <button
                onClick={nextQuestion}
                disabled={isLoading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 flex items-center disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    {(currentSession?.currentQuestionIndex || 0) < (currentSession?.questions.length || 1) - 1 ? 'Next Question' : 'Finish Interview'}
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockInterview;
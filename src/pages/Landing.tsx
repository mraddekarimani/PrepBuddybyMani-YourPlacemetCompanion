import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Target,
  Calendar,
  Award,
  BarChart2,
  Users,
  CheckCircle,
  Github,
  Code2,
  Star,
  TrendingUp,
  Zap,
  Brain,
  MessageSquare,
  Gamepad2,
  Trophy,
  Clock,
  Shield,
  Sparkles,
  ChevronDown,
  Quote,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  Heart,
  Coffee,
  Rocket,
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing: React.FC = () => {
  const { user } = useAuth();
  const [isStatsVisible, setIsStatsVisible] = useState(false);
  const [isMuted, setIsMuted] = useState();

  const toggleMute = () => setIsMuted(!isMuted);

  const features = [
    {
      icon: <Target className="h-8 w-8 text-indigo-300" />,
      title: "100-Day Challenge",
      description: "Structured preparation plan covering DSA, aptitude, and interview prep",
      color: "from-indigo-500 to-purple-600"
    },
    {
      icon: <Calendar className="h-8 w-8 text-green-300" />,
      title: "Daily Progress Tracking",
      description: "Monitor your daily tasks and maintain consistency",
      color: "from-green-500 to-teal-600"
    },
    {
      icon: <Award className="h-8 w-8 text-amber-300" />,
      title: "Streak System",
      description: "Build momentum with daily completion streaks",
      color: "from-amber-500 to-orange-600"
    },
    {
      icon: <BarChart2 className="h-8 w-8 text-purple-300" />,
      title: "Progress Analytics",
      description: "Visual insights into your preparation journey",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-blue-300" />,
      title: "AI Mock Interviews",
      description: "Practice with AI-powered interview simulations",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: <Gamepad2 className="h-8 w-8 text-rose-300" />,
      title: "Interactive Quizzes",
      description: "Test your knowledge with gamified learning",
      color: "from-rose-500 to-red-600"
    },
    {
      icon: <Brain className="h-8 w-8 text-cyan-300" />,
      title: "AI Assistant",
      description: "24/7 AI mentor for doubt resolution and guidance",
      color: "from-cyan-500 to-blue-600"
    },
    {
      icon: <Shield className="h-8 w-8 text-emerald-300" />,
      title: "Secure & Private",
      description: "Your data is encrypted and completely secure",
      color: "from-emerald-500 to-green-600"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Students Prepared", icon: <Users className="h-6 w-6" /> },
    { number: "95%", label: "Success Rate", icon: <Trophy className="h-6 w-6" /> },
    { number: "500+", label: "Companies Covered", icon: <Globe className="h-6 w-6" /> },
    { number: "24/7", label: "AI Support", icon: <Clock className="h-6 w-6" /> }
  ];

  const codingProfiles = [
    {
      icon: <Code2 />,
      name: "GeeksforGeeks",
      link: "https://www.geeksforgeeks.org/user/addekarimcov2/",
      color: "text-green-200 hover:text-green-300",
      description: "Practice DSA problems"
    },
    {
      icon: <Github />,
      name: "LeetCode",
      link: "https://leetcode.com/u/Manikanta11/",
      color: "text-yellow-200 hover:text-yellow-300",
      description: "Coding challenges"
    },
    {
      icon: <Code2 />,
      name: "CodeChef",
      link: "https://www.codechef.com/users/addekarimani",
      color: "text-purple-200 hover:text-purple-300",
      description: "Competitive programming"
    }
  ];

  const roadmapSteps = [
    {
      week: "Week 1-2",
      title: "Foundation Building",
      description: "Master basic data structures and algorithms",
      icon: <BookOpen className="h-6 w-6" />
    },
    {
      week: "Week 3-6",
      title: "Core Concepts",
      description: "Deep dive into advanced DSA and system design",
      icon: <Brain className="h-6 w-6" />
    },
    {
      week: "Week 7-10",
      title: "Practice & Polish",
      description: "Mock interviews and real-world problem solving",
      icon: <Target className="h-6 w-6" />
    },
    {
      week: "Week 11-14",
      title: "Interview Ready",
      description: "Company-specific preparation and final polish",
      icon: <Rocket className="h-6 w-6" />
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsStatsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const statsElement = document.getElementById('stats-section');
    if (statsElement) {
      observer.observe(statsElement);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Video with mute toggle */}
      <video
        autoPlay
        loop
        muted={isMuted}
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover z-[-1]"
      >
        <source src="/video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 z-20 bg-black bg-opacity-50 text-white px-4 py-2 rounded"
      >
        {isMuted ? "Unmute Video" : "Mute Video"}
      </button>



      {/* Enhanced Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center"
        >
          <div className="flex justify-center items-center mb-6">
            <div className="relative">
              <BookOpen className="h-16 w-16 text-indigo-400" />
              <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              PrepBuddy
            </span>
            <span className="block text-2xl md:text-3xl font-semibold text-indigo-300 mt-2">
              by Mani
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="max-w-4xl mx-auto text-xl md:text-2xl text-white/90 mb-8 leading-relaxed"
          >
            Your ultimate AI-powered companion for placement preparation. 
            <span className="text-indigo-300 font-semibold"> Track progress, maintain consistency, and achieve your career goals</span> with personalized guidance.
          </motion.p>

          {/* Enhanced CTA Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
          >
            <a
              href="/auth?mode=signup"
              className="group inline-flex items-center px-8 py-4 text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-2xl hover:shadow-indigo-500/25 transform hover:scale-105"
            >
              <Rocket className="mr-3 h-6 w-6 group-hover:animate-bounce" />
              Start Your Journey
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/auth?mode=signin"
              className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-xl border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:border-white/50"
            >
              <Coffee className="mr-3 h-6 w-6" />
              Welcome Back
            </a>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="flex justify-center"
          >
            <div className="animate-bounce">
              <ChevronDown className="h-8 w-8 text-white/70" />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Animated Stats Section */}
      <div id="stats-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isStatsVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <div className="flex justify-center mb-3 text-indigo-300">
                {stat.icon}
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={isStatsVisible ? { scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                className="text-3xl md:text-4xl font-bold text-white mb-2"
              >
                {stat.number}
              </motion.div>
              <p className="text-white/80 text-sm md:text-base">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Enhanced Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Everything you need to <span className="text-indigo-400">crack placements</span>
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Comprehensive tools and AI-powered features designed to accelerate your placement preparation
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
              <div className="relative p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 h-full">
                <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-indigo-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-white/80 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Learning Roadmap Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Your <span className="text-green-400">100-Day Journey</span>
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            A structured roadmap designed to take you from beginner to placement-ready
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {roadmapSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white mr-4">
                    {step.icon}
                  </div>
                  <span className="text-indigo-300 font-semibold">{step.week}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-white/80">{step.description}</p>
              </div>
              {index < roadmapSteps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-400"></div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Enhanced Coding Profiles */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Practice <span className="text-purple-400">Platforms</span>
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Connect with top coding platforms to enhance your problem-solving skills
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {codingProfiles.map((profile, index) => (
            <motion.a
              key={index}
              href={profile.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className={`relative flex flex-col items-center justify-center p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 ${profile.color}`}>
                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {profile.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{profile.name}</h3>
                <p className="text-white/70 text-center mb-4">{profile.description}</p>
                <ExternalLink className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-3xl p-12 border border-white/20"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Ready to <span className="text-indigo-400">Transform</span> Your Career?
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
            Join thousands of successful students who've achieved their dream placements with PrepBuddy's AI-powered preparation platform.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <a
              href="/auth?mode=signup"
              className="group inline-flex items-center px-8 py-4 text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-2xl hover:shadow-indigo-500/25 transform hover:scale-105"
            >
              <Zap className="mr-3 h-6 w-6 group-hover:animate-pulse" />
              Start Free Today
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/auth?mode=signin"
              className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-xl border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:border-white/50"
            >
              <Heart className="mr-3 h-6 w-6" />
              Continue Journey
            </a>
          </div>

          <div className="flex justify-center items-center space-x-8 text-white/60">
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              <span>100% Secure</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              <span>Proven Results</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-black/50 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <BookOpen className="h-8 w-8 text-indigo-400 mr-3" />
                <div>
                  <h3 className="text-2xl font-bold text-white">PrepBuddy</h3>
                  <p className="text-indigo-300">by Mani</p>
                </div>
              </div>
              <p className="text-white/70 mb-6 max-w-md">
                Empowering students to achieve their dream placements through AI-powered preparation and personalized guidance.
              </p>
              <div className="flex space-x-4">
                <a href="mailto:addekarimanikanta@gmail.com" className="text-white/60 hover:text-indigo-400 transition-colors">
                  <Mail className="h-6 w-6" />
                </a>
                <a href="https://github.com/mraddekarimani" target="_blank" className="text-white/60 hover:text-indigo-400 transition-colors">
                  <Github className="h-6 w-6" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/auth?mode=signup" className="text-white/70 hover:text-indigo-400 transition-colors">Get Started</a></li>
                <li><a href="/auth?mode=signin" className="text-white/70 hover:text-indigo-400 transition-colors">Sign In</a></li>
                <li><a href="#features" className="text-white/70 hover:text-indigo-400 transition-colors">Features</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="https://www.geeksforgeeks.org/user/addekarimcov2/" target="_blank" className="text-white/70 hover:text-indigo-400 transition-colors">GeeksforGeeks</a></li>
                <li><a href="https://leetcode.com/u/Manikanta11/" target="_blank" className="text-white/70 hover:text-indigo-400 transition-colors">LeetCode</a></li>
                <li><a href="https://www.codechef.com/users/addekarimani" target="_blank" className="text-white/70 hover:text-indigo-400 transition-colors">CodeChef</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-12 pt-8 text-center">
            <p className="text-white/60">
              Made with <Heart className="inline w-4 h-4 mx-1 text-red-400" fill="currentColor" /> by <span className="font-semibold text-indigo-400">Manikanta</span> for all placement aspirants © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
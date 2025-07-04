# PrepBuddy by Mani- AI-Powered Placement Preparation Platform

PrepBuddy is a comprehensive AI-powered platform designed to help students excel in their placement preparation journey. Built with modern web technologies and featuring real-time AI assistance, interactive quizzes, and mock interviews.

## 🚀 Live Demo

Visit the live application: [https://sweet-croissant-ce409e.netlify.app](https://prepbuddybymaniyourplacemetcompanion.netlify.app/)

## ✨ Features

### 🎯 Core Features

- **100-Day Challenge**: Structured preparation plan with daily task tracking
- **Progress Analytics**: Visual insights into your preparation journey with streaks and completion rates
- **Category Management**: Organize tasks by DSA, Aptitude, CS Fundamentals, Resume, Projects, and Mock Interviews
- **Dark/Light Mode**: Seamless theme switching for comfortable studying

### 🤖 AI-Powered Tools

- **Real-time AI Assistant**: 24/7 PrepBuddy AI mentor for doubt resolution and guidance
- **Mock Interview System**: AI-powered interview simulations with multiple categories and difficulty levels
- **Interactive Quiz Arena**: Gamified learning with category-wise quizzes and performance tracking
- **Intelligent Analysis**: AI-driven feedback and suggestions for improvement

### 📊 Advanced Analytics

- **Progress Calendar**: Visual representation of daily task completion
- **Performance Metrics**: Detailed statistics and improvement tracking
- **Streak System**: Motivation through daily completion streaks
- **Achievement Badges**: Unlock achievements based on your progress

### 🔐 User Management

- **Secure Authentication**: Email/password authentication with Supabase
- **User Profiles**: Customizable profiles with bio and display name
- **Notification Settings**: Configurable email notifications and daily reminders
- **Data Privacy**: All user data is encrypted and secure

## 🛠️ Tech Stack

### Frontend

- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful icon library
- **Vite** - Fast build tool and development server

### Backend & Database

- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Row Level Security (RLS)** - Secure data access policies
- **Real-time subscriptions** - Live data updates
- **Edge Functions** - Serverless functions for AI integration

### AI & External Services

- **OpenAI GPT-3.5** - Primary AI model for chat and analysis
- **Groq API** - Fallback AI service for reliability
- **EmailJS** - Email notifications and contact forms
- **Resend** - Transactional email service

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── CategoryList.tsx
│   ├── DayNavigation.tsx
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── Layout.tsx
│   ├── MockInterview.tsx
│   ├── NotificationSettings.tsx
│   ├── ProfileModal.tsx
│   ├── ProgressCalendar.tsx
│   ├── ProgressStats.tsx
│   ├── QuizGame.tsx
│   ├── RealTimeChatBot.tsx
│   ├── TaskForm.tsx
│   └── TaskItem.tsx
├── context/             # React Context providers
│   ├── AuthContext.tsx
│   ├── ProfileContext.tsx
│   ├── TaskContext.tsx
│   └── ThemeContext.tsx
├── lib/                 # Utility libraries
│   ├── aiInterview.ts
│   ├── notifications.ts
│   └── supabase.ts
├── pages/               # Main application pages
│   ├── Auth.tsx
│   ├── Dashboard.tsx
│   └── Landing.tsx
├── types.ts             # TypeScript type definitions
└── main.tsx            # Application entry point

supabase/
├── functions/           # Edge functions
│   ├── ai-assistant/
│   ├── ai-interview/
│   └── notifications/
└── migrations/          # Database migrations
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key (optional, for enhanced AI features)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/prepbuddy.git
   cd prepbuddy
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase**

   - Create a new Supabase project
   - Run the migrations in the `supabase/migrations` folder
   - Configure authentication settings
   - Deploy edge functions (optional)

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:

- **users** - User authentication and basic info
- **categories** - Task categories (DSA, Aptitude, etc.)
- **tasks** - Daily tasks and assignments
- **progress** - User progress tracking (day, streak)
- **user_settings** - Notification preferences
- **user_profiles** - Extended user information
- **interview_sessions** - Mock interview data
- **quiz_results** - Quiz performance tracking
- **chat_history** - AI assistant conversations

## 🔧 Configuration

### Supabase Setup

1. Create tables using provided migrations
2. Enable Row Level Security (RLS)
3. Configure authentication providers
4. Set up edge functions for AI features

### AI Integration

- Configure OpenAI API key for enhanced AI features
- Set up Groq API as fallback service
- Customize AI prompts and responses

### Email Notifications

- Configure Resend for transactional emails
- Set up EmailJS for contact forms
- Customize email templates

## 🚀 Deployment

### Netlify (Recommended)

1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy automatically on push to main branch

### Manual Deployment

```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Maintain component modularity
- Write meaningful commit messages
- Test your changes thoroughly

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Manikanta Addekari**

- GitHub: [@mraddekarimani](https://github.com/mraddekarimani)
- LinkedIn: [addekarimanikanta](https://www.linkedin.com/in/addekarimanikanta/)
- Email: addekarimanikanta@gmail.com

### Coding Profiles

- [GeeksforGeeks](https://www.geeksforgeeks.org/user/addekarimcov2/)
- [LeetCode](https://leetcode.com/u/Manikanta11/)
- [CodeChef](https://www.codechef.com/users/addekarimani)
- [HackerRank](https://www.hackerrank.com/profile/addekarimanikan1)

## 🙏 Acknowledgments

- **Supabase** for providing an excellent backend platform
- **OpenAI** for powerful AI capabilities
- **Tailwind CSS** for beautiful, responsive design
- **React Community** for amazing tools and libraries
- **All placement aspirants** who inspired this project

## 📞 Support

If you have any questions or need help:

1. Check the [Issues](https://github.com/yourusername/prepbuddy/issues) page
2. Create a new issue with detailed information
3. Contact the author directly via email
4. Join our community discussions

## 🔮 Roadmap

- [ ] Mobile app development (React Native)
- [ ] Advanced AI tutoring features
- [ ] Company-specific preparation modules
- [ ] Peer-to-peer study groups
- [ ] Integration with more coding platforms
- [ ] Advanced analytics and insights
- [ ] Offline mode support
- [ ] Multi-language support

---

**Made with ❤️ by Manikanta for all placement aspirants**

_PrepBuddy - Your AI-powered companion for placement success!_

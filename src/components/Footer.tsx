import React, { useState } from 'react';
import { Heart, Github, Code2, Award, Send, Linkedin, Mail, Twitter } from 'lucide-react';
import emailjs from '@emailjs/browser';

const Footer: React.FC = () => {
  const [showContactForm, setShowContactForm] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const templateParams = {
      user_email: email,
      message: message,
    };

    try {
      await emailjs.send(
        'service_qq5856n',
        'template_o4hr0je',
        templateParams,
        'br8aw5D2pd659degT' // Replace with your actual EmailJS public key
      );
      setSuccessMessage('✅ Message sent successfully!');
      setEmail('');
      setMessage('');
      setTimeout(() => {
        setSuccessMessage('');
        setShowContactForm(false);
      }, 3000);
    } catch (error) {
      alert('❌ Failed to send message. Please try again.');
      console.error('EmailJS Error:', error);
    }
  };

  return (
    <footer className="bg-white dark:bg-gray-900 shadow-inner py-10 px-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* About Section */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">About Me</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
            Passionate developer helping students crack placements through projects, platforms, and prep content.
          </p>
        </div>

        {/* Coding Profiles */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Coding Profiles</h3>
          <ul className="space-y-2">
            <li>
              <a
                href="https://www.geeksforgeeks.org/user/addekarimcov2/"
                target="_blank"
                className="flex items-center gap-2 text-green-600 hover:underline dark:text-green-400"
              >
                <Code2 className="h-5 w-5" />
                GeeksforGeeks
              </a>
            </li>
            <li>
              <a
                href="https://leetcode.com/u/Manikanta11/"
                target="_blank"
                className="flex items-center gap-2 text-yellow-600 hover:underline dark:text-yellow-400"
              >
                <Github className="h-5 w-5" />
                LeetCode
              </a>
            </li>
            <li>
              <a
                href="https://www.codechef.com/users/addekarimani"
                target="_blank"
                className="flex items-center gap-2 text-purple-600 hover:underline dark:text-purple-400"
              >
                <Code2 className="h-5 w-5" />
                CodeChef
              </a>
            </li>
            <li>
              <a
                href="https://www.hackerrank.com/profile/addekarimanikan1"
                target="_blank"
                className="flex items-center gap-2 text-emerald-600 hover:underline dark:text-emerald-400"
              >
                <Award className="h-5 w-5" />
                HackerRank
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Me Section */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Contact Me</h3>

          {showContactForm ? (
            <form onSubmit={handleSubmit} className="space-y-4 animate-fadeIn">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                required
                className="w-full p-2 rounded-md border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your message"
                rows={3}
                required
                className="w-full p-2 rounded-md border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              {successMessage && (
                <p className="text-green-600 dark:text-green-400">{successMessage}</p>
              )}
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition"
                >
                  <Send className="inline h-4 w-4 mr-1" /> Send
                </button>
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-md hover:opacity-90"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowContactForm(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              <Send className="h-5 w-5 mr-2" />
              Contact Me
            </button>
          )}

          {/* Social Icons */}
          <div className="mt-5 flex gap-4 text-gray-600 dark:text-gray-400">
            <a href="mailto:addekarimanikanta@gmail.com" className="hover:text-indigo-500">
              <Mail />
            </a>
            <a href="https://github.com/mraddekarimani" target="_blank" className="hover:text-black">
              <Github />
            </a>
            <a
              href="https://www.linkedin.com/in/addekarimanikanta/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
        Made with <Heart className="inline w-4 h-4 mx-1 text-red-500" fill="currentColor" /> by <b>Manikanta</b> for all placement aspirants © {new Date().getFullYear()}
      </div>
    </footer>
  );
};

export default Footer;
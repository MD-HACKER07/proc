import React from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Github, 
  Linkedin, 
  Calendar, 
  Globe, 
  ArrowLeft, 
  Code, 
  Shield, 
  Languages, 
  Award,
  Briefcase,
  GraduationCap,
  Heart
} from 'lucide-react';

interface ContactProps {
  onBack: () => void;
}

const Contact: React.FC<ContactProps> = ({ onBack }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-100 dark:border-gray-700"
    >
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">MD ABU SHALEM ALAM</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Cybersecurity Specialist & Software Developer
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-4 text-green-600 dark:text-green-400 flex items-center">
            <Phone className="h-5 w-5 mr-2" />
            Contact Information
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
              <span className="text-gray-700 dark:text-gray-300">mdabushalem615@gmail.com</span>
            </div>
            
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
              <span className="text-gray-700 dark:text-gray-300">+91 7903435363</span>
            </div>
            
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
              <span className="text-gray-700 dark:text-gray-300">Kopargaon, India</span>
            </div>
            
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
              <span className="text-gray-700 dark:text-gray-300">September 27, 2005</span>
            </div>
            
            <div className="flex items-center">
              <Linkedin className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
              <a 
                href="https://linkedin.com/in/mdabushalem" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
              >
                LinkedIn Profile
              </a>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-4 text-green-600 dark:text-green-400 flex items-center">
            <Code className="h-5 w-5 mr-2" />
            Technical Skills
          </h3>
          
          <div className="grid grid-cols-2 gap-y-2">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-gray-700 dark:text-gray-300">Penetration Testing</span>
            </div>
            
            <div className="flex items-center">
              <Code className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-gray-700 dark:text-gray-300">Java, Python, C++</span>
            </div>
            
            <div className="flex items-center">
              <Code className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-gray-700 dark:text-gray-300">Front-End Dev</span>
            </div>
            
            <div className="flex items-center">
              <Code className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-gray-700 dark:text-gray-300">Full Stack Dev</span>
            </div>
            
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-gray-700 dark:text-gray-300">Debugging</span>
            </div>
            
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-gray-700 dark:text-gray-300">Testing and QA</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 mb-6">
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-4 text-green-600 dark:text-green-400 flex items-center">
            <Languages className="h-5 w-5 mr-2" />
            Languages
          </h3>
          
          <div className="flex space-x-4">
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">English</span>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">Hindi</span>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">Marathi</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 mb-6">
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-4 text-green-600 dark:text-green-400 flex items-center">
            <Briefcase className="h-5 w-5 mr-2" />
            Work Experience
          </h3>
          
          <div className="mb-4 border-l-2 border-green-500 pl-4 ml-2">
            <div className="flex items-start justify-between mb-1">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">CO-LEADER</h4>
              <span className="text-sm text-gray-600 dark:text-gray-400">2023 - 2024</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">EncryptedSec</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Appointed as Red Team Co-Leader, performing hacking activities and security awareness.
              Expertise in phishing attacks, call spoofing, brute force, CraxRat, camera hacking, 
              OS hacking, and social media hacking. Conducted seminars and workshops at schools and 
              colleges to increase cyber security awareness.
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 mb-6">
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-4 text-green-600 dark:text-green-400 flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Major Projects
          </h3>
          
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
            <li><span className="font-medium">aidoctor.cloud</span> - An online healthcare platform</li>
            <li><span className="font-medium">smartpandit.org</span> - A digital Pandit booking service</li>
            <li><span className="font-medium">traderai.cloud</span> - An intelligent market analysis tool</li>
            <li><span className="font-medium">suyogenterprises.in</span> - A home painting service website</li>
          </ul>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 mb-6">
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-4 text-green-600 dark:text-green-400 flex items-center">
            <GraduationCap className="h-5 w-5 mr-2" />
            Education
          </h3>
          
          <div className="mb-4 border-l-2 border-green-500 pl-4 ml-2">
            <div className="flex items-start justify-between mb-1">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">B.Tech in Cybersecurity</h4>
              <span className="text-sm text-gray-600 dark:text-gray-400">Current</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Sanjivani University</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Currently in second year (fourth semester) with 8.68 SGPA in previous semester.
            </p>
          </div>
          
          <div className="border-l-2 border-green-500 pl-4 ml-2">
            <div className="flex items-start justify-between mb-1">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">Diploma in Computer Technology</h4>
              <span className="text-sm text-gray-600 dark:text-gray-400">2021 - 2024</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Sanjivani K.B.P Polytechnic, Kopargaon</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Completed with 83% percentage.
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-4 text-green-600 dark:text-green-400 flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Soft Skills
          </h3>
          
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">Leading Team</span>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">Communication</span>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">Event Management</span>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">Problem-Solving</span>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-4 text-green-600 dark:text-green-400 flex items-center">
            <Heart className="h-5 w-5 mr-2" />
            Interests
          </h3>
          
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">Learning New Things</span>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">Software Development</span>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">Bug Hunting</span>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">Threat Detection</span>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-medium rounded-lg transition-colors duration-200 flex items-center mx-auto"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Quiz
        </button>
      </div>
      
      <div className="mt-6 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} Quiz By MD. All rights reserved.</p>
        <p className="mt-1">Built with React, TypeScript, and TailwindCSS</p>
      </div>
    </motion.div>
  );
};

export default Contact; 
import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, FileText, Globe, Award, Briefcase, Calendar, Code, GraduationCap, MapPin, Heart } from 'lucide-react';
import developerImage from '../assets/images/MD ABU SHALEM ALAM.jpg';

const AboutDeveloper: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
    >
      <div className="flex flex-col md:flex-row">
        {/* Profile Section */}
        <div className="md:w-1/3 flex flex-col items-center p-6">
          <div className="w-40 h-40 rounded-full border-4 border-indigo-500 overflow-hidden mb-4">
            <img 
              src={developerImage} 
              alt="MD Abu Shalem Alam" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">MD ABU SHALEM ALAM</h1>
          <p className="text-lg text-indigo-600 dark:text-indigo-400 mb-4">Cybersecurity Administrator</p>
          
          <div className="flex space-x-3 mb-6">
            <a href="https://github.com/abushalem-dev" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <Github className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </a>
            <a href="https://www.linkedin.com/in/abushalem-dev/" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <Linkedin className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </a>
            <a href="#" className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <FileText className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </a>
            <a href="#" className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <Globe className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </a>
          </div>
          
          <div className="w-full space-y-3">
            <div className="flex items-center">
              <Briefcase className="h-5 w-5 text-indigo-500 mr-3" />
              <span className="text-gray-700 dark:text-gray-300">Cybersecurity Specialist</span>
            </div>
            <div className="flex items-center">
              <GraduationCap className="h-5 w-5 text-indigo-500 mr-3" />
              <span className="text-gray-700 dark:text-gray-300">B-Tech in Cyber Security</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-indigo-500 mr-3" />
              <span className="text-gray-700 dark:text-gray-300">India</span>
            </div>
          </div>
        </div>
        
        {/* Bio Section */}
        <div className="md:w-2/3 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Code className="h-5 w-5 text-indigo-500 mr-2" />
            About Me
          </h2>
          
          <div className="text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              Hi, I'm Md Abu Shalem Alam, a passionate tech enthusiast with a background in cybersecurity and AI development. With hands-on experience in software testing, threat detection, and data analysis, I love solving complex problems and building innovative solutions.
            </p>
            
            <p>
              My portfolio showcases projects that blend technology with creativity, from AI-driven applications to cybersecurity solutions that prioritize safety.
            </p>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4 flex items-center">
            <Award className="h-5 w-5 text-indigo-500 mr-2" />
            Skills
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium text-indigo-600 dark:text-indigo-400 mb-2">Technical Skills</h3>
              <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Threat Detection & Prevention</li>
                <li>• AI & Machine Learning</li>
                <li>• Network Security</li>
                <li>• Penetration Testing</li>
                <li>• Vulnerability Assessment</li>
                <li>• Data Encryption & Cryptography</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-indigo-600 dark:text-indigo-400 mb-2">Soft Skills</h3>
              <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Observational Skills</li>
                <li>• Creativity</li>
                <li>• Risk Assessment & Management</li>
                <li>• Communication Skills</li>
                <li>• Time Management</li>
                <li>• Adaptability & Attention to Detail</li>
              </ul>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4 flex items-center">
            <Calendar className="h-5 w-5 text-indigo-500 mr-2" />
            Featured Projects
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-medium text-indigo-600 dark:text-indigo-400">AI Doctor</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Developed an online healthcare platform (aidoctor.cloud) that connects patients with healthcare professionals, provides AI-driven preliminary diagnoses, and helps schedule appointments.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded">React.js</span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded">AI Integration</span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded">Healthcare</span>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-medium text-indigo-600 dark:text-indigo-400">Trader AI</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Created an intelligent market analysis tool (traderai.cloud) that leverages AI to analyze market trends, provide trading insights, and help investors make informed decisions.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded">Machine Learning</span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded">Data Analysis</span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded">Financial Tech</span>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-medium text-indigo-600 dark:text-indigo-400">Smart Pandit</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Developed a digital Pandit booking service (smartpandit.org) that enables users to book religious ceremonies, consult with pandits online, and schedule pujas.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded">Web Development</span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded">Booking System</span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded">Cultural Service</span>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-medium text-indigo-600 dark:text-indigo-400">Suyog Enterprises</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Created a comprehensive website for a home painting service (suyogenterprises.in) that allows customers to browse painting options, request quotes, and schedule services.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded">Web Design</span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded">E-commerce</span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded">Service Business</span>
              </div>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4 flex items-center">
            <Briefcase className="h-5 w-5 text-indigo-500 mr-2" />
            Experience
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-medium text-indigo-600 dark:text-indigo-400">Cybersecurity Specialist</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Arosys Technologies | 2024 - Present</p>
              <ul className="mt-2 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Developed and implemented strategies to identify and mitigate security threats</li>
                <li>• Conducted vulnerability assessments and penetration testing to enhance system security</li>
                <li>• Ensured compliance with security standards and managed incident response efforts</li>
              </ul>
            </div>
            
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-medium text-indigo-600 dark:text-indigo-400">Co-leader of Red Team</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Cybersecurity Specialist and Awareness Advocate | 2022 - Present</p>
              <ul className="mt-2 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Gained hands-on experience in executing various cybersecurity attacks for educational purposes</li>
                <li>• Explored system vulnerabilities and understood the mechanics behind different types of cyber threats</li>
                <li>• Delivered seminars and workshops at multiple schools to raise awareness about cybersecurity</li>
              </ul>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4 flex items-center">
            <GraduationCap className="h-5 w-5 text-indigo-500 mr-2" />
            Education
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-medium text-indigo-600 dark:text-indigo-400">B-Tech in Cyber Security</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">Sanjivani University | 2024 - 2027</p>
            </div>
            
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-medium text-indigo-600 dark:text-indigo-400">Diploma in Computer Technology</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">Sanjivani K.B.P Polytechnic | 2021 - 2024</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">Grade: First Class Distinction</p>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4 flex items-center">
            <Heart className="h-5 w-5 text-indigo-500 mr-2" />
            Interests
          </h2>
          
          <div className="flex flex-wrap gap-2">
            {['Traveling', 'Travel Photography', 'Hacking', 'Editing'].map((interest, index) => (
              <span 
                key={index} 
                className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} MD Abu Shalem Alam. All rights reserved.
        </p>
      </div>
    </motion.div>
  );
};

export default AboutDeveloper; 
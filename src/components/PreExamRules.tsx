import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Lock, AlertTriangle, CheckCircle, Play } from 'lucide-react';

interface PreExamRulesProps {
  onAccept: () => void;
  examName?: string;
  duration?: number;
  totalQuestions?: number;
}

const PreExamRules: React.FC<PreExamRulesProps> = ({ onAccept, examName, duration, totalQuestions }) => {
  const [acknowledgedRules, setAcknowledgedRules] = useState<number[]>([]);
  const [finalAgreement, setFinalAgreement] = useState(false);

  const rules = [
    {
      icon: <Shield className="w-6 h-6 text-blue-500" />,
      title: 'Secure Environment',
      details: [
        'Your screen activity will be monitored throughout the exam',
        'Exiting fullscreen mode will result in exam termination',
        'Copy-paste functionality has been disabled for security',
      ],
    },
    {
      icon: <Eye className="w-6 h-6 text-purple-500" />,
      title: 'Focus Requirements',
      details: [
        'Switching to other tabs or applications is not permitted',
        'Keyboard shortcuts like Alt+Tab are monitored',
        'Maintain focus on the exam window at all times',
      ],
    },
    {
      icon: <Lock className="w-6 h-6 text-red-500" />,
      title: 'Security Protocols',
      details: [
        'Browser developer tools are disabled',
        'Right-click context menu is restricted',
        'Any suspicious activity will be flagged and reported',
      ],
    },
  ];

  const toggleRule = (index: number) => {
    setAcknowledgedRules((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  };

  const allRulesAcknowledged = acknowledgedRules.length === rules.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Exam Instructions</h1>
          {examName && <p className="text-blue-100 mt-1">{examName}</p>}
        </div>

        {/* Exam Info */}
        {(duration || totalQuestions) && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 border-b border-blue-200 dark:border-blue-800">
            <div className="flex justify-center gap-8">
              {totalQuestions && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalQuestions}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Questions</p>
                </div>
              )}
              {duration && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{duration}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Minutes</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Introduction */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <p className="text-gray-700 dark:text-gray-300">
            Please carefully read and acknowledge all examination rules before proceeding. These guidelines ensure a fair, 
            secure, and standardized testing environment for all participants. Your compliance is mandatory.
          </p>
        </div>

        {/* Rules */}
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Exam Rules
          </h2>

          <div className="space-y-4">
            {rules.map((rule, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-xl p-4 border-2 transition-all cursor-pointer ${
                  acknowledgedRules.includes(index)
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                    : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:border-blue-300'
                }`}
                onClick={() => toggleRule(index)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">{rule.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-800 dark:text-white">{rule.title}</h3>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          acknowledgedRules.includes(index)
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 dark:border-gray-500'
                        }`}
                      >
                        {acknowledgedRules.includes(index) && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {rule.details.map((detail, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Final Agreement */}
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">Declaration</h3>
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={finalAgreement}
                onChange={(e) => setFinalAgreement(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                <strong>
                  I have read and understood all the examination rules. I agree to comply with these guidelines and acknowledge 
                  that any violation may result in immediate exam termination and disqualification.
                </strong>
              </span>
            </label>
          </div>

          {/* Start Button */}
          <div className="mt-6 text-center">
            {!allRulesAcknowledged && (
              <p className="text-sm text-amber-600 mb-2">Please acknowledge all rules by clicking on them.</p>
            )}
            {allRulesAcknowledged && !finalAgreement && (
              <p className="text-sm text-amber-600 mb-2">Please accept the final agreement to continue.</p>
            )}
            <motion.button
              whileHover={allRulesAcknowledged && finalAgreement ? { scale: 1.05 } : {}}
              whileTap={allRulesAcknowledged && finalAgreement ? { scale: 0.95 } : {}}
              onClick={onAccept}
              disabled={!allRulesAcknowledged || !finalAgreement}
              className={`px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 mx-auto transition-all ${
                allRulesAcknowledged && finalAgreement
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-xl cursor-pointer'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              <Play className="w-5 h-5" />
              Start Exam
            </motion.button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 text-center border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Best of luck! Stay focused and give your best.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default PreExamRules;

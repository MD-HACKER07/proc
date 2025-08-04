import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Settings, Users, Clock, Target, AlertCircle, Check, X } from 'lucide-react';
import {
  ExamConfiguration,
  ExamSection,
  createExamConfiguration,
  getExamConfigurations,
  updateExamConfiguration,
  deleteExamConfiguration,
  generateDefaultExamConfig
} from '../../services/examService';
import { Subject, getSubjects } from '../../services/quizService';

interface ExamConfigFormData {
  id?: string;
  name: string;
  subjectId: string;
  totalSections: number;
  questionsPerSection: number;
  adaptiveMode: boolean;
  sections: ExamSection[];
  performanceThresholds: {
    topper: number;
    average: number;
  };
}

const ExamConfigManager: React.FC = () => {
  const [examConfigs, setExamConfigs] = useState<ExamConfiguration[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ExamConfigFormData>({
    name: '',
    subjectId: '',
    totalSections: 4,
    questionsPerSection: 5,
    adaptiveMode: true,
    sections: [],
    performanceThresholds: {
      topper: 80,
      average: 50
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [configsData, subjectsData] = await Promise.all([
        getExamConfigurations(),
        getSubjects()
      ]);
      setExamConfigs(configsData);
      setSubjects(subjectsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load exam configurations or subjects');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subjectId: subjects[0]?.id || '',
      totalSections: 4,
      questionsPerSection: 5,
      adaptiveMode: true,
      sections: [],
      performanceThresholds: {
        topper: 80,
        average: 50
      }
    });
    setIsEditing(false);
  };

  const generateSections = (totalSections: number, questionsPerSection: number): ExamSection[] => {
    const sections: ExamSection[] = [];
    for (let i = 1; i <= totalSections; i++) {
      sections.push({
        sectionNumber: i,
        questionsPerSection,
        difficultyLevel: 'medium',
        timeLimit: questionsPerSection * 2 // 2 minutes per question
      });
    }
    return sections;
  };

  const openAddModal = () => {
    resetForm();
    const sections = generateSections(formData.totalSections, formData.questionsPerSection);
    setFormData(prev => ({ ...prev, sections }));
    setIsModalOpen(true);
  };

  const openEditModal = (config: ExamConfiguration) => {
    setFormData({
      id: config.id,
      name: config.name,
      subjectId: config.subjectId,
      totalSections: config.totalSections,
      questionsPerSection: config.questionsPerSection,
      adaptiveMode: config.adaptiveMode,
      sections: config.sections,
      performanceThresholds: config.performanceThresholds
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSectionChange = (index: number, field: keyof ExamSection, value: any) => {
    const updatedSections = [...formData.sections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setFormData({ ...formData, sections: updatedSections });
  };

  const handleTotalSectionsChange = (totalSections: number) => {
    const sections = generateSections(totalSections, formData.questionsPerSection);
    setFormData({ ...formData, totalSections, sections });
  };

  const handleQuestionsPerSectionChange = (questionsPerSection: number) => {
    const sections = generateSections(formData.totalSections, questionsPerSection);
    setFormData({ ...formData, questionsPerSection, sections });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.subjectId) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const configData = {
        name: formData.name,
        subjectId: formData.subjectId,
        totalSections: formData.totalSections,
        questionsPerSection: formData.questionsPerSection,
        totalQuestions: formData.totalSections * formData.questionsPerSection,
        adaptiveMode: formData.adaptiveMode,
        sections: formData.sections,
        performanceThresholds: formData.performanceThresholds
      };

      if (isEditing && formData.id) {
        await updateExamConfiguration(formData.id, configData);
        setSuccessMessage('Exam configuration updated successfully!');
      } else {
        await createExamConfiguration(configData);
        setSuccessMessage('Exam configuration created successfully!');
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error('Error saving exam configuration:', err);
      setError(err.message || 'Failed to save exam configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this exam configuration?')) {
      return;
    }

    setLoading(true);
    try {
      await deleteExamConfiguration(id);
      setSuccessMessage('Exam configuration deleted successfully!');
      await loadData();
    } catch (err: any) {
      console.error('Error deleting exam configuration:', err);
      setError(err.message || 'Failed to delete exam configuration');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyIcon = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
          <button 
            onClick={() => setError('')} 
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-md flex items-center">
          <Check className="h-5 w-5 mr-2" />
          {successMessage}
          <button 
            onClick={() => setSuccessMessage('')} 
            className="ml-auto text-green-500 hover:text-green-700"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold">Multi-Section Adaptive Exams</h2>
          <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm px-2 py-0.5 rounded">
            {examConfigs.length} configurations
          </span>
        </div>
        
        <button
          onClick={openAddModal}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Exam Configuration
        </button>
      </div>

      {/* Exam Configurations List */}
      {loading && <p className="text-gray-600 dark:text-gray-400">Loading...</p>}
      
      {!loading && examConfigs.length === 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">No exam configurations found.</p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Your First Exam Configuration
          </button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {examConfigs.map((config) => {
          const subject = subjects.find(s => s.id === config.subjectId);
          return (
            <div key={config.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{config.name}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(config)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Edit Configuration"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(config.id!)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Delete Configuration"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Subject: {subject?.name || 'Unknown'}</span>
                </div>
                
                <div className="flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  <span>{config.totalSections} sections × {config.questionsPerSection} questions</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Total: {config.totalQuestions} questions</span>
                </div>

                <div className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  <span className={`px-2 py-1 rounded text-xs ${config.adaptiveMode ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {config.adaptiveMode ? 'Adaptive' : 'Fixed Difficulty'}
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">Performance Thresholds:</p>
                  <div className="flex space-x-2 text-xs">
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
                      Topper: {config.performanceThresholds.topper}%+
                    </span>
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                      Average: {config.performanceThresholds.average}%+
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Add/Edit Exam Configuration */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? 'Edit Exam Configuration' : 'Create Exam Configuration'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Exam Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., Final Mathematics Exam"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      value={formData.subjectId}
                      onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Exam Structure */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="totalSections" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Total Sections
                    </label>
                    <input
                      type="number"
                      id="totalSections"
                      min="1"
                      max="10"
                      value={formData.totalSections}
                      onChange={(e) => handleTotalSectionsChange(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="questionsPerSection" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Questions per Section
                    </label>
                    <input
                      type="number"
                      id="questionsPerSection"
                      min="1"
                      max="20"
                      value={formData.questionsPerSection}
                      onChange={(e) => handleQuestionsPerSectionChange(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Total Questions
                    </label>
                    <div className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300">
                      {formData.totalSections * formData.questionsPerSection}
                    </div>
                  </div>
                </div>

                {/* Adaptive Mode */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="adaptiveMode"
                    checked={formData.adaptiveMode}
                    onChange={(e) => setFormData({ ...formData, adaptiveMode: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="adaptiveMode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enable Adaptive Mode
                  </label>
                  <span className="text-xs text-gray-500">
                    (Questions difficulty adjusts based on performance)
                  </span>
                </div>

                {/* Performance Thresholds */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="topperThreshold" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Topper Threshold (%)
                    </label>
                    <input
                      type="number"
                      id="topperThreshold"
                      min="0"
                      max="100"
                      value={formData.performanceThresholds.topper}
                      onChange={(e) => setFormData({
                        ...formData,
                        performanceThresholds: {
                          ...formData.performanceThresholds,
                          topper: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="averageThreshold" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Average Threshold (%)
                    </label>
                    <input
                      type="number"
                      id="averageThreshold"
                      min="0"
                      max="100"
                      value={formData.performanceThresholds.average}
                      onChange={(e) => setFormData({
                        ...formData,
                        performanceThresholds: {
                          ...formData.performanceThresholds,
                          average: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Sections Configuration */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Section Configuration</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {formData.sections.map((section, index) => (
                      <div key={section.sectionNumber} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <div className="flex-shrink-0">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Section {section.sectionNumber}
                          </span>
                        </div>
                        
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Questions</label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={section.questionsPerSection}
                            onChange={(e) => handleSectionChange(index, 'questionsPerSection', parseInt(e.target.value) || 1)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                          />
                        </div>

                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Default Difficulty</label>
                          <select
                            value={section.difficultyLevel}
                            onChange={(e) => handleSectionChange(index, 'difficultyLevel', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                            disabled={formData.adaptiveMode}
                          >
                            <option value="easy">🟢 Easy</option>
                            <option value="medium">🟡 Medium</option>
                            <option value="hard">🔴 Hard</option>
                          </select>
                        </div>

                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Time Limit (min)</label>
                          <input
                            type="number"
                            min="1"
                            max="60"
                            value={section.timeLimit}
                            onChange={(e) => handleSectionChange(index, 'timeLimit', parseInt(e.target.value) || 1)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {formData.adaptiveMode && (
                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-md">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>Adaptive Mode:</strong> Section difficulty will be automatically adjusted based on student performance in previous sections. Default difficulty settings above will be used only for the first section.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (isEditing ? 'Update Configuration' : 'Create Configuration')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamConfigManager;

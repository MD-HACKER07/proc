import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Settings, Target, Clock, Users } from 'lucide-react';
import { 
  createAdaptiveQuizConfig, 
  getAdaptiveQuizConfigs, 
  AdaptiveQuizConfig 
} from '../../services/adaptiveQuizService';
import { getSubjects, Subject } from '../../services/quizService';

const AdaptiveQuizManager: React.FC = () => {
  const [configs, setConfigs] = useState<AdaptiveQuizConfig[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AdaptiveQuizConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    subjectId: '',
    totalQuestions: 20,
    adaptiveMode: true,
    performanceThresholds: {
      topper: 80,
      average: 50
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [configsData, subjectsData] = await Promise.all([
        getAdaptiveQuizConfigs(),
        getSubjects()
      ]);
      setConfigs(configsData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subjectId: '',
      totalQuestions: 20,
      adaptiveMode: true,
      performanceThresholds: {
        topper: 80,
        average: 50
      }
    });
    setEditingConfig(null);
    setShowCreateForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.subjectId) return;

    try {
      setSaving(true);
      await createAdaptiveQuizConfig(formData);
      await loadData();
      resetForm();
    } catch (error) {
      console.error('Error saving config:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (config: AdaptiveQuizConfig) => {
    setFormData({
      name: config.name,
      subjectId: config.subjectId,
      totalQuestions: config.totalQuestions,
      adaptiveMode: config.adaptiveMode,
      performanceThresholds: config.performanceThresholds
    });
    setEditingConfig(config);
    setShowCreateForm(true);
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.name || 'Unknown Subject';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Adaptive Quiz Manager</h2>
          <p className="text-gray-600 mt-1">
            Create adaptive quizzes that automatically adjust difficulty based on student performance
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Adaptive Quiz
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingConfig ? 'Edit Adaptive Quiz' : 'Create New Adaptive Quiz'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quiz Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quiz Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Mathematics Final Exam"
                  required
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              {/* Total Questions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Questions *
                </label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={formData.totalQuestions}
                  onChange={(e) => setFormData({ ...formData, totalQuestions: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Questions will be adaptively selected from all difficulty levels
                </p>
              </div>

              {/* Adaptive Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adaptive Mode
                </label>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="adaptiveMode"
                      checked={formData.adaptiveMode}
                      onChange={() => setFormData({ ...formData, adaptiveMode: true })}
                      className="mr-2"
                    />
                    <span className="text-sm">Adaptive (Recommended)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="adaptiveMode"
                      checked={!formData.adaptiveMode}
                      onChange={() => setFormData({ ...formData, adaptiveMode: false })}
                      className="mr-2"
                    />
                    <span className="text-sm">Random</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Adaptive mode adjusts difficulty based on student performance
                </p>
              </div>
            </div>

            {/* Performance Thresholds */}
            {formData.adaptiveMode && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Performance Thresholds</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Topper Threshold (%)
                    </label>
                    <input
                      type="number"
                      min="70"
                      max="100"
                      value={formData.performanceThresholds.topper}
                      onChange={(e) => setFormData({
                        ...formData,
                        performanceThresholds: {
                          ...formData.performanceThresholds,
                          topper: parseInt(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Students above this get harder questions</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Average Threshold (%)
                    </label>
                    <input
                      type="number"
                      min="30"
                      max="80"
                      value={formData.performanceThresholds.average}
                      onChange={(e) => setFormData({
                        ...formData,
                        performanceThresholds: {
                          ...formData.performanceThresholds,
                          average: parseInt(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Students above this get medium questions</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : (editingConfig ? 'Update Quiz' : 'Create Quiz')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Configs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Existing Adaptive Quizzes</h3>
        </div>
        
        {configs.length === 0 ? (
          <div className="p-8 text-center">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Adaptive Quizzes Yet</h3>
            <p className="text-gray-600 mb-4">Create your first adaptive quiz to get started.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Adaptive Quiz
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {configs.map((config) => (
              <div key={config.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{config.name}</h4>
                      {config.adaptiveMode && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          Adaptive
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        <span>{getSubjectName(config.subjectId)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{config.totalQuestions} Questions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Created {config.createdAt?.toLocaleDateString()}</span>
                      </div>
                    </div>

                    {config.adaptiveMode && (
                      <div className="mt-3 text-sm text-gray-600">
                        <span className="font-medium">Thresholds:</span> 
                        <span className="ml-2">Topper: {config.performanceThresholds.topper}%</span>
                        <span className="ml-4">Average: {config.performanceThresholds.average}%</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(config)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Quiz"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Quiz"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdaptiveQuizManager;

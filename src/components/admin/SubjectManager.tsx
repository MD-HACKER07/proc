import { useState, useEffect } from 'react';
import { Subject, getSubjects, addSubject, updateSubject, deleteSubject, deleteQuestionsBySubject } from '../../services/quizService';
import { Book, Code, Cpu, Globe, Edit, Trash2, Plus, PenTool, CheckCircle, ScrollText, FileText, Files, Database, Layers, PlusCircle } from 'lucide-react';

interface SubjectFormData {
  id?: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
}

// Available icons and colors for subjects
const availableIcons = [
  { id: 'book', component: Book, label: 'Book' },
  { id: 'code', component: Code, label: 'Code' },
  { id: 'cpu', component: Cpu, label: 'CPU' },
  { id: 'globe', component: Globe, label: 'Globe' },
  { id: 'pen', component: PenTool, label: 'Pen' },
  { id: 'check', component: CheckCircle, label: 'Check' },
  { id: 'scroll', component: ScrollText, label: 'Scroll' },
  { id: 'file', component: FileText, label: 'File' },
  { id: 'files', component: Files, label: 'Files' },
  { id: 'database', component: Database, label: 'Database' },
  { id: 'layers', component: Layers, label: 'Layers' },
];

const availableColors = [
  { id: 'green', label: 'Green', class: 'bg-green-500' },
  { id: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { id: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
  { id: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { id: 'pink', label: 'Pink', class: 'bg-pink-500' },
  { id: 'red', label: 'Red', class: 'bg-red-500' },
  { id: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { id: 'amber', label: 'Amber', class: 'bg-amber-500' },
  { id: 'teal', label: 'Teal', class: 'bg-teal-500' },
];

const SubjectManager = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<SubjectFormData>({
    name: '',
    description: '',
    icon: 'book',
    color: 'blue'
  });
  const [isEditing, setIsEditing] = useState(false);

  // Load subjects
  useEffect(() => {
    const loadSubjects = async () => {
      setLoading(true);
      try {
        const data = await getSubjects();
        
        // Enhance subjects with default values if needed
        const enhancedSubjects = data.map(subject => ({
          ...subject,
          icon: subject.icon || 'book',
          color: subject.color || 'blue'
        }));
        
        setSubjects(enhancedSubjects);
      } catch (err) {
        console.error('Error loading subjects:', err);
        setError('Failed to load subjects');
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: 'book',
      color: 'blue'
    });
    setIsEditing(false);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (subject: Subject) => {
    setFormData({
      id: subject.id,
      name: subject.name,
      description: subject.description || '',
      icon: subject.icon || 'book',
      color: subject.color || 'blue'
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      setError('Subject name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isEditing && formData.id) {
        await updateSubject(formData.id, {
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
          color: formData.color
        });
      } else {
        await addSubject({
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
          color: formData.color
        });
      }
      
      // Refresh subjects list
      const updatedSubjects = await getSubjects();
      
      // Enhance with default values
      const enhancedSubjects = updatedSubjects.map(subject => ({
        ...subject,
        icon: subject.icon || 'book',
        color: subject.color || 'blue'
      }));
      
      setSubjects(enhancedSubjects);
      
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error('Error saving subject:', err);
      setError('Failed to save the subject');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subject? All associated questions will also be deleted.')) {
      return;
    }

    setLoading(true);
    try {
      // First delete all questions associated with this subject
      await deleteQuestionsBySubject(id);
      // Then delete the subject
      await deleteSubject(id);
      // Update subjects list
      setSubjects(subjects.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error deleting subject:', err);
      setError('Failed to delete the subject or its questions');
    } finally {
      setLoading(false);
    }
  };

  // Get color classes for a subject
  const getColorClasses = (colorName = 'blue') => {
    const colorMap: Record<string, {bg: string, text: string, border: string, hover: string, iconBg: string}> = {
      green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        border: 'border-green-200',
        hover: 'hover:bg-green-100',
        iconBg: 'bg-green-100'
      },
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-200',
        hover: 'hover:bg-blue-100',
        iconBg: 'bg-blue-100'
      },
      indigo: {
        bg: 'bg-indigo-50',
        text: 'text-indigo-600',
        border: 'border-indigo-200',
        hover: 'hover:bg-indigo-100',
        iconBg: 'bg-indigo-100'
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        border: 'border-purple-200',
        hover: 'hover:bg-purple-100',
        iconBg: 'bg-purple-100'
      },
      pink: {
        bg: 'bg-pink-50',
        text: 'text-pink-600',
        border: 'border-pink-200',
        hover: 'hover:bg-pink-100',
        iconBg: 'bg-pink-100'
      },
      red: {
        bg: 'bg-red-50',
        text: 'text-red-600',
        border: 'border-red-200',
        hover: 'hover:bg-red-100',
        iconBg: 'bg-red-100'
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        border: 'border-orange-200',
        hover: 'hover:bg-orange-100',
        iconBg: 'bg-orange-100'
      },
      amber: {
        bg: 'bg-amber-50',
        text: 'text-amber-600',
        border: 'border-amber-200',
        hover: 'hover:bg-amber-100',
        iconBg: 'bg-amber-100'
      },
      teal: {
        bg: 'bg-teal-50',
        text: 'text-teal-600',
        border: 'border-teal-200',
        hover: 'hover:bg-teal-100',
        iconBg: 'bg-teal-100'
      }
    };

    return colorMap[colorName] || colorMap.blue;
  };

  // Get icon component for a subject
  const getIconComponent = (iconName = 'book', className = 'h-6 w-6') => {
    const icon = availableIcons.find(i => i.id === iconName);
    const IconComponent = icon ? icon.component : Book;
    return <IconComponent className={className} />;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Manage Quiz Subjects</h2>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <PlusCircle className="h-5 w-5" />
          Add Subject
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg border-l-4 border-red-500">
          {error}
        </div>
      )}

      {/* Subjects list */}
      {loading && (
        <div className="flex justify-center items-center p-8">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 border-t-blue-500 h-12 w-12 animate-spin"></div>
        </div>
      )}
      
      {!loading && subjects.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-6">No subjects found. Add a new subject to get started.</p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Your First Subject
          </button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => {
          const colorClasses = getColorClasses(subject.color as string);
          
          return (
            <div 
              key={subject.id} 
              className={`${colorClasses.bg} ${colorClasses.border} border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200`}
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className={`${colorClasses.iconBg} rounded-full h-10 w-10 flex items-center justify-center ${colorClasses.text}`}>
                    {getIconComponent(subject.icon as string)}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(subject)}
                      className="p-1.5 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-600 hover:text-blue-600 transition-colors"
                      title="Edit Subject"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => subject.id && handleDelete(subject.id)}
                      className="p-1.5 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-600 hover:text-red-600 transition-colors"
                      title="Delete Subject"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className={`font-semibold text-lg mb-1 ${colorClasses.text}`}>{subject.name}</h3>
                
                {subject.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{subject.description}</p>
                )}
              </div>
              
              <div className="bg-white px-5 py-3 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Quiz Subject</span>
                  <span className={`font-medium ${colorClasses.text}`}>View Questions</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {isEditing ? 'Edit Quiz Subject' : 'Add New Quiz Subject'}
            </h2>
            
            {error && (
              <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg border-l-4 border-red-500">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., JavaScript Basics"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of the quiz subject"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose Subject Icon
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {availableIcons.map(icon => (
                      <button
                        key={icon.id}
                        type="button"
                        className={`flex flex-col items-center justify-center p-2 rounded border ${
                          formData.icon === icon.id 
                          ? 'bg-blue-50 border-blue-500 text-blue-600'
                          : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => setFormData({ ...formData, icon: icon.id })}
                        title={icon.label}
                      >
                        <icon.component className="h-6 w-6" />
                        <span className="text-xs mt-1 hidden">{icon.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose Subject Color
                  </label>
                  <div className="grid grid-cols-9 gap-2">
                    {availableColors.map(color => (
                      <button
                        key={color.id}
                        type="button"
                        className={`h-8 w-8 rounded-full ${color.class} ${
                          formData.color === color.id 
                          ? 'ring-2 ring-offset-2 ring-gray-400'
                          : ''
                        }`}
                        onClick={() => setFormData({ ...formData, color: color.id })}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Save Subject</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectManager; 
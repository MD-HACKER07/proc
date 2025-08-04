import { useState, useRef } from 'react';
import { UploadCloud, AlertCircle, Check, X } from 'lucide-react';
import { importQuestionsFromCsv, importQuestionsFromFile } from '../../services/importService';
import { Subject } from '../../services/quizService';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  selectedSubject: string;
  onImportComplete: () => void;
}

interface ImportStatus {
  isImporting: boolean;
  success: boolean;
  error: string;
  total: number;
  imported: number;
  errors: string[];
}

const CsvImportModal = ({ isOpen, onClose, subjects, selectedSubject, onImportComplete }: CsvImportModalProps) => {
  const [importStatus, setImportStatus] = useState<ImportStatus>({
    isImporting: false,
    success: false,
    error: '',
    total: 0,
    imported: 0,
    errors: []
  });
  const [files, setFiles] = useState<File[]>([]);
  const [useSelectedSubject, setUseSelectedSubject] = useState(true);
  const [customSubjectId, setCustomSubjectId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    
    const selectedFiles = Array.from(fileList);
    
    // Check if all files are CSV or JSON
    const invalidFiles = selectedFiles.filter(file => 
      !file.name.endsWith('.csv') && !file.name.endsWith('.json')
    );
    
    if (invalidFiles.length > 0) {
      setImportStatus({
        isImporting: false,
        success: false,
        error: `Invalid file types: ${invalidFiles.map(f => f.name).join(', ')}. Please select only CSV or JSON files.`,
        total: 0,
        imported: 0,
        errors: []
      });
      return;
    }
    
    setFiles(selectedFiles);
    setImportStatus({
      isImporting: false,
      success: false,
      error: '',
      total: 0,
      imported: 0,
      errors: []
    });
  };

  const handleImport = async () => {
    if (!files || files.length === 0) {
      setImportStatus({
        ...importStatus,
        error: 'Please select CSV or JSON files to import'
      });
      return;
    }

    setImportStatus({
      isImporting: true,
      success: false,
      error: '',
      total: 0,
      imported: 0,
      errors: []
    });

    try {
      // Determine subject ID to use
      let subjectId = '';
      if (useSelectedSubject && selectedSubject) {
        subjectId = selectedSubject;
      } else if (!useSelectedSubject && customSubjectId) {
        subjectId = customSubjectId;
      }

      let totalImported = 0;
      let totalQuestions = 0;
      const allErrors: string[] = [];

      // Process each file sequentially
      for (let i = 0; i < files.length; i++) {
        const currentFile = files[i];
        const isCSV = currentFile.name.endsWith('.csv');
        
        try {
          let result;
          if (isCSV) {
            result = await importQuestionsFromCsv(currentFile, subjectId);
            totalQuestions += result.total;
            totalImported += result.imported;
            if (result.errors.length > 0) {
              allErrors.push(...result.errors.map(err => `${currentFile.name}: ${err}`));
            }
          } else {
            // For JSON import
            const importedCount = await importQuestionsFromFile(currentFile, subjectId);
            totalQuestions += importedCount;
            totalImported += importedCount;
          }
        } catch (fileError: any) {
          allErrors.push(`${currentFile.name}: ${fileError.message || 'Failed to import'}`);
        }
      }
      
      const hasErrors = allErrors.length > 0;
      setImportStatus({
        isImporting: false,
        success: !hasErrors || totalImported > 0,
        error: hasErrors ? `Some files had errors. Check details below.` : '',
        total: totalQuestions,
        imported: totalImported,
        errors: allErrors
      });
      
      if (totalImported > 0) {
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setFiles([]);
        onImportComplete();
      }
    } catch (err: any) {
      console.error('Import error:', err);
      setImportStatus({
        isImporting: false,
        success: false,
        error: err.message || 'Failed to import questions',
        total: 0,
        imported: 0,
        errors: [err.message || 'Failed to import questions']
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const fileList = e.dataTransfer.files;
    if (!fileList || fileList.length === 0) return;
    
    const droppedFiles = Array.from(fileList);
    
    // Check if all files are CSV or JSON
    const invalidFiles = droppedFiles.filter(file => 
      !file.name.endsWith('.csv') && !file.name.endsWith('.json')
    );
    
    if (invalidFiles.length > 0) {
      setImportStatus({
        isImporting: false,
        success: false,
        error: `Invalid file types: ${invalidFiles.map(f => f.name).join(', ')}. Please select only CSV or JSON files.`,
        total: 0,
        imported: 0,
        errors: []
      });
      return;
    }
    
    setFiles(droppedFiles);
    setImportStatus({
      isImporting: false,
      success: false,
      error: '',
      total: 0,
      imported: 0,
      errors: []
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] my-8 flex flex-col">
          <div className="p-6 pb-0 flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Import Questions</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          <div className="p-6 pt-0 flex-1 overflow-y-auto">
            {importStatus.error && (
              <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {importStatus.error}
              </div>
            )}
            
            {importStatus.success && (
              <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-md flex items-center">
                <Check className="h-4 w-4 mr-2" />
                Successfully imported {importStatus.imported} of {importStatus.total} questions
              </div>
            )}
            
            <div className="space-y-4">
              {!importStatus.success && (
                <>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center cursor-pointer hover:bg-gray-50"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                      <UploadCloud className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Drop your CSV or JSON files here</p>
                    <p className="text-sm text-gray-500 mb-4">or click to browse and select multiple files</p>
                    <p className="text-sm text-gray-500 mb-4">Upload CSV or JSON files with your questions and answers</p>
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-gray-600">
                      <p className="font-medium mb-1">Required CSV Format:</p>
                      <p>Columns: subjectId, question, optionA, optionB, optionC, optionD, correctOption, marks (optional)</p>
                      <p className="mt-1">Note: All options (A-D) are required for each question. correctOption must be A, B, C, or D.</p>
                    </div>
                    
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-gray-600">
                      <p className="font-medium mb-1">🎯 Automatic Difficulty Assignment:</p>
                      <p>• <span className="font-medium text-red-600">set1.csv</span> → Hard questions 🔴</p>
                      <p>• <span className="font-medium text-yellow-600">set2.csv</span> → Medium questions 🟡</p>
                      <p>• <span className="font-medium text-green-600">set3.csv</span> → Easy questions 🟢</p>
                      <p className="mt-1 text-gray-500">Other filenames default to Medium difficulty</p>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".csv,.json"
                      multiple
                    />
                  </div>
                  
                  {/* Display selected files */}
                  {files.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Selected Files ({files.length}):
                      </p>
                      <div className="space-y-2">
                        {files.map((file, index) => {
                          const getDifficultyInfo = (filename: string) => {
                            const lower = filename.toLowerCase();
                            if (lower.includes('set1')) return { level: 'Hard', color: 'text-red-600', icon: '🔴' };
                            if (lower.includes('set2')) return { level: 'Medium', color: 'text-yellow-600', icon: '🟡' };
                            if (lower.includes('set3')) return { level: 'Easy', color: 'text-green-600', icon: '🟢' };
                            return { level: 'Medium', color: 'text-gray-600', icon: '⚪' };
                          };
                          
                          const diffInfo = getDifficultyInfo(file.name);
                          
                          return (
                            <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded border">
                              <div className="flex items-center space-x-2">
                                <span className="text-blue-500">📄</span>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{file.name}</span>
                                <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`text-xs font-medium ${diffInfo.color}`}>
                                  {diffInfo.icon} {diffInfo.level}
                                </span>
                                <button
                                  onClick={() => setFiles(files.filter((_, i) => i !== index))}
                                  className="text-red-500 hover:text-red-700 text-sm"
                                  title="Remove file"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                      <input
                        type="radio"
                        id="use-selected"
                        checked={useSelectedSubject}
                        onChange={() => setUseSelectedSubject(true)}
                      />
                      <label htmlFor="use-selected" className="text-sm">
                        Use currently selected subject
                      </label>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-md mb-2">
                        <input
                          type="radio"
                          id="use-custom"
                          checked={!useSelectedSubject}
                          onChange={() => setUseSelectedSubject(false)}
                        />
                        <label htmlFor="use-custom" className="text-sm">
                          Select a different subject
                        </label>
                      </div>
                      
                      {!useSelectedSubject && (
                        <select
                          value={customSubjectId}
                          onChange={(e) => setCustomSubjectId(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          disabled={useSelectedSubject}
                        >
                          <option value="">Select a subject</option>
                          {subjects.map((subject) => (
                            <option key={subject.id} value={subject.id}>
                              {subject.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {importStatus.success ? 'Close' : 'Cancel'}
              </button>
              {!importStatus.success && (
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={importStatus.isImporting || files.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {importStatus.isImporting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-4 w-4 mr-2" />
                      <span>Import {files.length} File{files.length !== 1 ? 's' : ''}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CsvImportModal;

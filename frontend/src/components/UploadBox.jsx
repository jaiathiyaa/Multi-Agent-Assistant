import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

const UploadBox = ({ onUpload, isUploading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndUpload = async (file) => {
    setError('');
    setSuccess('');
    
    if (!file) return;

    // Check file type (PDF or DOCX)
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = ['pdf', 'docx'];
    
    if (!allowedExtensions.includes(fileExtension)) {
      setError('Only PDF and DOCX files are allowed.');
      return;
    }

    try {
      await onUpload(file);
      setSuccess(`"${file.name}" uploaded and indexed successfully.`);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload document. Please try again.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`
          relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer
          transition-all duration-200 flex flex-col items-center justify-center min-h-[160px]
          ${dragActive 
            ? 'border-indigo-500 bg-indigo-500/5' 
            : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
          }
          ${isUploading ? 'pointer-events-none opacity-80' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx"
          onChange={handleChange}
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
            <div className="text-sm font-medium text-slate-300">Uploading & Indexing document...</div>
            <div className="text-xs text-slate-500">Creating vector embeddings for search RAG...</div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 bg-slate-850 rounded-full border border-slate-800 text-indigo-400 group-hover:text-indigo-300 transition-colors">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="text-sm font-medium text-slate-200">
              <span className="text-indigo-400 font-semibold hover:underline">Click to upload</span> or drag and drop
            </div>
            <div className="text-xs text-slate-500">Supports PDF and DOCX files</div>
          </div>
        )}
      </div>

      {/* Success / Error Messages */}
      {success && (
        <div className="flex items-center space-x-2 mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span className="truncate">{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 mt-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      )}
    </div>
  );
};

export default UploadBox;

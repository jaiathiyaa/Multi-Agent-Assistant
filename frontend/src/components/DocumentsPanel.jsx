import React from 'react';
import { FileText, Trash2, Calendar, Database, Loader2 } from 'lucide-react';

const DocumentsPanel = ({ documents, onDeleteDocument, isLoading }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="w-full flex flex-col h-full bg-slate-900 border-l border-slate-800/80">
      {/* Panel Header */}
      <div className="h-16 px-6 border-b border-slate-800/60 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          <span className="font-semibold text-slate-200">Session Documents</span>
        </div>
        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold px-2 py-0.5 rounded-full">
          {documents.length}
        </span>
      </div>

      {/* Documents List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            <span className="text-sm">Loading documents...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-center px-4 space-y-2">
            <FileText className="w-8 h-8 text-slate-700" />
            <p className="text-sm font-medium">No documents uploaded</p>
            <p className="text-xs text-slate-650 max-w-[200px]">
              Upload PDF or DOCX files to query details.
            </p>
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="group relative bg-slate-950/60 border border-slate-800/60 hover:border-slate-750/80 rounded-xl p-3.5 transition-all duration-200"
            >
              <div className="flex items-start justify-between pr-8">
                <div className="flex items-start space-x-3 min-w-0">
                  <div className="p-2 bg-indigo-600/15 text-indigo-400 rounded-lg shrink-0 border border-indigo-500/10">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-slate-200 truncate pr-2" title={doc.filename}>
                      {doc.filename}
                    </h4>
                    
                    {/* Metadata */}
                    <div className="flex flex-col space-y-1.5 mt-2">
                      <div className="flex items-center text-[10px] text-slate-500 space-x-1">
                        <Database className="w-3 h-3 shrink-0" />
                        <span>{doc.chunk_count || 0} chunks indexed</span>
                      </div>
                      <div className="flex items-center text-[10px] text-slate-500 space-x-1">
                        <Calendar className="w-3 h-3 shrink-0" />
                        <span>{formatDate(doc.uploaded_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delete button absolute positioned */}
              <button
                onClick={() => onDeleteDocument(doc.id)}
                className="absolute right-2 top-2 p-2 text-slate-600 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all duration-150"
                title="Delete Document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentsPanel;

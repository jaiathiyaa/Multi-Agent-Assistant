import React, { useEffect, useState } from 'react';
import { queryService } from '../services/queryService';
import { X, ChevronDown, CheckCircle2, Circle, AlertCircle, Loader2, ArrowDown } from 'lucide-react';

const TraceModal = ({ queryId, onClose }) => {
  const [trace, setTrace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrace = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await queryService.getQueryTrace(queryId);
        setTrace(data);
      } catch (err) {
        setError('Failed to fetch routing trace.');
      } finally {
        setLoading(false);
      }
    };

    if (queryId) {
      fetchTrace();
    }
  }, [queryId]);

  if (!queryId) return null;

  // Render a step in the visual pipeline
  const renderStep = ({ title, status, desc, highlight = false }) => {
    return (
      <div className="flex flex-col items-center w-full">
        <div className={`
          w-full max-w-md p-4 rounded-xl border flex items-start space-x-3 transition-all duration-200
          ${highlight 
            ? 'bg-indigo-600/10 border-indigo-500/40 shadow-lg shadow-indigo-600/5' 
            : 'bg-slate-900 border-slate-800'
          }
        `}>
          <div className="mt-0.5">
            {status === 'active' && (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            )}
            {status === 'skipped' && (
              <Circle className="w-5 h-5 text-slate-600" />
            )}
            {status === 'loading' && (
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <h4 className={`text-sm font-semibold ${highlight ? 'text-indigo-300' : 'text-slate-200'}`}>
                {title}
              </h4>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                status === 'active' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}>
                {status === 'active' ? 'FIRED' : 'SKIPPED'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{desc}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-lg bg-slate-950 border border-slate-800/80 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800/60">
          <div>
            <h3 className="font-semibold text-slate-250">Agent Trace Routing</h3>
            <p className="text-[10px] text-slate-500">Query ID: {queryId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <span className="text-sm text-slate-400">Loading execution trace...</span>
            </div>
          ) : error ? (
            <div className="flex items-center space-x-2 text-rose-400 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-full text-center text-xs bg-slate-900 border border-slate-800/60 rounded-xl p-3 text-slate-400 italic">
                "{trace?.question}"
              </div>

              {/* Step 1: Supervisor */}
              {renderStep({
                title: 'Supervisor Agent',
                status: 'active',
                desc: `Evaluated intent. Selected Routing: ${trace?.route?.toUpperCase()} with RAG Confidence: ${
                  trace?.rag_confidence !== undefined ? Math.round(trace.rag_confidence * 100) : 0
                }%`,
                highlight: true
              })}

              <ArrowDown className="w-5 h-5 text-slate-700 animate-bounce" />

              {/* Step 2: RAG Agent */}
              {renderStep({
                title: 'RAG Agent',
                status: trace?.agents_fired?.rag_agent ? 'active' : 'skipped',
                desc: trace?.agents_fired?.rag_agent 
                  ? `Retrieved context chunks (${trace?.context_lengths?.rag_context_chars || 0} characters) matching vector search query.`
                  : 'Document query context is not required or no files are loaded.',
                highlight: trace?.agents_fired?.rag_agent
              })}

              <ArrowDown className="w-5 h-5 text-slate-700" />

              {/* Step 3: Critic Agent */}
              {renderStep({
                title: 'Critic Agent',
                status: trace?.agents_fired?.critic ? 'active' : 'skipped',
                desc: trace?.agents_fired?.critic
                  ? 'Analyzed answer accuracy, safety, and source grounding check.'
                  : 'Verification skipped based on routing path.',
                highlight: trace?.agents_fired?.critic
              })}

              <ArrowDown className="w-5 h-5 text-slate-700" />

              {/* Step 4: Synthesis Agent */}
              {renderStep({
                title: 'Synthesis Agent',
                status: 'active',
                desc: 'Consolidates output from multiple agents and constructs markdown response.',
                highlight: true
              })}

              <ArrowDown className="w-5 h-5 text-slate-700" />

              {/* Step 5: Final Answer */}
              {renderStep({
                title: 'Final Answer Output',
                status: 'active',
                desc: `Answer delivered. Preview: ${trace?.final_answer_preview}...`,
                highlight: true
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800/60 bg-slate-900/20 text-center">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-sm font-medium rounded-xl transition-all duration-150 cursor-pointer"
          >
            Close Trace
          </button>
        </div>
      </div>
    </div>
  );
};

export default TraceModal;

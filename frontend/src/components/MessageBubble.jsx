import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User, Cpu, Sparkles, AlertCircle } from 'lucide-react';

const MessageBubble = ({ message, onViewTrace }) => {
  const isUser = message.sender === 'user';
  
  // Format confidence percentage
  const formatConfidence = (val) => {
    if (val === undefined || val === null) return 'N/A';
    // If confidence is already like 92
    if (val > 1) return `${Math.round(val)}%`;
    // If confidence is like 0.92
    return `${Math.round(val * 100)}%`;
  };

  const getRouteBadgeColor = (route) => {
    switch (route?.toLowerCase()) {
      case 'rag':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'web':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  return (
    <div className={`flex w-full mt-4 space-x-3 max-w-4xl mx-auto px-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Bot Icon for Assistant */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <Bot className="w-4 h-4" />
        </div>
      )}

      {/* Message Box */}
      <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`
          px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
          ${isUser 
            ? 'bg-indigo-600 text-white rounded-tr-none' 
            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
          }
        `}>
          {isUser ? (
            message.text
          ) : (
            <div className="prose prose-invert max-w-none prose-sm prose-p:leading-relaxed prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800">
              <ReactMarkdown>{message.text}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Assistant Metadata Badges */}
        {!isUser && (message.route || message.rag_confidence !== undefined) && (
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {message.route && (
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border uppercase tracking-wider ${getRouteBadgeColor(message.route)}`}>
                Route: {message.route}
              </span>
            )}
            
            {message.rag_confidence !== undefined && message.rag_confidence !== null && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 tracking-wider">
                Confidence: {formatConfidence(message.rag_confidence)}
              </span>
            )}

            {message.query_id && onViewTrace && (
              <button
                onClick={() => onViewTrace(message.query_id)}
                className="flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-400 border border-slate-700/60 hover:border-indigo-500/30 active:scale-95 transition-all duration-150 cursor-pointer"
              >
                <Cpu className="w-3 h-3" />
                <span>View Agent Trace</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* User Icon for User */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/15">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;

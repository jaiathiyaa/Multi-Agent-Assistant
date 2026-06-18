import React, { useState, useRef, useEffect } from 'react';
import { Send, CornerDownLeft } from 'lucide-react';

const ChatInput = ({ onSendMessage, isLoading, disabled }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea heights
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!message.trim() || isLoading || disabled) return;
    onSendMessage(message.trim());
    setMessage('');
  };

  const handleKeyDown = (e) => {
    // Send message on Enter without shift, otherwise add newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-4xl mx-auto">
      <div className="relative flex items-center bg-slate-900 border border-slate-800 focus-within:border-indigo-500/80 rounded-2xl p-2.5 transition-all duration-200 shadow-xl shadow-black/20">
        <textarea
          ref={textareaRef}
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask questions from your documents or general topics..."
          disabled={isLoading || disabled}
          className="flex-1 max-h-52 min-h-[24px] bg-transparent text-slate-200 text-sm focus:outline-none resize-none pl-3 pr-12 py-1 placeholder:text-slate-500 overflow-y-auto leading-relaxed"
        />

        <button
          type="submit"
          disabled={!message.trim() || isLoading || disabled}
          className={`
            absolute right-3.5 bottom-3.5 p-2 rounded-xl transition-all duration-200
            ${!message.trim() || isLoading || disabled
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 shadow-md shadow-indigo-600/10'
            }
          `}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex justify-between items-center px-4 mt-2 text-[10px] text-slate-500">
        <span>Enter to send, Shift+Enter for new line</span>
        <div className="flex items-center space-x-1">
          <span>AI Supervisor System</span>
          <CornerDownLeft className="w-2.5 h-2.5" />
        </div>
      </div>
    </form>
  );
};

export default ChatInput;

import React, { useState } from 'react';
import { Plus, MessageSquare, Trash2, Menu, X } from 'lucide-react';

const Sidebar = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  isOpen,
  toggleSidebar
}) => {
  const [isNaming, setIsNaming] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');

  const handleCreateSubmit = () => {
    onCreateSession(newSessionName);
    setNewSessionName('');
    setIsNaming(false);
    if (isOpen && window.innerWidth < 1024) toggleSidebar();
  };
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 lg:static
        w-72 bg-slate-900 border-r border-slate-800/80 flex flex-col h-full
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="h-16 px-6 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold text-slate-200">Chat Sessions</span>
          </div>
          <button 
            className="p-1 text-slate-400 hover:text-white lg:hidden"
            onClick={toggleSidebar}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button Container */}
        <div className="p-4">
          {isNaming ? (
            <div className="flex flex-col space-y-2 bg-slate-950 p-3.5 border border-slate-800/80 rounded-2xl">
              <input
                type="text"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                placeholder="Chat name (optional)..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs focus:outline-none text-slate-200"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateSubmit();
                  } else if (e.key === 'Escape') {
                    setNewSessionName('');
                    setIsNaming(false);
                  }
                }}
                autoFocus
              />
              <div className="flex items-center justify-end space-x-1.5 pt-1">
                <button
                  onClick={() => {
                    setNewSessionName('');
                    setIsNaming(false);
                  }}
                  className="px-2.5 py-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSubmit}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/10 transition-colors cursor-pointer"
                >
                  Create
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setNewSessionName(`Chat #${sessions.length + 1}`);
                setIsNaming(true);
              }}
              className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-4 rounded-xl font-medium shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>New Chat</span>
            </button>
          )}
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No chat history yet.
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === currentSessionId;
              return (
                <div
                  key={session.id}
                  className={`group relative flex items-center w-full rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-800 text-white font-medium shadow-sm border border-slate-700/50'
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <button
                    onClick={() => {
                      onSelectSession(session.id);
                      if (isOpen && window.innerWidth < 1024) toggleSidebar();
                    }}
                    className="flex-1 flex items-center space-x-3 py-3 px-4 text-left truncate overflow-hidden min-w-0"
                  >
                    <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span className="truncate text-sm pr-6">
                      {session.title || 'Untitled Session'}
                    </span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="absolute right-2 opacity-0 group-hover:opacity-100 focus:opacity-100 p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-all duration-150"
                    title="Delete Chat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-900/50 text-xs text-slate-500 text-center">
          DocumentAI Agent Platform v1.0
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

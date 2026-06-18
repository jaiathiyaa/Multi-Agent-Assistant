import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import ChatInput from '../components/ChatInput';
import MessageBubble from '../components/MessageBubble';
import UploadBox from '../components/UploadBox';
import DocumentsPanel from '../components/DocumentsPanel';
import TraceModal from '../components/TraceModal';

import { sessionService } from '../services/sessionService';
import { historyService } from '../services/historyService';
import { documentService } from '../services/documentService';
import { queryService } from '../services/queryService';

import { Menu, FileText, MessageSquare, Loader2, PanelRightOpen, PanelRightClose } from 'lucide-react';

const Chat = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [documents, setDocuments] = useState([]);
  
  // Loading states
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [docsLoading, setDocsLoading] = useState(false);
  const [queryLoading, setQueryLoading] = useState(false);
  
  // Sidebar / Right panel responsive toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  
  // Trace Modal state
  const [activeTraceQueryId, setActiveTraceQueryId] = useState(null);

  const messagesEndRef = useRef(null);

  // Auto scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, queryLoading]);

  // Load Sessions on Mount
  useEffect(() => {
    const initSessions = async () => {
      try {
        setSessionsLoading(true);
        const data = await sessionService.getSessions();
        
        if (data.length === 0) {
          // If no sessions, automatically create one
          const newSession = await sessionService.createSession('General Chat');
          const sessionWithTime = { ...newSession, last_active: new Date(newSession.created_at) };
          setSessions([sessionWithTime]);
          setCurrentSessionId(newSession.id);
        } else {
          // Fetch queries for each session to find the last activity time
          const sessionsWithTime = await Promise.all(
            data.map(async (session) => {
              try {
                const queries = await historyService.getSessionQueries(session.id);
                if (queries && queries.length > 0) {
                  const latestQuery = queries.reduce((latest, current) => {
                    return new Date(current.created_at) > new Date(latest.created_at) ? current : latest;
                  }, queries[0]);
                  return { ...session, last_active: new Date(latestQuery.created_at) };
                }
              } catch (e) {
                console.error(e);
              }
              return { ...session, last_active: new Date(session.created_at) };
            })
          );

          // Sort sessions by last_active desc (latest activity at the top)
          const sortedData = sessionsWithTime.sort(
            (a, b) => b.last_active - a.last_active
          );
          setSessions(sortedData);
          // Auto select first session
          setCurrentSessionId(sortedData[0].id);
        }
      } catch (err) {
        console.error('Failed to load sessions', err);
      } finally {
        setSessionsLoading(false);
      }
    };

    initSessions();
  }, []);

  // Handle Session Selection & Load Session Data (Queries and Documents)
  useEffect(() => {
    if (!currentSessionId) return;

    const loadSessionData = async () => {
      try {
        setChatLoading(true);
        setDocsLoading(true);
        
        // Fetch Queries (History)
        const queries = await historyService.getSessionQueries(currentSessionId);
        const sortedQueries = [...queries].sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        const formattedMessages = [];
        
        sortedQueries.forEach((q) => {
          // User message
          formattedMessages.push({
            id: `q-${q.id}`,
            sender: 'user',
            text: q.question,
          });
          // Assistant response
          formattedMessages.push({
            id: `a-${q.id}`,
            sender: 'assistant',
            text: q.final_answer || q.synthesized_answer,
            route: q.route,
            rag_confidence: q.rag_confidence,
            query_id: q.id,
          });
        });
        
        setMessages(formattedMessages);

        // Fetch Documents
        const docs = await documentService.getSessionDocuments(currentSessionId);
        setDocuments(docs);
      } catch (err) {
        console.error('Failed to load session details', err);
      } finally {
        setChatLoading(false);
        setDocsLoading(false);
      }
    };

    loadSessionData();
  }, [currentSessionId]);

  // Create new session
  const handleCreateSession = async (customTitle) => {
    const finalTitle = customTitle?.trim() || `Chat #${sessions.length + 1}`;
    
    try {
      setSessionsLoading(true);
      const newSession = await sessionService.createSession(finalTitle);
      const sessionWithTime = { ...newSession, last_active: new Date(newSession.created_at) };
      setSessions([sessionWithTime, ...sessions]);
      setCurrentSessionId(newSession.id);
    } catch (err) {
      console.error('Failed to create session', err);
    } finally {
      setSessionsLoading(false);
    }
  };

  // Delete session
  const handleDeleteSession = async (sessionId) => {
    try {
      await sessionService.deleteSession(sessionId);
      const updated = sessions.filter((s) => s.id !== sessionId);
      setSessions(updated);
      
      if (currentSessionId === sessionId) {
        if (updated.length > 0) {
          setCurrentSessionId(updated[0].id);
        } else {
          // Automatically create a new one if empty
          const newSession = await sessionService.createSession('General Chat');
          setSessions([newSession]);
          setCurrentSessionId(newSession.id);
        }
      }
    } catch (err) {
      console.error('Failed to delete session', err);
    }
  };

  // Upload document
  const handleUploadDocument = async (file) => {
    setDocsLoading(true);
    try {
      await documentService.uploadDocument(currentSessionId, file);
      // Refresh documents
      const docs = await documentService.getSessionDocuments(currentSessionId);
      setDocuments(docs);
    } finally {
      setDocsLoading(false);
    }
  };

  // Delete document
  const handleDeleteDocument = async (docId) => {
    try {
      await documentService.deleteDocument(docId);
      setDocuments(documents.filter((d) => d.id !== docId));
    } catch (err) {
      console.error('Failed to delete document', err);
    }
  };

  // Submit query
  const handleSendMessage = async (text) => {
    if (queryLoading || !currentSessionId) return;

    // Append user message immediately
    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setQueryLoading(true);

    try {
      const response = await queryService.askQuestion(currentSessionId, text);
      const assistantMsg = {
        id: `a-${response.id}`,
        sender: 'assistant',
        text: response.final_answer || response.synthesized_answer,
        route: response.route,
        rag_confidence: response.rag_confidence,
        query_id: response.id,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Update session activity timestamp and move to the top
      setSessions((prevSessions) => {
        const updated = prevSessions.map((s) => {
          if (s.id === currentSessionId) {
            return { ...s, last_active: new Date() };
          }
          return s;
        });
        return [...updated].sort((a, b) => b.last_active - a.last_active);
      });
    } catch (err) {
      console.error('Failed to ask question', err);
      // Display error message
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: '⚠️ An error occurred while processing your request. Please check if your documents are indexed or try again.',
        },
      ]);
    } finally {
      setQueryLoading(false);
    }
  };

  const activeSession = sessions.find((s) => s.id === currentSessionId);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Session History Sidebar */}
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onCreateSession={handleCreateSession}
        onDeleteSession={handleDeleteSession}
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar />

        {/* Workspace Toolbar / Header for mobile toggle */}
        <div className="h-12 border-b border-slate-900 bg-slate-950/40 px-4 flex items-center justify-between lg:px-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg"
              title="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-sm">
              {activeSession?.title || 'Loading Session...'}
            </span>
          </div>

          <button
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg flex items-center space-x-1.5 text-xs font-medium"
            title="Toggle Documents Panel"
          >
            {rightPanelOpen ? (
              <>
                <PanelRightClose className="w-4 h-4" />
                <span className="hidden sm:inline">Hide Documents</span>
              </>
            ) : (
              <>
                <PanelRightOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Show Documents ({documents.length})</span>
              </>
            )}
          </button>
        </div>

        {/* Inner Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Messages Column */}
          <div className="flex-1 flex flex-col h-full bg-slate-950 relative overflow-hidden">
            {chatLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                <span className="text-sm text-slate-400">Loading conversation history...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-4 max-w-md mx-auto">
                <div className="p-4 bg-indigo-600/10 text-indigo-400 rounded-3xl border border-indigo-500/20">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-slate-355">Start a conversation</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  First, upload documents using the panel on the right. Then, ask details, request summaries, or verify metrics.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto py-6 space-y-2">
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    onViewTrace={setActiveTraceQueryId}
                  />
                ))}

                {queryLoading && (
                  <div className="flex w-full mt-4 space-x-3 max-w-4xl mx-auto px-4 justify-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 text-slate-400 text-sm italic">
                      AI is formulating response using Supervisor agent...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Chat Input Container */}
            <div className="p-4 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent border-t border-slate-900/60">
              <ChatInput
                onSendMessage={handleSendMessage}
                isLoading={queryLoading}
              />
            </div>
          </div>

          {/* Right-Side Documents Panel (Upload Section + Uploaded Documents List) */}
          <div className={`
            ${rightPanelOpen ? 'w-80 border-l border-slate-800/80' : 'w-0'} 
            shrink-0 flex flex-col h-full bg-slate-900 transition-all duration-300 overflow-hidden
          `}>
            {rightPanelOpen && (
              <div className="flex-1 flex flex-col h-full overflow-y-auto">
                {/* Upload Section Header */}
                <div className="p-4 border-b border-slate-800/60 bg-slate-900/50">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Upload Documents
                  </h3>
                  <UploadBox
                    onUpload={handleUploadDocument}
                    isUploading={docsLoading}
                  />
                </div>

                {/* Uploaded Documents List */}
                <div className="flex-1 min-h-[300px]">
                  <DocumentsPanel
                    documents={documents}
                    onDeleteDocument={handleDeleteDocument}
                    isLoading={docsLoading}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Agent Trace Modal */}
      {activeTraceQueryId && (
        <TraceModal
          queryId={activeTraceQueryId}
          onClose={() => setActiveTraceQueryId(null)}
        />
      )}
    </div>
  );
};

export default Chat;

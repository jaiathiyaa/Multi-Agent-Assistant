import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Bot, 
  UploadCloud, 
  Database, 
  Globe, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  CheckCircle2, 
  MessageSquare, 
  FileSearch,
  ChevronRight,
  Mail,
  UserCheck,
  Sparkles
} from 'lucide-react';

const GetStarted = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Database className="w-6 h-6 text-indigo-400" />,
      title: 'RAG Agent',
      desc: 'Retrieves high-fidelity vector context directly from your uploaded files, ensuring zero hallucinations.'
    },
    {
      icon: <Globe className="w-6 h-6 text-cyan-400" />,
      title: 'Web Agent',
      desc: 'Performs live internet search to ground information in real-time developments and public data.'
    },
    {
      icon: <Cpu className="w-6 h-6 text-violet-400" />,
      title: 'Supervisor Agent',
      desc: 'Dynamically routes intent, choosing the most optimal agent execution path and verifying answers.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      title: 'Critic Agent',
      desc: 'Validates safety, citation fidelity, and semantic consistency before publishing replies.'
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      title: 'Synthesis Agent',
      desc: 'Harmonizes inputs from various agents into a single, cohesive, markdown-formatted final response.'
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-purple-400" />,
      title: 'Session Based Chat',
      desc: 'Maintains query memory and context dynamically across multiple conversations and sessions.'
    },
    {
      icon: <UploadCloud className="w-6 h-6 text-rose-400" />,
      title: 'Document Upload',
      desc: 'Easily ingest PDF and DOCX documents and extract text segments instantly.'
    },
    {
      icon: <FileSearch className="w-6 h-6 text-pink-400" />,
      title: 'Source Grounded Answers',
      desc: 'Answers are mapped directly to citation segments in your files for verifiable truth.'
    }
  ];

  const workflowSteps = [
    {
      step: '1',
      title: 'Upload Document',
      desc: 'Drag & drop PDF or DOCX. Text is parsed and split into vector embeddings.'
    },
    {
      step: '2',
      title: 'Retrieve Context',
      desc: 'ChromaDB searches the index using dense retrieval matching your inquiry.'
    },
    {
      step: '3',
      title: 'Multi-Agent Reasoning',
      desc: 'Supervisor routes task to RAG/Web and Critic verify compliance.'
    },
    {
      step: '4',
      title: 'Verified Answer',
      desc: 'Synthesis generates a detailed, citation-grounded response.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Landing Navbar */}
      <nav className="h-20 border-b border-slate-900/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6 lg:px-16">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white">
            <Bot className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white bg-gradient-to-r from-indigo-400 to-purple-450 bg-clip-text text-transparent">
            DocumentAI
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            to="/login"
            className="text-sm font-semibold text-slate-350 hover:text-white transition-colors px-4 py-2"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/15 transition-all duration-200"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-16 pt-24 pb-20 flex flex-col items-center text-center overflow-hidden">
        {/* Decorative ambient blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="inline-flex items-center space-x-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider mb-6 uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Multi-Agent AI</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.1] mb-6">
          Ask Questions From Your{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Documents
          </span>
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl leading-relaxed mb-10">
          Supercharge your research with our multi-agent document intelligence platform. Ingest PDFs or DOCX files and get source-grounded answers verified by autonomous Critic agents.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => navigate('/signup')}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-semibold shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <span>Get Started</span>
            <ChevronRight className="w-5 h-5" />
          </button>
          
          <a
            href="#features"
            className="w-full sm:w-auto flex items-center justify-center bg-slate-905 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 lg:px-16 py-20 border-t border-slate-900 bg-slate-950/20 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Powerful Autonomous Agent Capabilities
            </h2>
            <p className="text-slate-400 mt-4">
              Our supervisor coordinates an orchestra of dedicated intelligence agents to inspect, verify, and formulate answers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="bg-slate-900/40 border border-slate-900 hover:border-slate-800/80 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/[0.02]"
              >
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl w-fit mb-4">
                  {feat.icon}
                </div>
                <h3 className="text-base font-semibold text-slate-200 mb-2">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="px-6 lg:px-16 py-20 border-t border-slate-900 bg-slate-900/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Seamless Intelligence Workflow
            </h2>
            <p className="text-slate-400 mt-4 font-medium">
              From raw document to verified answer in four clean steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connector Line for Desktop */}
            <div className="hidden md:block absolute top-[44px] left-[15%] right-[15%] h-[1px] bg-slate-800 -z-10" />

            {workflowSteps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-slate-950 border border-slate-800 text-indigo-400 flex items-center justify-center font-bold text-lg shadow-md mb-4 bg-slate-900">
                  {step.step}
                </div>
                <h3 className="text-base font-semibold text-slate-200 mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="mt-auto border-t border-slate-900 bg-slate-950/80 px-6 lg:px-16 py-8 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold text-slate-400">DocumentAI</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} DocumentAI Inc. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-slate-500">
            <a href="https://www.linkedin.com/in/jai-athiyaa-919192294/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">
              LinkedIn
            </a>
            <span className="text-slate-800 hidden sm:inline">•</span>
            <a href="https://github.com/jaiathiyaa" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              GitHub
            </a>
            <span className="text-slate-800 hidden sm:inline">•</span>
            <a href="https://instagram.com/jai_athiyaa07" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors">
              Instagram
            </a>
            <span className="text-slate-800 hidden sm:inline">•</span>
            <a href="https://wa.me/919361148071" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
              WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GetStarted;

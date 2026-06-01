import react from 'react';
import Navbar from '../components/common/Navbar';
import { Brain , Star , MessageSquare , FileText , Check , ArrowRight} from 'lucide-react';
import Card from '../components/Card';
import { motion } from "framer-motion";


const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } }
};

const features = [
  {
    title: "Intelligent Document Analysis",
    description: "Leverage advanced AI to analyze and extract insights from your documents with unparalleled accuracy.",
    icon: Brain
  },
  {
    title: "Source-Aware Responses",
    description: "Get precise answers to your questions with clear citations, ensuring transparency and trust in every response.",
    icon: FileText
  },
  {
    title: "Seamless Integration",
    description: "Easily integrate with your existing workflows and tools, making document analysis effortless and efficient.",
    icon: MessageSquare
  },
  {
    title: "Seamless Integration",
    description: "Easily integrate with your existing workflows and tools, making document analysis effortless and efficient.",
    icon: MessageSquare
  },
  {
    title: "Seamless Integration",
    description: "Easily integrate with your existing workflows and tools, making document analysis effortless and efficient.",
    icon: MessageSquare
  },
  {
    title: "Seamless Integration",
    description: "Easily integrate with your existing workflows and tools, making document analysis effortless and efficient.",
    icon: MessageSquare
  }
];

function LandingPage() {
  return (
    <div className="bg-gray-950 min-h-screen">
      <Navbar />


        {/* Hero Section */}

      <motion.section initial="hidden" animate="visible" variants={fadeUp} className="flex flex-col items-center pt-32 pb-20 px-6">

        <div className="border rounded-2xl border-[#0D158D]/40 text-white max-h-7 px-2 py-4 flex items-center gap-2 bg-blue-500/10">
            <Star color="#0D158D" size={16} />
            <p className="text-sm">Powered by Advanced RAG Technology</p>
        </div>

        <div className="flex flex-col gap-6 max-w-4xl mt-6">
            <h1 className="text-7xl font-bold text-white text-center max-w-3xl">
              Chat with Your PDFs Using <span className="text-violet-400">AI  Magic</span>
            </h1>
              <p className="text-white text-2xl text-center">
                Upload documents, ask questions in natural language, and get<br></br> instant answers with source citations. Your AI-powered document<br></br> assistant.
              </p>
        </div>
        <div className="flex justify-evenly items-center mt-10 gap-4">
          <button className="bg-linear-to-r from-violet-600 to-purple-500 rounded-lg py-3 px-10 text-white hover:px-10 shadow-lg hover:from-violet-500 hover:to-purple-400 transition duration-300 mx-4">
            <div className="flex items-center gap-2">
              <Star size={20} color="white"/> 
              Start Free Trail
            </div>
          </button>
          <button className="bg-transparent text-gray-400 hover:text-white hover:bg-gray-900 hover:px-10 shadow-gray-400 rounded-md py-3 px-10 transition duration-300 border border-gray-400/50">
            <div className="flex items-center gap-2">
                <MessageSquare size={20} color="white" />
                Watch Demo
            </div>
          </button>
        </div>
      </motion.section>


      {/* Animated Preview */}
      <section className="flex justify-center items-center py-3">
        <motion.div initial={{ opacity: 0 , scale:0.95}} whileInView={{ opacity: 1,scale:1 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="w-full max-w-4xl h-96 border border-purple-900/50 shadow-[0_0_40px_rgba(139,92,246,0.6)] bg-zinc-700/40 rounded-xl relative overflow-hidden ">

          {/* Main Preview Window */}
          <div className="absolute inset-0 m-2 bg-black border  rounded-xl opacity-70 overflow-hidden">

            {/* Top Bar */}
            <div className="absolute top-0 left-0 w-full h-14 border-b border-zinc-700/40 bg-black flex items-center px-4 gap-2">

              {/* Traffic Lights */}
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <p className="m-4 text-gray-300 text-md">chat.documind.ai</p>

            </div>

            {/* Content Area */}
            <div className="absolute top-14 left-0 right-0 bottom-0 p-4 border border-violet-500/40 rounded-b-xl">
              <div className="absolute right-10 h-md p-3 rounded-lg border border-gray-300/15 bg-zinc-600/20 flex items-center justify-center text-white text-md font-bold">
                <p>What are the key findings in section 3?</p>
              </div>
              <div className="absolute bottom-10 left-7 w-md h-40 rounded-lg border border-violet-500/40 bg-violet-900/15 text-white text-md">
                <div className="px-3 pt-3">
                  <p className="text-white font-bold">Based on section 3 (pages 12-15), the key findings are:</p>
                  <ul className="text-white list-disc list-inside mt-2 text-center text-[14px]">
                    <li>Revenue increased by 34% YoY</li>
                    <li>User engagement up 2.3x</li>
                    <li>Churn rate decreased to 4.2%</li>
                  </ul>

                </div>
                <div className="w-full h-7 border-t border-gray-400/20 mt-2 flex items-center gap-2 px-3 py-5">
                  <FileText color="gray" size={16}/>
                  <p className="text-sm text-gray-400">Source: Pages 12-15</p>
                </div>
              </div>
              
            </div>

          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="flex flex-col items-center h-[90vh] bg-zinc-800/40 mt-20 gap-10 py-20">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{duration: 0.6}} className="text-white text-center">
          <h1 className="text-5xl font-bold pb-8">
            Everything You Need to <span className="text-violet-400">Master Your Documents</span>
          </h1>
          <p className="text-xl text-gray-300">
            Powerful features designed to make document analysis effortless and <br/> efficient.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="w-full max-w-7xl p-4 grid md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={fadeUp}>
              <Card
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Testimonials Section */}
      <section className="flex flex-col items-center h-[50vh] py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-white text-center"
        >
          <h1 className="text-5xl font-bold pb-8">Trusted by <span className="text-violet-400">Teams Worldwide</span></h1>
          <p className="text-xl text-gray-300">See what our users are saying</p>
        </motion.div>

        {/* Parent grid — staggerContainer */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="w-full max-w-7xl p-4 grid md:grid-cols-3 gap-10"
        >
          {/* Each card — fadeUp */}
          <motion.div variants={fadeUp} className="bg-zinc-800/40 border border-zinc-500/30 rounded-lg w-100 h-38 text-white p-5">
            <p>"Reduced document review time by 80%.<br /> Game changer for our team."</p>
            <div className="flex items-center gap-3 mt-4">
              <div className="border border-violet-400 rounded-full w-10 h-10 bg-violet-400"></div>
              <div>
                <p className="font-bold">John Doe</p>
                <p className="text-sm text-gray-400">Product Manager, TechCorp</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-zinc-800/40 border border-zinc-500/30 rounded-lg w-100 h-38 text-white p-5">
            <p>"Reduced document review time by 80%.<br /> Game changer for our team."</p>
            <div className="flex items-center gap-3 mt-4">
              <div className="border border-violet-400 rounded-full w-10 h-10 bg-violet-400"></div>
              <div>
                <p className="font-bold">John Doe</p>
                <p className="text-sm text-gray-400">Product Manager, TechCorp</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-zinc-800/40 border border-zinc-500/30 rounded-lg w-100 h-38 text-white p-5">
            <p>"Reduced document review time by 80%.<br /> Game changer for our team."</p>
            <div className="flex items-center gap-3 mt-4">
              <div className="border border-violet-400 rounded-full w-10 h-10 bg-violet-400"></div>
              <div>
                <p className="font-bold">John Doe</p>
                <p className="text-sm text-gray-400">Product Manager, TechCorp</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>


      {/* Pricing Section */}
      <section className="flex flex-col items-center h-[75vh] py-20 bg-zinc-800/30">
          <motion.div initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }} className="text-white text-center">
            <h1 className="text-5xl font-bold pb-8">Simple,<span className="text-violet-400"> Transparent Pricing</span></h1>
            <p className="text-xl text-gray-300">Choose the perfect plan for your needs</p>
          </motion.div>
          <motion.div variants={staggerContainer}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.1 }} className="relative w-full max-w-7xl py-7 px-8 grid md:grid-cols-3 gap-10">
            <motion.div variants={fadeUp} className="flex flex-col w-90 h-100 border border-gray-300/15 rounded-lg py-4 px-6">
              <div><h1 className="text-white text-2xl font-bold">Starter</h1></div>
              <div className="text-white flex mt-4 relative"><h1 className="text-4xl font-bold">$19</h1><p className="text-md absolute left-15 top-4">/month</p></div>
              <div>
                <div className="flex pt-8 py-2">
                  <Check size={24} color="green"/>
                  <p className="text-white ml-2">10 PDFs per month</p>
                </div>
                <div className="flex py-2">
                  <Check size={24} color="green"/>
                  <p className="text-white ml-2">10 PDFs per month</p>
                </div>
                <div className="flex py-2">
                  <Check size={24} color="green"/>
                  <p className="text-white ml-2">10 PDFs per month</p>
                </div>
                <div className="flex py-2">
                  <Check size={24} color="green"/>
                  <p className="text-white ml-2">10 PDFs per month</p>
                </div>
              </div>
              <div className="px-2 border border-gray-300/15 absolute bottom-12 w-78 h-10 rounded-xl flex items-center justify-center text-white hover:bg-gray-900 hover:px-10 transition duration-300">
                <button className="text-white font-bold">Start Free Trial</button>
              </div>
            </motion.div>
            <motion.div variants={fadeUp} className="flex flex-col w-90 h-100 border border-gray-300/15 rounded-lg py-4 px-6 shadow-[0_0_20px_rgba(76,46,255,0.5)] bg-violet-500/4">
              <div><h1 className="text-white text-2xl font-bold">Starter</h1></div>
              <div className="text-white flex mt-4 relative"><h1 className="text-4xl font-bold">$19</h1><p className="text-md absolute left-15 top-4">/month</p></div>
              <div className="absolute top-3 right-145 border rounded-xl px-4 bg-violet-500"><p className="text-white">Most Popular</p></div>
              <div>
                <div className="flex pt-8 py-2">
                  <Check size={24} color="green"/>
                  <p className="text-white ml-2">10 PDFs per month</p>
                </div>
                <div className="flex py-2">
                  <Check size={24} color="green"/>
                  <p className="text-white ml-2">10 PDFs per month</p>
                </div>
                <div className="flex py-2">
                  <Check size={24} color="green"/>
                  <p className="text-white ml-2">10 PDFs per month</p>
                </div>
                <div className="flex py-2">
                  <Check size={24} color="green"/>
                  <p className="text-white ml-2">10 PDFs per month</p>
                </div>
              </div>
              <div className="bg-linear-to-r from-violet-600 to-purple-500 px-2 border border-gray-300/15 absolute bottom-12 w-78 h-10 rounded-xl flex items-center justify-center text-white hover:from-violet-600 hover:to-purple-400">
                <button className="text-white font-bold">Start Free Trial</button>
              </div>
            </motion.div>
            <motion.div variants={fadeUp} className="flex flex-col w-90 h-100 border border-gray-300/15 rounded-lg py-4 px-6">
              <div><h1 className="text-white text-2xl font-bold">Starter</h1></div>
              <div className="text-white flex mt-4 relative"><h1 className="text-4xl font-bold">$19</h1><p className="text-md absolute left-15 top-4">/month</p></div>
              <div>
                <div className="flex pt-8 py-2">
                  <Check size={24} color="green"/>
                  <p className="text-white ml-2">10 PDFs per month</p>
                </div>
                <div className="flex py-2">
                  <Check size={24} color="green"/>
                  <p className="text-white ml-2">10 PDFs per month</p>
                </div>
                <div className="flex py-2">
                  <Check size={24} color="green"/>
                  <p className="text-white ml-2">10 PDFs per month</p>
                </div>
                <div className="flex py-2">
                  <Check size={24} color="green"/>
                  <p className="text-white ml-2">10 PDFs per month</p>
                </div>
              </div>
              <div className="px-2 border border-gray-300/15 absolute bottom-12 w-78 h-10 rounded-xl flex items-center justify-center text-white hover:bg-gray-900 hover:px-10 transition duration-300">
                <button className="text-white font-bold">Start Free Trial</button>
              </div>
            </motion.div>
          </motion.div>
      </section>

      {/*  */}
      <motion.section initial="hidden" animate="visible" variants={fadeUp} className="flex flex-col items-center h-[50vh] py-20 border-b border-gray-700/30">
        <div  className="text-white text-center">
            <h1 className="text-5xl font-bold pb-8">Ready to Transform Your <span className="text-violet-400">Document <br/> Workflow?</span></h1>
            <p className="text-xl text-gray-300">Join thousands of professionals who trust DocuMind AI</p>
        </div>
        <button className="bg-linear-to-r from-violet-600 to-purple-500 rounded-lg py-3 px-10 text-white hover:px-10 shadow-lg hover:from-violet-500 hover:to-purple-400 transition duration-300 mt-10">
          <p className="flex items-center">
            <ArrowRight className="mr-2" /> Start Your Free Trial
          </p>
        </button>
        <p className="text-gray-400 text-md mt-4">
          No credit card required • 14-day free trial • Cancel anytime
        </p>
      </motion.section>
      <section className="flex justify-between px-100 h-[25vh]  max-w-8xl border border-gray-700/30 ">
          
          <div className="flex flex-col py-8 gap-3">
            <h1 className="text-white text-2xl font-bold">Product</h1>
            <p className="text-gray-300">Features</p>
            <p className="text-gray-300">Pricing</p>
            <p className="text-gray-300">Security</p>
          </div>
          <div className="flex flex-col py-8 gap-3">
            <h1 className="text-white text-2xl font-bold">Company</h1>
            <p className="text-gray-300">About</p>
            <p className="text-gray-300">Blog</p>
            <p className="text-gray-300">Careers</p>
          </div>
          <div className="flex flex-col py-8 gap-3">
            <h1 className="text-white text-2xl font-bold">Resources</h1>
            <p className="text-gray-300">Document</p>
            <p className="text-gray-300">API</p>
            <p className="text-gray-300">Support</p>
          </div>
          <div className="flex flex-col py-8 gap-3 border">
            <h1 className="text-white text-2xl font-bold">Legal</h1>
            <p className="text-gray-300">Privacy</p>
            <p className="text-gray-300">Terms</p>
            <p className="text-gray-300">Cookie Policy</p>
          </div>
      </section>
      <section className="flex justify-evenly items-center max-w-8xl h-[10vh] border-t border-gray-700/30">
        <div className="flex items-center gap-2">
            <div className="bg-linear-to-r from-violet-600 to-purple-500 p-1 rounded-md">
                <Brain color="white" size={12} />
            </div>

            <p className="text-violet-400 text-md font-bold cursor-pointer">
                DocuMind AI
            </p>
        </div>
        <p className="text-gray-400 text-center py-4">© 2024 DocuMind AI. All rights reserved.</p>

      </section>
    </div>
  );
}

export default LandingPage;
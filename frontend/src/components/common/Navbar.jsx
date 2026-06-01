import React from 'react';
import { Brain } from 'lucide-react';

function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-700/40 backdrop-blur-md border-b border-white/10 h-16">
            <div className="flex justify-between items-center h-full max-w-7xl mx-auto px-4">

                {/* Logo Section */}
                <div className="flex items-center gap-2">
                    <div className="bg-linear-to-r from-violet-600 to-purple-500 p-1 rounded-md">
                        <Brain color="white" size={20} />
                    </div>

                    <h1 className="text-violet-400 text-xl font-bold cursor-pointer">
                        DocuMind AI
                    </h1>
                </div>

                {/* Navigation Links */}
                <div className="flex items-center gap-4">
                    <ul className="flex gap-6 text-gray-300">
                        <li className="hover:text-white cursor-pointer">Features</li>
                        <li className="hover:text-white cursor-pointer">Pricing</li>
                        <li className="hover:text-white cursor-pointer">Testimonials</li>
                    </ul>
                </div>

                {/* Buttons */}
                <div>
                    <button className="bg-transparent text-gray-400 hover:text-white hover:bg-gray-600 rounded-md py-1 px-2 transition duration-300">
                        Log in
                    </button>

                    <button className="bg-linear-to-r from-violet-600 to-purple-500 rounded-lg py-1 px-3 text-white hover:from-violet-500 hover:to-purple-400 transition duration-300 mx-4">
                        Get Started
                    </button>
                </div>

            </div>
        </nav>
    );
}

export default Navbar;
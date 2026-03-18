'use client';

import { useState } from 'react';
import { Search, Globe, MessageSquare, Settings } from 'lucide-react';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-center">Astranova Browser</h1>
          <p className="text-gray-400 text-center">AI-Native Browser with Cognitive Intelligence</p>
        </header>
        
        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the web with AI..."
                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium">
              Search
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <Globe className="h-5 w-5 mr-2 text-blue-400" />
              <h3 className="text-lg font-semibold">Web Navigation</h3>
            </div>
            <p className="text-gray-400">Browse with AI assistance</p>
          </div>
          
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <MessageSquare className="h-5 w-5 mr-2 text-green-400" />
              <h3 className="text-lg font-semibold">AI Chat</h3>
            </div>
            <p className="text-gray-400">Get AI-powered answers</p>
          </div>
          
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <Settings className="h-5 w-5 mr-2 text-purple-400" />
              <h3 className="text-lg font-semibold">Settings</h3>
            </div>
            <p className="text-gray-400">Customize your experience</p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Globe, MessageSquare, Settings, Bookmark, History, ArrowLeft, ArrowRight, Home, Star, Wallet } from 'lucide-react';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  favicon?: string;
}

interface HistoryItem {
  id: string;
  title: string;
  url: string;
  timestamp: Date;
}

export default function HomePage() {
  const [url, setUrl] = useState('https://example.com');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAISummary, setShowAISummary] = useState(false);
  const [aiSummary, setAISummary] = useState('');
  const [currentTitle, setCurrentTitle] = useState('Astranova Browser');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleNavigate = (targetUrl: string) => {
    if (!targetUrl.startsWith('http')) {
      targetUrl = `https://${targetUrl}`;
    }
    setUrl(targetUrl);
    setIsLoading(true);
    
    // Add to history
    const historyItem: HistoryItem = {
      id: Date.now().toString(),
      title: targetUrl,
      url: targetUrl,
      timestamp: new Date()
    };
    setHistory(prev => [historyItem, ...prev.slice(0, 49)]);
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    // AI-powered search
    try {
      const response = await fetch('/api/v1/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      if (response.ok) {
        const results = await response.json();
        // Navigate to first result or AI summary
        if (results.aiSummary) {
          setAISummary(results.aiSummary);
          setShowAISummary(true);
        }
        if (results.results?.[0]?.url) {
          handleNavigate(results.results[0].url);
        }
      }
    } catch (error) {
      // Fallback to regular search
      handleNavigate(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
    }
  };

  const addBookmark = () => {
    const bookmark: Bookmark = {
      id: Date.now().toString(),
      title: currentTitle,
      url: url,
      favicon: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`
    };
    setBookmarks(prev => [...prev, bookmark]);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    try {
      const iframe = iframeRef.current;
      if (iframe?.contentDocument?.title) {
        setCurrentTitle(iframe.contentDocument.title);
      }
    } catch (error) {
      // Cross-origin restrictions
      setCurrentTitle(new URL(url).hostname);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 p-2">
        <div className="flex items-center gap-2 mb-2">
          <button className="p-2 hover:bg-gray-800 rounded">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button className="p-2 hover:bg-gray-800 rounded">
            <ArrowRight className="h-4 w-4" />
          </button>
          <button className="p-2 hover:bg-gray-800 rounded">
            <Home className="h-4 w-4" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNavigate(url)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter URL or search..."
            />
          </div>
          
          <button 
            onClick={addBookmark}
            className="p-2 hover:bg-gray-800 rounded"
            title="Add Bookmark"
          >
            <Bookmark className="h-4 w-4" />
          </button>
          
          <button 
            onClick={() => setShowBookmarks(!showBookmarks)}
            className="p-2 hover:bg-gray-800 rounded"
            title="Bookmarks"
          >
            <Star className="h-4 w-4" />
          </button>
          
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 hover:bg-gray-800 rounded"
            title="History"
          >
            <History className="h-4 w-4" />
          </button>
          
          <button className="p-2 hover:bg-gray-800 rounded">
            <Wallet className="h-4 w-4" />
          </button>
          
          <button className="p-2 hover:bg-gray-800 rounded">
            <Settings className="h-4 w-4" />
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="AI-powered search..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium"
          >
            AI Search
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        {(showBookmarks || showHistory) && (
          <div className="w-64 bg-gray-900 border-r border-gray-800 p-4 overflow-y-auto">
            {showBookmarks && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Bookmarks
                </h3>
                {bookmarks.length === 0 ? (
                  <p className="text-gray-400">No bookmarks yet</p>
                ) : (
                  <div className="space-y-2">
                    {bookmarks.map(bookmark => (
                      <div
                        key={bookmark.id}
                        onClick={() => handleNavigate(bookmark.url)}
                        className="p-2 bg-gray-800 rounded hover:bg-gray-700 cursor-pointer flex items-center gap-2"
                      >
                        <img src={bookmark.favicon} alt="" className="h-4 w-4" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{bookmark.title}</p>
                          <p className="text-xs text-gray-400 truncate">{bookmark.url}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {showHistory && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <History className="h-5 w-5" />
                  History
                </h3>
                {history.length === 0 ? (
                  <p className="text-gray-400">No history yet</p>
                ) : (
                  <div className="space-y-2">
                    {history.map(item => (
                      <div
                        key={item.id}
                        onClick={() => handleNavigate(item.url)}
                        className="p-2 bg-gray-800 rounded hover:bg-gray-700 cursor-pointer"
                      >
                        <p className="text-sm truncate">{item.title}</p>
                        <p className="text-xs text-gray-400">{new Date(item.timestamp).toLocaleTimeString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Browser Content */}
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-sm text-gray-400">Loading...</p>
              </div>
            </div>
          )}
          
          {showAISummary && (
            <div className="absolute top-4 right-4 w-80 bg-gray-900 border border-gray-800 rounded-lg p-4 z-10 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  AI Summary
                </h3>
                <button 
                  onClick={() => setShowAISummary(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-300">{aiSummary}</p>
            </div>
          )}
          
          <iframe
            ref={iframeRef}
            src={url}
            onLoad={handleIframeLoad}
            className="w-full h-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            title="Browser Content"
          />
        </div>
      </div>
      
      {/* Status Bar */}
      <footer className="bg-gray-900 border-t border-gray-800 px-4 py-1 text-xs text-gray-400">
        <div className="flex justify-between items-center">
          <span>{currentTitle}</span>
          <span>{url}</span>
          <span>🔒 Secure Connection</span>
        </div>
      </footer>
    </div>
  );
}

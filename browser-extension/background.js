// Background service worker for Astranova Browser Extension
let aiApiKey = null;

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Astranova Extension installed');
  
  // Set default settings
  chrome.storage.sync.set({
    aiEnabled: true,
    autoSummarize: false,
    web3Enabled: true
  });
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'summarizePage':
      summarizePage(sender.tab.id, sendResponse);
      return true; // Keep message channel open for async response
      
    case 'analyzeContent':
      analyzeContent(sender.tab.id, sendResponse);
      return true;
      
    case 'getWalletBalance':
      getWalletBalance(request.address, request.network, sendResponse);
      return true;
      
    case 'setApiKey':
      aiApiKey = request.apiKey;
      chrome.storage.sync.set({ aiApiKey });
      sendResponse({ success: true });
      break;
      
    case 'getApiKey':
      chrome.storage.sync.get(['aiApiKey'], (result) => {
        aiApiKey = result.aiApiKey;
        sendResponse({ apiKey: aiApiKey });
      });
      return true;
  }
});

// AI-powered page summarization
async function summarizePage(tabId, sendResponse) {
  try {
    // Get page content
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Inject content script to get page text
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      function: getPageContent
    });
    
    const pageContent = results[0].result;
    
    if (!aiApiKey) {
      sendResponse({ error: 'OpenAI API key not set' });
      return;
    }
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Summarize the following web page content in 3-4 bullet points. Focus on the key information and main points.'
          },
          {
            role: 'user',
            content: pageContent.substring(0, 4000) // Limit content length
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      const summary = data.choices[0].message.content;
      
      sendResponse({ 
        summary: summary,
        title: tab.title,
        url: tab.url
      });
    } else {
      sendResponse({ error: 'Failed to generate summary' });
    }
    
  } catch (error) {
    console.error('Summarization error:', error);
    sendResponse({ error: error.message });
  }
}

// Content analysis
async function analyzeContent(tabId, sendResponse) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      function: analyzePageStructure
    });
    
    const analysis = results[0].result;
    sendResponse(analysis);
    
  } catch (error) {
    console.error('Analysis error:', error);
    sendResponse({ error: error.message });
  }
}

// Web3 wallet balance check
async function getWalletBalance(address, network, sendResponse) {
  try {
    let rpcUrl, balance;
    
    if (network === 'ethereum') {
      rpcUrl = 'https://mainnet.infura.io/v3/demo';
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [address, 'latest'],
          id: 1
        })
      });
      
      const data = await response.json();
      const balanceWei = parseInt(data.result, 16);
      balance = (balanceWei / 1e18).toFixed(6) + ' ETH';
      
    } else if (network === 'solana') {
      rpcUrl = 'https://api.mainnet-beta.solana.com';
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [address]
        })
      });
      
      const data = await response.json();
      const balanceLamports = data.result.value;
      balance = (balanceLamports / 1e9).toFixed(6) + ' SOL';
    }
    
    sendResponse({ balance, network });
    
  } catch (error) {
    console.error('Balance check error:', error);
    sendResponse({ error: error.message });
  }
}

// Content script functions
function getPageContent() {
  // Get main content from page
  const content = document.body.innerText || '';
  const title = document.title;
  const url = window.location.href;
  
  return {
    title,
    url,
    content: content.substring(0, 5000) // Limit length
  };
}

function analyzePageStructure() {
  const analysis = {
    title: document.title,
    url: window.location.href,
    wordCount: document.body.innerText.length,
    links: document.links.length,
    images: document.images.length,
    headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
    hasForms: document.forms.length > 0,
    hasVideos: document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]').length > 0,
    language: document.documentElement.lang || 'unknown',
    lastModified: document.lastModified
  };
  
  return analysis;
}

// Context menu integration
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'summarizePage',
    title: 'Summarize with AI',
    contexts: ['page', 'selection']
  });
  
  chrome.contextMenus.create({
    id: 'analyzeContent',
    title: 'Analyze Content',
    contexts: ['page']
  });
  
  chrome.contextMenus.create({
    id: 'web3Check',
    title: 'Check Wallet Balance',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case 'summarizePage':
      summarizePage(tab.id, (response) => {
        if (response.summary) {
          showNotification('Page Summary', response.summary);
        }
      });
      break;
      
    case 'analyzeContent':
      analyzeContent(tab.id, (response) => {
        if (!response.error) {
          showNotification('Content Analysis', `Words: ${response.wordCount}, Links: ${response.links}, Images: ${response.images}`);
        }
      });
      break;
      
    case 'web3Check':
      const selectedText = info.selectionText.trim();
      if (selectedText.match(/^(0x[a-fA-F0-9]{40}|[1-9A-HJ-NP-Za-km-z]{32,44})$/)) {
        // Check if it's an Ethereum or Solana address
        const network = selectedText.startsWith('0x') ? 'ethereum' : 'solana';
        getWalletBalance(selectedText, network, (response) => {
          if (response.balance) {
            showNotification('Wallet Balance', `${response.balance} on ${network}`);
          }
        });
      }
      break;
  }
});

// Show notification
function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/icon48.png'),
    title: title,
    message: message
  });
}

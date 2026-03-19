// Popup script for Astranova Browser Extension
document.addEventListener('DOMContentLoaded', function() {
  const apiKeyInput = document.getElementById('apiKey');
  const saveKeyBtn = document.getElementById('saveKey');
  const summarizeBtn = document.getElementById('summarizeBtn');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const web3Btn = document.getElementById('web3Btn');
  const openBrowserBtn = document.getElementById('openBrowser');
  const statusDiv = document.getElementById('status');
  
  // Load saved API key
  chrome.storage.sync.get(['aiApiKey'], function(result) {
    if (result.aiApiKey) {
      apiKeyInput.value = result.aiApiKey;
      updateStatus('API key loaded', 'success');
    }
  });
  
  // Save API key
  saveKeyBtn.addEventListener('click', function() {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      chrome.runtime.sendMessage({ 
        action: 'setApiKey', 
        apiKey: apiKey 
      }, function(response) {
        if (response.success) {
          updateStatus('API key saved successfully', 'success');
        } else {
          updateStatus('Failed to save API key', 'error');
        }
      });
    } else {
      updateStatus('Please enter a valid API key', 'error');
    }
  });
  
  // Summarize current page
  summarizeBtn.addEventListener('click', function() {
    updateStatus('Generating summary...', 'info');
    chrome.runtime.sendMessage({ action: 'summarizePage' }, function(response) {
      if (response.summary) {
        showSummaryModal(response);
        updateStatus('Summary generated successfully', 'success');
      } else {
        updateStatus(response.error || 'Failed to generate summary', 'error');
      }
    });
  });
  
  // Analyze current page
  analyzeBtn.addEventListener('click', function() {
    updateStatus('Analyzing content...', 'info');
    chrome.runtime.sendMessage({ action: 'analyzeContent' }, function(response) {
      if (!response.error) {
        showAnalysisModal(response);
        updateStatus('Content analysis complete', 'success');
      } else {
        updateStatus(response.error || 'Failed to analyze content', 'error');
      }
    });
  });
  
  // Web3 tools
  web3Btn.addEventListener('click', function() {
    showWeb3Modal();
  });
  
  // Open Astranova Browser
  openBrowserBtn.addEventListener('click', function() {
    chrome.tabs.create({ url: 'https://astranova-liard.vercel.app' });
    window.close();
  });
  
  // Helper functions
  function updateStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
  }
  
  function showSummaryModal(data) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      color: black;
      padding: 20px;
      border-radius: 8px;
      max-width: 300px;
      max-height: 200px;
      overflow-y: auto;
    `;
    
    content.innerHTML = `
      <h3 style="margin: 0 0 10px 0; color: #333;">📄 Page Summary</h3>
      <p style="margin: 0; line-height: 1.4; color: #666;">${data.summary}</p>
      <button style="
        margin-top: 15px;
        padding: 8px 16px;
        background: #007AFF;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      ">Close</button>
    `;
    
    content.querySelector('button').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.appendChild(content);
    document.body.appendChild(modal);
  }
  
  function showAnalysisModal(data) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      color: black;
      padding: 20px;
      border-radius: 8px;
      max-width: 300px;
    `;
    
    content.innerHTML = `
      <h3 style="margin: 0 0 10px 0; color: #333;">🔍 Content Analysis</h3>
      <div style="color: #666; font-size: 14px;">
        <p><strong>Title:</strong> ${data.title}</p>
        <p><strong>Words:</strong> ${data.wordCount.toLocaleString()}</p>
        <p><strong>Links:</strong> ${data.links}</p>
        <p><strong>Images:</strong> ${data.images}</p>
        <p><strong>Headings:</strong> ${data.headings}</p>
        <p><strong>Has Forms:</strong> ${data.hasForms ? 'Yes' : 'No'}</p>
        <p><strong>Has Videos:</strong> ${data.hasVideos ? 'Yes' : 'No'}</p>
        <p><strong>Language:</strong> ${data.language}</p>
      </div>
      <button style="
        margin-top: 15px;
        padding: 8px 16px;
        background: #007AFF;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      ">Close</button>
    `;
    
    content.querySelector('button').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.appendChild(content);
    document.body.appendChild(modal);
  }
  
  function showWeb3Modal() {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      color: black;
      padding: 20px;
      border-radius: 8px;
      max-width: 300px;
    `;
    
    content.innerHTML = `
      <h3 style="margin: 0 0 15px 0; color: #333;">💎 Web3 Wallet Checker</h3>
      <input 
        type="text" 
        id="walletAddress" 
        placeholder="Enter wallet address (0x... or Solana)"
        style="
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 10px;
          font-size: 12px;
        "
      />
      <div style="display: flex; gap: 8px; margin-bottom: 10px;">
        <button id="checkEth" style="
          flex: 1;
          padding: 8px;
          background: #627EEA;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        ">Check ETH</button>
        <button id="checkSol" style="
          flex: 1;
          padding: 8px;
          background: #00D4AA;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        ">Check SOL</button>
      </div>
      <div id="walletResult" style="
        font-size: 12px;
        color: #666;
        margin-bottom: 10px;
        min-height: 20px;
      "></div>
      <button id="closeWeb3" style="
        padding: 8px 16px;
        background: #007AFF;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      ">Close</button>
    `;
    
    const walletInput = content.querySelector('#walletAddress');
    const ethBtn = content.querySelector('#checkEth');
    const solBtn = content.querySelector('#checkSol');
    const resultDiv = content.querySelector('#walletResult');
    const closeBtn = content.querySelector('#closeWeb3');
    
    const checkBalance = (network) => {
      const address = walletInput.value.trim();
      if (!address) {
        resultDiv.textContent = 'Please enter a wallet address';
        return;
      }
      
      resultDiv.textContent = 'Checking balance...';
      
      chrome.runtime.sendMessage({ 
        action: 'getWalletBalance', 
        address: address, 
        network: network 
      }, function(response) {
        if (response.balance) {
          resultDiv.textContent = `Balance: ${response.balance}`;
          resultDiv.style.color = '#4CAF50';
        } else {
          resultDiv.textContent = response.error || 'Failed to check balance';
          resultDiv.style.color = '#F44336';
        }
      });
    };
    
    ethBtn.addEventListener('click', () => checkBalance('ethereum'));
    solBtn.addEventListener('click', () => checkBalance('solana'));
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.appendChild(content);
    document.body.appendChild(modal);
  }
});

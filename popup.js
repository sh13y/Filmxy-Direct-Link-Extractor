let currentImdbCode = '';

// Load the last entered IMDb code when the popup is opened
document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get(['lastImdbCode'], function(result) {
    if (result.lastImdbCode) {
      document.getElementById('imdbCode').value = result.lastImdbCode;
    }
  });
});

function showStatus(message, type = 'success') {
  const statusEl = document.getElementById('statusMessage');
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;
  setTimeout(() => {
    statusEl.className = 'status-message';
  }, 3000);
}

function setLoading(isLoading) {
  document.body.classList.toggle('loading', isLoading);
}

document.getElementById('searchButton').addEventListener('click', async function() {
  currentImdbCode = document.getElementById('imdbCode').value.trim();
  if (!currentImdbCode) {
    showStatus('Please enter an IMDb code', 'error');
    return;
  }

  if (!currentImdbCode.startsWith('tt')) {
    showStatus('Invalid IMDb code format. Should start with "tt"', 'error');
    return;
  }

  setLoading(true);
  try {
    await chrome.storage.local.set({ lastImdbCode: currentImdbCode });
    const url = `https://www.filmxy.vip/dp/${currentImdbCode}/`;
    await chrome.tabs.create({ url: url });
    showStatus('Page opened successfully');
  } catch (error) {
    showStatus('Error opening page: ' + error.message, 'error');
  } finally {
    setLoading(false);
  }
});

function addLinkToUI(link, tabId) {
  const linkList = document.getElementById('linkList');
  const listItem = document.createElement('li');
  listItem.textContent = link;
  listItem.addEventListener('click', function() {
    navigator.clipboard.writeText(link).then(() => {
      alert('Link copied to clipboard!');
      // Stop the page loading and reload the original IMDb page
      if (currentImdbCode) {
        chrome.tabs.update(tabId, { url: `https://www.filmxy.vip/dp/${currentImdbCode}/` });
      }
    });
  });
  linkList.appendChild(listItem);
}

document.getElementById('copyAllButton').addEventListener('click', function() {
  const linkList = document.getElementById('linkList');
  const links = Array.from(linkList.children).map(li => li.textContent).join('\n');
  navigator.clipboard.writeText(links).then(() => {
    alert('All links copied to clipboard!');
    // Reload the original IMDb page for all links
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const currentTab = tabs[0];
      if (currentImdbCode) {
        chrome.tabs.update(currentTab.id, { url: `https://www.filmxy.vip/dp/${currentImdbCode}/` });
      }
    });
  });
});

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'addLink') {
    const { link } = request;
    addLinkToUI(link, sender.tab.id);
  }
});

// Example function to determine quality (you need to implement this logic)
function determineQuality(link) {
  // Implement logic to determine if the link is 1080p or 720p
  // For example, based on some pattern in the URL or metadata
  return '1080'; // or '720'
} 
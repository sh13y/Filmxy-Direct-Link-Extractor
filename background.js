let currentImdbCode = ''; // Store the current IMDb code globally

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    const url = new URL(details.url);
    const tusdriveUrl = url.searchParams.get('url');
    if (tusdriveUrl) {
      // Use a content script to extract movie name and quality
      chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        function: extractMovieInfo,
        args: [tusdriveUrl]
      }).then(() => {
        console.log('Script executed successfully');
      }).catch((error) => {
        console.error('Error executing script:', error);
      });
    }
  },
  { urls: ["*://exe.io/*"] }
);

function extractMovieInfo(tusdriveUrl) {
  const movieNameElement = document.querySelector('h2');
  const movieName = movieNameElement ? movieNameElement.textContent : 'Unknown Movie';
  
  const qualityElement = document.querySelector('a[href*="' + tusdriveUrl + '"]');
  const qualityText = qualityElement ? qualityElement.textContent : '';
  const quality = qualityText.includes('1080p') ? '1080' : '720';

  chrome.runtime.sendMessage({
    action: 'addLink',
    link: tusdriveUrl,
    quality: quality
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error sending message:', chrome.runtime.lastError);
    } else {
      console.log('Message sent successfully:', response);
    }
  });
}

// Listen for messages to update the current IMDb code
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'setImdbCode') {
    currentImdbCode = request.imdbCode;
    sendResponse({ status: 'success' });
  }
}); 


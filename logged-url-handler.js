// Load saved URLs on startup
chrome.runtime.onStartup.addListener(() => {
    logUrl('## New Session Started at ' + new Date().toLocaleString());
});

// When the active tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (chrome.runtime.lastError) return;
        console.log('Tab activated:', tab.url);
        logUrl(tab.url);
    });
});

// When a tab finishes loading
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        chrome.tabs.get(tabId, (t) => {
            if (chrome.runtime.lastError) return;
            console.log('Updated tab:', t.url);
            logUrl(t.url);
        });
    }
});

// When window focus changes
chrome.windows.onFocusChanged.addListener((windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) return;
    chrome.tabs.query({ active: true, windowId: windowId }, (tabs) => {
        if (!tabs || !tabs.length) return;
        console.log('Window changed - Focused tab:', tabs[0].url);
        logUrl(tabs[0].url);
    });
});

// Helper function to load logged URLs from storage
function fetchLoggedUrls() {
  return new Promise((resolve) => {
    chrome.storage.local.get('loggedUrls', (data) => {
      resolve(data.loggedUrls || []);
    });
  });
}

function clearUrls() { // overwrites the stored URLs
    chrome.storage.local.set({ loggedUrls: [] });
}

// Helper to log a URL (only if it's non-empty and not the same as the last entry)
async function logUrl(url) {
    const loggedUrls = await fetchLoggedUrls();
    const last_logged_url = loggedUrls.length ? loggedUrls[loggedUrls.length - 1] : null;

    // Validate the URL
    if (!url || typeof url !== 'string') return;
    if (url === last_logged_url) return; // avoid duplicates

    chrome.storage.local.set({ loggedUrls: [...loggedUrls, url] });
    console.log('[URL Logger] logged:', url);
}
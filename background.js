// background.js
// Service worker that listens for active tab changes and tab updates,
// stores URLs in persistent storage (chrome.storage.local),
// and responds to messages from the popup.




// Handle messages from popup.js
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (!message || !message.type) return;


    if (message.type === 'clearUrls') {
        console.log('[URL Logger] Cleared all URLs');
        clearUrls(); // clear stored URLs
        sendResponse({ success: true });
        return true;
    }

    if (message.type === 'analyzeUrls') {
        const url_connections = analyzeUrls(await fetchLoggedUrls());
        export_list(url_connections, 'url_connections.json');
        console.log(JSON.stringify(url_connections, null, 2));
        sendResponse({ success: true });
        return true;

    }
    if (message.type === 'exportUrls') {
        export_list(await fetchLoggedUrls(), 'visited_urls.json');
        sendResponse({ success: true });
        return true;
    }
});



function analyzeUrls(urls) {
    if (urls.length === 0) {
        console.log('No URLs to analyze.');
        return;
    }
    // exlude specific URLs

    // clean URLs



    // Example usage
    const url_connections = buildUrlConnections(urls);
    console.log("URL Connections:", url_connections);

    // Example usage:
    const groups = groupUrlsByConnections(url_connections, 5);
    console.log("URL Groups:", groups);

    return url_connections;
}


// Build weighted connections between logged URLs
function buildUrlConnections(loggedUrls) {
    const connectionMap = new Map();

    // Helper to add a connection with a given weigh, or add weight to already created connection
    function addConnection(a, b, weight) {
        const connection = [a, b].sort();
        const key = connection.join('||');
        if (!connectionMap.has(key)) {
            connectionMap.set(key, { connection, weight: 0 });
        }
        connectionMap.get(key).weight += weight;
    }

    // Adjacent connections (weight = 3)
    for (let i = 1; i < loggedUrls.length; i++) {
        addConnection(loggedUrls[i - 1], loggedUrls[i], 3);
    }

    // Skip-one connections (weight = 1)
    for (let i = 2; i < loggedUrls.length; i++) {
        addConnection(loggedUrls[i - 2], loggedUrls[i], 1);
    }

    return Array.from(connectionMap.values());
}

function groupUrlsByConnections(url_connections, minWeight = 2) {
  const adjacency = new Map();

  // Build adjacency list with weights
  for (const { connection, weight } of url_connections) {
    const [a, b] = connection;
    if (!adjacency.has(a)) adjacency.set(a, new Map());
    if (!adjacency.has(b)) adjacency.set(b, new Map());

    adjacency.get(a).set(b, (adjacency.get(a).get(b) || 0) + weight);
    adjacency.get(b).set(a, (adjacency.get(b).get(a) || 0) + weight);
  }

  const groups = [];

  // For each URL, make a group of itself + strong neighbors
  for (const [url, neighbors] of adjacency.entries()) {
    const strongNeighbors = Array.from(neighbors.entries())
      .filter(([_, w]) => w >= minWeight)   // keep only strong connections
      .sort((a, b) => b[1] - a[1])          // sort by weight
      .map(([neighbor]) => neighbor);

    if (strongNeighbors.length > 0) {
      groups.push([url, ...strongNeighbors]);
    }
  }

  return groups;
}

function export_list(list, filename) {
    console.log('Exporting URLs:', list);
    const blob = new Blob([JSON.stringify(list, null, 4)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    browser.downloads.download({
        url,
        filename: filename,
        saveAs: true
    });
}
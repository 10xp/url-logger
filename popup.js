// popup.js
// Sends a message to background.js to clear the log.


const clearBtn = document.getElementById('clear');
const analyzeBtn = document.getElementById('analyze');
const exportBtn = document.getElementById('export_log');

clearBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'clearUrls' }, (response) => {
        if (chrome.runtime.lastError) {
            console.log('Error: ' + chrome.runtime.lastError.message);
            return;
        }
        if (response && response.success) {
            console.log('Log cleared!');
        }
    });
});
analyzeBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'analyzeUrls' }, (response) => {
        if (chrome.runtime.lastError) {
            console.log('Error: ' + chrome.runtime.lastError.message);
            return;
        }
        if (response && response.success) {
            console.log('Analysing Data!');
        }
    });
});
exportBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'exportUrls' }, (response) => {
        if (chrome.runtime.lastError) {
            console.log('Error: ' + chrome.runtime.lastError.message);
            return;
        }
        if (response && response.success) {
            console.log('Log exported!');
        }
    });
});
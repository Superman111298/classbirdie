chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'captureVisibleArea') {
        chrome.tabs.captureVisibleTab(null, {format: 'png'}, (dataUrl) => {
            chrome.tabs.sendMessage(sender.tab.id, {
                action: 'processCapturedImage',
                dataUrl: dataUrl,
                startX: request.startX,
                startY: request.startY,
                width: request.width,
                height: request.height
            });
        });
    }

    if (request.action === 'getTabUrl') {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        let activeTab = tabs[0];
        sendResponse({ url: activeTab.url });
      });
      return true; // Keeps the message channel open for sendResponse
    }
});


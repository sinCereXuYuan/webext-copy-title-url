
const REQUEST_TITLE = 'copy-title-url-to-clipboard';
const REQUEST_SELECTION = 'copy-selection-url-to-clipboard';

// Create context menus on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: REQUEST_TITLE,
    title: "Copy Page Title and Url",
    contexts: ["page"]
  });
  chrome.contextMenus.create({
    id: REQUEST_SELECTION,
    title: "Copy Selection and Url",
    contexts: ["selection"]
  });
});

// Safe sendMessage wrapper with injection
async function sendMessageToTab(tabId, message) {
  try {
    // Ensure content.js is injected
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["content.js"]
    });
  } catch (e) {
    // If already injected or tab is restricted (chrome:// etc.), ignore
    console.debug("Injection skipped:", e.message);
  }

  // Now try to send the message
  chrome.tabs.sendMessage(tabId, message, () => {
    if (chrome.runtime.lastError) {
      console.debug("No receiver in tab:", chrome.runtime.lastError.message);
    }
  });
}

// Context menu handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const useSelection = info.menuItemId === REQUEST_SELECTION;
  sendMessageToTab(tab.id, {
    tabUrl: tab.url,
    tabTitle: tab.title,
    useSelection: useSelection
  });
});

// Keyboard shortcut handler
chrome.commands.onCommand.addListener(async command => {
  if (command === 'copy-selection-and-url') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      sendMessageToTab(tab.id, {
        tabUrl: tab.url,
        tabTitle: tab.title,
        useSelection: true
      });
    }
  }
});



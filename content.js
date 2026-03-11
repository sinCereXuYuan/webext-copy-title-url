let modKeyDown = false;

chrome.runtime.onMessage.addListener(async (request, sender) => {
  const forceTitle = modKeyDown;
  let clipboardData = `[${request.tabTitle}](${request.tabUrl})`;

  if (request.useSelection) {
    const selection = window.getSelection();
    const contents = selection.getRangeAt(0).cloneContents();
    const node = document.createElement("div");
    node.appendChild(contents.cloneNode(true));

    let selectedText = "";
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.nodeType === Node.TEXT_NODE) {
        selectedText += node.textContent.replace(/(\s+)/, ' ').replace(/\n/g, " ");
      } else if (node.nodeName === 'IMG') {
        selectedText += node.alt;
      }
    }
    selectedText = selectedText.trim();

    if (selectedText) {
      // Check if the URL starts with "https://grok.com"
      if (request.tabUrl.startsWith("https://grok.com")) {
        // Attempt to click the web share button
        const shareButton = document.querySelector('button[aria-label="Create share link"], button[aria-label="Update share link"]');
        let newUrl = request.tabUrl; // Fallback to original URL
        if (shareButton) {
          try {
            shareButton.click();
            console.log("Web share button clicked successfully.");
            // Wait briefly for the clipboard to be updated by the share button
            await new Promise(resolve => setTimeout(resolve, 500));
            // Read the new URL from the clipboard
            try {
              newUrl = await navigator.clipboard.readText();
              console.log("New URL read from clipboard: " + newUrl);
            } catch (err) {
              console.log("Failed to read clipboard for new URL: " + err.message);
            }
          } catch (err) {
            console.log("Failed to click web share button: " + err.message);
          }
        } else {
          console.log("Web share button not found on the page.");
        }
        clipboardData = `(grok) [${selectedText}](${newUrl})`;
      } else {
        clipboardData = `[${selectedText}](${request.tabUrl})`;
      }
      if (forceTitle) {
        clipboardData = `[${request.tabTitle}](${clipboardData})`;
      }
      clipboardData += " ";
    }
  }

  let selectionRange = null;
  if (request.useSelection) {
    selectionRange = saveSelection();
  }

  await copyToClipboard(clipboardData);

  if (selectionRange) {
    restoreSelection(selectionRange);
  }
});

async function copyToClipboard(data) {
  try {
    await navigator.clipboard.writeText(data);
    console.log("Clipboard write successful: " + data);
  } catch (err) {
    console.error("Clipboard write failed", err);
    console.log("Clipboard write failed: " + err.message);
  }
}

document.addEventListener('keydown', event => {
  modKeyDown = (event.shiftKey || event.ctrlKey);
});

document.addEventListener('keyup', event => {
  modKeyDown = false;
});

function saveSelection() {
  if (window.getSelection) {
    const sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      return sel.getRangeAt(0);
    }
  }
  return null;
}

function restoreSelection(range) {
  if (range) {
    if (window.getSelection) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
}
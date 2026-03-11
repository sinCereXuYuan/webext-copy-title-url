# Chrome extension: Copy selection and automatically append URL to clipboard


## How to use

* select text 
* Alt+C or right click for a new item in the context menu: "Copy selection and url"
* text in the format of "`[selected text](url)`" will be copied to the clipboard. 


## Version history

2.0:
- Rewritten for compatibility with Chrome manifest version 3. 

1.3:
- Rewritten for compatibility with Chrome. Now the same code can be used to generate the extension for both browsers.
- Added support for Ctrl key in addition to Shift key (due to an apparent bug in Chrome, which modifies selection range on Shift+right click)

1.2:
- Initial release, Firefox only

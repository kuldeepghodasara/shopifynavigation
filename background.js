/**
 * @filedescription Initializes the extension's background page.
 */

// background.js

// Wrap in an onInstalled callback in order to avoid unnecessary work
// every time the background script is run
chrome.runtime.onInstalled.addListener(() => {
  // Page actions are disabled by default and enabled on select tabs
  chrome.action.disable();

  // Clear all rules to ensure only our expected rules are set
  chrome.declarativeContent.onPageChanged.removeRules(undefined, async () => {
    // Declare a rule to enable the action on Shopify navigation pages.
    let navigationRule = {
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { urlMatches: '\/admin\/menus*|\/store\/.*\/menus*' },
        })
      ],
      actions: [
        new chrome.declarativeContent.SetIcon({
          imageData: {
            128: await loadImageData('icon.png'),
          },
        }),
        chrome.declarativeContent.ShowAction
          ? new chrome.declarativeContent.ShowAction()
          : new chrome.declarativeContent.ShowPageAction(),
      ],
    };

    // Finally, apply our new array of rules
    let rules = [navigationRule];
    chrome.declarativeContent.onPageChanged.addRules(rules);
  });
});

async function loadImageData(url) {
  const img = await createImageBitmap(await (await fetch(url)).blob());
  const {width: w, height: h} = img;
  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}
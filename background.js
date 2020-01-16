const delay = (ms) => {
  const startPoint = new Date().getTime()
  while (new Date().getTime() - startPoint <= ms) {/* wait */}
}

let handler;
chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (changes.hasOwnProperty('requestThrottler')) {
    const throttlerConfig = changes.requestThrottler.newValue;
    if (handler) {
      chrome.webRequest.onBeforeRequest.removeListener(handler);
      handler = null;
    }

    const urls = throttlerConfig.urls.filter((u) => !u.error && u.url !== '').map((u) => u.url.trim());
    if (throttlerConfig.enabled && urls.length > 0) {
      chrome.browserAction.setIcon({path: 'icon48-warning.png'});
      handler = (info) => {
        console.log("Intercepted: " + info.url);
        delay(throttlerConfig.delay);
        console.log('returned');
        return;
      };
      console.log('Blocking urls', urls);
      chrome.webRequest.onBeforeRequest.addListener(
        handler,
        // filters
        {
          urls: urls,
        },
        // extraInfoSpec
        ["blocking"]
      );
    } else {
      chrome.browserAction.setIcon({path: 'icon48.png'});
    }
  }
});

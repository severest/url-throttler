const delay = (ms) => {
  const startPoint = new Date().getTime()
  while (new Date().getTime() - startPoint <= ms) {/* wait */}
}

function matchRuleShort(str, rule) {
  return new RegExp(str.replace(/\*/g, "[^ ]*")).test(rule);
}

let handler;
chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (changes.hasOwnProperty('requestThrottler')) {
    const throttlerConfig = changes.requestThrottler.newValue;
    if (handler) {
      chrome.webRequest.onBeforeRequest.removeListener(handler);
      handler = null;
    }
    
    const urls = throttlerConfig.urls.filter((u) => !u.error && u.url !== '' && u.checked).map((u) => u.url.trim());

    if (throttlerConfig.enabled && urls.length > 0) {
      chrome.browserAction.setIcon({path: 'icon48-warning.png'});
      handler = (info) => {
        //ex: {checked: true, delay: '10000', error: false, url: 'https://stackoverflow.com/tags'}
        const thisUrlConfig = throttlerConfig.urls.filter((item) => item.checked && matchRuleShort(item.url, info.url))[0];
		
        if(thisUrlConfig && thisUrlConfig.checked) {
          const thisUrlDelay = thisUrlConfig.delay || throttlerConfig.defaultDelay;
          console.log(`URL Throttler: Intercepted ${info.url}, going to wait ${thisUrlDelay} ms...`);
          delay(thisUrlDelay);
          console.log('URL Throttler: Done');
        }
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

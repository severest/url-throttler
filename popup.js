const defaultURL = {
  url: '',
  error: false,
};
const urlRegex = /^(https?|\*):\/\/.*\/.*$/;
var lastChangeTarget;
let fadeOut = (target) => setInterval(function () {
  if (target.style.opacity > 0) {
    target.style.opacity -= 0.1;
  } else {
      clearInterval(fadeEffect);
      target.innerHTML = "";
  }
}, 250);

chrome.storage.local.get(['requestThrottler'], (result) => {
  const data = Object.assign(
    {}, {
      enabled: false,
      urls: [{ ...defaultURL }],
      defaultDelay: 2000,
    },
    result.requestThrottler
  );
  var app = new Vue({
    el: '#app',
    data: data,
    methods: {
      applyConfig: function() {
        let newConfig = prompt('Please input new config (it should appear in JSON format as in example below), or leave as {} to reset.\n\n{"defaultDelay":"5000","enabled":true,"urls":[{"checked":true,"error":false,"url":"*://*/api/foo"},{"checked":true,"delay":"2000","error":false,"url":"https://joecoyle.net/api/bar"}]}\n', "{}");
        try {
          chrome.storage.local.set({'requestThrottler': JSON.parse(newConfig)}, function() {
            location.reload();
          });
        } catch {
          alert("Error applying config. Is your JSON formatting correct?");
        }
      },
      copyCurrentConfig: function() {
        chrome.storage.local.get((config) => {
          navigator.clipboard.writeText(JSON.stringify(config["requestThrottler"]));
          lastChangeTarget = document.getElementById("messageDisplay");
          lastChangeTarget.innerHTML = "Configuration copied to clipboard";
          lastChangeTarget.style.opacity = 1;
          fadeOut(lastChangeTarget);
        });
      },
      addUrlInput: function() {
        this.urls = this.urls.concat({ ...defaultURL });
      },
      removeUrlInput: function(index) {
        this.urls.splice(index, 1);
      },
      updateStorage: function(newStorage) {
        chrome.storage.local.set(newStorage);
      }
    },
    updated: _.debounce(function() {
      chrome.storage.local.get((currStorage) => {
        var newStorage = {requestThrottler: {
          defaultDelay: this.defaultDelay,
          enabled: this.enabled,
          urls: this.urls,
        }};

        if(JSON.stringify(currStorage) != JSON.stringify(newStorage)) {
          this.updateStorage(newStorage);
          
          lastChangeTarget = document.getElementById("messageDisplay");
          lastChangeTarget.innerHTML = "Changes saved @ " + (new Date).toLocaleTimeString();
          lastChangeTarget.style.opacity = 1;
          fadeOut(lastChangeTarget);
        }
      });
    }, 700)
  });
});

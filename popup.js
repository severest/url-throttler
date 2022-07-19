const defaultURL = {
  url: '',
  error: false,
};
const urlRegex = /^(https?|\*):\/\/.*\/.*$/;
var lastChangeTarget;
var fadeEffect;

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
          
          lastChangeTarget = document.getElementById("lastChangeTime");
          lastChangeTarget.innerHTML = "Changes saved @ " + (new Date).toLocaleTimeString();
          lastChangeTarget.style.opacity = 1;
          
          fadeEffect = setInterval(function () {
            if (lastChangeTarget.style.opacity > 0) {
              lastChangeTarget.style.opacity -= 0.1;
            } else {
                clearInterval(fadeEffect);
                lastChangeTarget.innerHTML = "";
            }
          }, 250);
        }
      });
    }, 700)
  });
});

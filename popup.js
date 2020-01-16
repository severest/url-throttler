const defaultURL = {
  url: '',
  error: false,
};
const urlRegex = /^(https?|\*):\/\/.*\/.*$/;

chrome.storage.local.get(['requestThrottler'], (result) => {
  const data = Object.assign(
    {}, {
      enabled: false,
      urls: [{ ...defaultURL }],
      delay: 5000,
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
      updateStorage: _.debounce(function() {
        this.urls = this.urls.map((u) => {
          return {
            ...u,
            error: !urlRegex.test(u.url),
          };
        });
        chrome.storage.local.set({requestThrottler: {
          enabled: this.enabled,
          urls: this.urls,
          delay: this.delay,
        }});
      }, 700),
    },
    updated: function() {
      this.updateStorage();
    }
  });
});

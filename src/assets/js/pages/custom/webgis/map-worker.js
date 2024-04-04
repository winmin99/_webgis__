'use strict';

self.onmessage = function (message) {
  fetch(message.data)
    .then(function (response) {
      if (response.ok) {
        return response.text();
      }
    })
    .then(function (result) {
      self.postMessage(result);
    });
};

self.onmessage = function (event) {
  onFetch(event.data);
};

function onFetch(request) {
  const mediaType = request.get('mediaType');
  const payload = request.get('payload');
  return fetch(`${request.get('baseUrl')}/${request.get('url')}`, {
    headers: {
      'Content-Type': 'application/json',
      'CSRF-Token': request.get('csrf')
    },
    method: payload ? 'POST' : 'GET',
    body: JSON.stringify(payload)
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      // Note: The Body functions can be run only once; subsequent calls will resolve with empty strings/ArrayBuffers
      return response.json();
    })
    .then(function (result) {
      switch (mediaType) {
        case 'image/jpg':
          for (let i = 0, len = result.length; i < len; i++) {
            if (result[i][payload.table.image] === null) {
              continue;
            }
            const buffer = result[i][payload.table.image].data;
            const uint8Array = new Uint8Array(buffer);
            const blob = new Blob([uint8Array], { type: mediaType });
            result[i][payload.table.image] = URL.createObjectURL(blob);
          }
          return result;
        default:
          return result;
      }
    })
    .then(function (result) {
      postMessage(result);
    })
    .catch(function (error) {
      postMessage(null);
    })
    .finally(function () {
      request = null;
    });
}

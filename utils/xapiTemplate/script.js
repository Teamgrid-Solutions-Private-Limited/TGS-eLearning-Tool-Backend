 
(function () {
  const endpoint  = window.localStorage.getItem('xapiEndpoint');
  const authToken = window.localStorage.getItem('xapiAuth');

  if (!endpoint || !authToken) {
    document.getElementById('status').textContent =
      'xAPI endpoint not configured (check LRS settings).';
    return;
  }

  const conf = {
    endpoint,
    auth: authToken
  };
  const ADL = new TinCan(conf);

  
  ADL.sendStatement({
    actor:  { mbox: 'mailto:anonymous@example.com', name: 'Anonymous' },
    verb:   { id: 'http://adlnet.gov/expapi/verbs/launched', display: { 'en-US': 'launched' } },
    object: { id: window.location.href, definition: { name: { 'en-US': document.title } } }
  });
})();

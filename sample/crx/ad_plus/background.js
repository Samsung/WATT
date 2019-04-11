chrome.runtime.onConnect.addListener(function(port) {
  chrome.pageAction.onClicked.addListener(function(tab) {
    console.log('Send page action from background to contentscript!')
    port.postMessage({page_action: 'execute'})
  })
})

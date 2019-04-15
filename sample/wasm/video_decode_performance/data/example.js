function moduleDidLoad() {
  if (common.naclModule.getAttribute('path').indexOf('emscripten') != -1)
    document.getElementById('header').innerText += ' (WebAssembly)'
  else
    document.getElementById('header').innerText += ' (NaCl)'
}

// Handle a message coming from the NaCl module.
function handleMessage(message_event) {
  document.getElementById('res').innerText = message_event.data;
}

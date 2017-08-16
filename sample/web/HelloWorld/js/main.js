var Module = {
  preRun: [],
  postRun: [],
  print: (function() {
    var element = document.getElementById('output');
    if (element) element.value = ''; // clear browser cache
    return function(text) {
      if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
      console.log(text);
      if (element) {
        element.innerText += text + "\n";
      }
    };
  })(),
  printErr: function(text) {
    if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
    if (0) { // XXX disabled for safety typeof dump == 'function') {
      dump(text + '\n'); // fast, straight to the real console
    } else {
      document.getElementById('output').innerText = text;
      console.error(text);
    }
  },
  totalDependencies: 0,
};

var xhr = new XMLHttpRequest();
xhr.open('GET', 'wasm/HelloWorld.wasm', true);
xhr.responseType = 'arraybuffer';
xhr.onload = function() {
  Module.wasmBinary = xhr.response;

var script = document.createElement('script');
script.src = "js/HelloWorld.js";
document.body.appendChild(script);

};
xhr.send(null);


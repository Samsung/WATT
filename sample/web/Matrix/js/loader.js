var Module = {};

var xhr = new XMLHttpRequest();
xhr.open('GET', 'wasm/Matrix.wasm', true);
xhr.responseType = 'arraybuffer';
xhr.onload = function() {
    Module.wasmBinary = xhr.response;

    var script = document.createElement('script');
    script.src = "js/Matrix.js";
    document.body.appendChild(script);
};
xhr.send(null);

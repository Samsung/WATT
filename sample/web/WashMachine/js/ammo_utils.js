function instantiateAmmoLib(url) {
    // Helper function to fetch wasm file using XMLHttpRequest instead
    // of using fetch API due to WATT redirection issue.
    function fetchAmmoWasm(url) {
        return new Promise( (resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function() {
                // status 0 allows opening *local* file with allow-file-access-from-files
                // Chromium flag.
                if (xhr.status == 200 || xhr.status == 0)
                    resolve(new Uint8Array(xhr.response));
                else
                    reject(`Unable to fetch wasm file from ${url}`);
            }
            // Handles error for local file.
            xhr.onerror = function() {
                reject(`Unable to fetch wasm file from ${url}`);
            }
            xhr.send();
        });
    }

    var AmmoModule = {};

    function instantiateAmmo() {
        return new Promise( (resolve, reject) => {

            // This callback will be called once Ammo successfully finished all
            // its asynchronous operation (including WebAssembly.instantiate)
            AmmoModule.onRuntimeInitialized = function() {
                console.log("Ammo initialized");
                resolve(Ammo);
            }

            // Setting the path using |wasmBinaryFile| works fine with regular server
            // but does not work with WATT since the request is always
            // redirected to http://localhost:3000/. This results in failure while
            // wasm decoding.
            // To solve this issue we fetch the file on our own and pass binary data
            // using AmmoModule.wasmBinary.
            //
            // AmmoModule.wasmBinaryFile = url;

            var Ammo = AmmoLib(AmmoModule);

        });
    }

    return fetchAmmoWasm(url)
        .then(response => {
            console.log("Wasm flile fetched successfully.");
            AmmoModule.wasmBinary = response;
            return instantiateAmmo();
        })
        .catch(errorMessage => {
            return new Promise( ( resolve, reject) =>
                reject(errorMessage)
            )
        });
}

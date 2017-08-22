![](https://github.com/Samsung/WATT/blob/master/public/image/watt.png)
# WATT (Web Assembly Translation Toolkit)

WATT is server-based web assembly IDE.

If you want to contribute code, please check the [contribution guidelines](https://github.com/Samsung/WATT/blob/master/CONTRIBUTING.md).

## Prerequisites
* Install [Node](https://nodejs.org/en/download/) (>= v6.95 LTS Version)
  v6.9.5 is recommended because of v8-debug dependency.
* Install [MongoDB](https://www.mongodb.com/download-center?jmp=nav#community)
* Install [Emscripten](http://kripken.github.io/emscripten-site/docs/getting_started/downloads.html)

### Optional dependencies
1. Tizen SDK for building .wgt packages
    * Install [Tizen SDK](https://developer.tizen.org/development/tizen-studio/download)
    * Install Tizen SDK Native CLI development packages
        * For IDE Tizen SDK installer use Tizen Package Manager GUI and install `Native CLI` from `Tizen SDK tools`
        * For CLI Tizen SDK installer use `package-manager-cli.bin` in `TIZEN_SDK_PATH/package-manager`
        ```bash
        ./package-manager-cli.bin install NativeCLI
        ```
    * Add `tizen` CLI-tool to the system PATH in the terminal where you run WATT
    ```bash
    export PATH=$PATH:TIZEN_SDK_PATH/tools/ide/bin/
    ```

## Quick Start
* Getting the sources:
```bash
git clone https://github.com/Samsung/WATT.git
cd WATT
```

* Start the server:

WATT will run some internal executable files,

for this, WATT needs set paths of executable files on System Environment Variable(PATH).


If you don't start the server with launch, WATT could not provide full functionality.
```bash
./launch
```

## Tests
To run the test suite, first install the dependencies, then run npm test:
```bash
npm install
npm test
```

* Connect to the web server, the service is provided with port number 3000:
```bash
On browser, http://localhost:3000/
```

## License
Refer [WATT License](https://github.com/Samsung/WATT/wiki/License)

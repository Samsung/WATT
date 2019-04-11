![](https://github.com/Samsung/WATT/blob/master/public/image/watt.png)
# WATT (WebAssembly Translation Toolkit)
[![License](https://img.shields.io/badge/licence-Apache%202.0-brightgreen.svg?style=flat)](LICENSE)
[![Build Status](https://travis-ci.org/Samsung/WATT.svg?branch=master)](https://travis-ci.org/Samsung/WATT)

WATT is server-based WebAssembly IDE.

If you want to contribute code, please check the [contribution guidelines](https://github.com/Samsung/WATT/blob/master/CONTRIBUTING.md).

## Prerequisites
* Install [MongoDB](https://www.mongodb.com/download-center?jmp=nav#community)

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

## Developing Design Editor in WATT
* Design Editor is located in libs/tau-wysiwig
* After making DE changes launch WATT with bp option
```bash
./launch -bp
```
* After making changes on already running WATT:
```bash
# in WATT directory
cd libs/tau-wysiwig
npm install
npm run-script build-watt
```
* Always after making any DE changes in WATT console:
```bash
b
```

## Running WATT in docker container
Install docker-ce (not docker). Follow steps from https://docs.docker.com/install/linux/docker-ce/ubuntu/.
Recommended version is 18.06.1~ce~3-0~ubuntu. If you are using a newer one give it a try.

WATT along with mongodb images can be built and run by:
```bash
./docker-run.sh
```
Ensure 3000 port to be free. You should see logs on terminal:
```bash
watt_container_1   | Listening on port 3000
watt_container_1   | TAUComm started
mongo_container_1  | 2019-03-11T07:18:23.178+0000 I NETWORK  [thread1] connection accepted from 172.19.0.3:36916 #1 (1 connection now open)
```
Open localhost:3000 in Browser.

## Inspecting docker images.
WATT and mongodb images are composed together by docker-compose.yml. However, if you want to execute any command on particular image type:
```bash
docker run -it 5f142ecd12f5 bash
```
ImageId can be found from:
```bash
docker images
```

## License
Refer [WATT License](https://github.com/Samsung/WATT/wiki/License)

#!/bin/bash

if [ "$(uname)" == "Darwin" ]; then
EXEC_WHICH="/usr/bin/which"

COLOR_NC='\033[0m'
COLOR_LIGHT_GREEN='\033[1;32m'
COLOR_LIGHT_RED='\033[0;31m'
BOLD='\033[1m'
NO_FORMATTING='\033[0m'

elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
EXEC_WHICH="/bin/which"

COLOR_NC='\e[0m' # No Color
COLOR_LIGHT_GREEN='\e[1;32m'
COLOR_LIGHT_RED='\e[1;31m'
BOLD='\033[1m'
NO_FORMATTING='\033[0m'
fi

EXEC_NODE="node"
EXEC_NPM="npm"
EXEC_GRUNT="grunt"
NODE_VER=""
NPM_VER=""
NPM_OPTION=""
PACKAGE_NODE_ENGINE=""
PACKAGE_NODE_ENGINE_CLEANED=""

function version { echo "$@" | awk -F. '{ printf("%d%03d%03d%03d\n", $1,$2,$3,$4); }'; }

if [ -z `$EXEC_WHICH node` ]; then
    echo "Node executable not found"
    echo "Please install the node.js(>=6.9.5 LTS version)[https://nodejs.org/en/download/]"
    exit 1
fi

if [ -z `$EXEC_WHICH npm` ]; then
    echo "Npm executable not found"
    exit 1
fi

if [ -z `$EXEC_WHICH grunt` ]; then
    echo "Grunt executable not found"
    echo "Please install the grunt using the npm 'npm install -g grunt-cli'"
    exit 1
fi

if ! type "tizen" > /dev/null; then
    echo "WARNING: Tizen SDK executable \"tizen\" not found in PATH"
    echo "You will be unable to generate .wgt package from your projects"
    echo "Please install Tizen SDK (see README.md)"
fi

echo "Node executable found at: $EXEC_NODE"
echo "Npm executable found at: $EXEC_NPM"

NODE_VER=`$EXEC_NODE --version | sed 's/[^0-9\.]*//g'`
NPM_VER=`$EXEC_NPM --version | sed 's/[^0-9\.]*//g'`

echo "Current node version: $NODE_VER"
echo "Current npm version: $NPM_VER"

PACKAGE_NODE_ENGINE=`$EXEC_NODE -e "console.log(require('./package.json').engines.node);"`
PACKAGE_NODE_ENGINE_CLEANED=`echo $PACKAGE_NODE_ENGINE | sed 's/[^0-9\.]*//g'`

echo "Required node version: $PACKAGE_NODE_ENGINE"

if [ $(version $NODE_VER) -ge $(version $PACKAGE_NODE_ENGINE_CLEANED) ]; then
    echo -e "$COLOR_LIGHT_GREEN OK $COLOR_NC Node version is correct"
else
    echo "Your node version is to old to run this package! Please upgrade."
    exit 1
fi

if [ $(version $NPM_VER) -ge $(version 3.0.0) ]; then
    NPM_OPTION="--legacy-bundling"
fi

echo -e "\n$BOLD Installing the node_modules... $NO_FORMATTING"
rm -rf node_modules
$EXEC_NPM install $NPM_OPTION

echo -e "\n$BOLD Installing the node_modules of the brackets in libs/brackets-server/ $NO_FORMATTING"
rm -rf libs/brackets-server/node_modules
rm -rf libs/brackets-server/brackets-src/node_modules
cd libs/brackets-server/brackets-src
$EXEC_NPM install $NPM_OPTION
cd src/LiveDevelopment/MultiBrowserImpl/transports/node
$EXEC_NPM install $NPM_OPTION

cd ../../../../../../
$EXEC_NPM install $NPM_OPTION

cd embedded-ext/project/node/
$EXEC_NPM install $NPM_OPTION
cd ../../../

cd embedded-ext/importfile/node/
$EXEC_NPM install $NPM_OPTION
cd ../../../

pushd embedded-ext/tizen-profile/node/
$EXEC_NPM install $NPM_OPTION
popd

echo -e "\n$BOLD Building the brackets in libs/brackets-server/ $NO_FORMATTING"
grunt build
cd ../../

echo "Done ^_^"
exit 0

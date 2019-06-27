#!/bin/bash

DIR="${BASH_SOURCE%/*}"
. "$DIR/docker-common.sh"

watt_source_init

if [ "$1" = "--rebuild" ]; then
    docker_compose_build
fi

echo "Running ..."
docker-compose up

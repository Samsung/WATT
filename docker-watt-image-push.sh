#!/bin/bash

DIR="${BASH_SOURCE%/*}"
. "$DIR/docker-common.sh"

watt_source_init
docker_compose_build

echo "Upload to AWS is not implemented yet. Do it manually"

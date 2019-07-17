#!/bin/bash

# Usage:
# ./docker-watt-image-push.sh AWS_ACCOUNT_ID

if [ -z "$1" ]; then
    echo "Please give your aws account id as first param."
    exit 1
fi

DIR="${BASH_SOURCE%/*}"
. "$DIR/docker-common.sh"

watt_source_init
docker_compose_build

# Get the recent watt image.
local_watt_image=`docker images | awk '{print $1}' | awk 'NR==2'`
if [[ $local_watt_image != *watt_container ]]; then
  echo "Could not found watt image"
  exit 1
fi

echo -e "\033[0;32mImage to be pushed: \033[0m"
docker images | awk 'NR==2'

aws_account_id=$1
region=ap-northeast-2
watt_docker_aws_repository_uri=$aws_account_id.dkr.ecr.$region.amazonaws.com/watt_docker_repository

# Find and remove previously tagged image.
if docker images | awk '{print $1}' | grep -q $watt_docker_aws_repository_uri
then
    docker image rm $watt_docker_aws_repository_uri
    if [ $? -ne 0 ]; then
        echo "Could not remove "$watt_docker_aws_repository_uri
        exit 1
    fi
    echo -e "\033[0;32mSuccessfully removed \033[0m"$watt_docker_aws_repository_uri
fi

# Tag watt image with repository Uri.
docker tag $local_watt_image $watt_docker_aws_repository_uri
if [ $? -ne 0 ]; then
    echo "Could not tag images"
    exit 1
fi

# Login to aws.
aws ecr get-login --no-include-email --region $region | bash -
if [ $? -ne 0 ]; then
    echo "Could not login"
    exit 1
fi

# Push the image to repository Uri.
docker push $watt_docker_aws_repository_uri
if [ $? -ne 0 ]; then
    echo "Could not push images"
    exit 1
fi

echo -e "\033[0;32mSuccessfully pushed watt image to \033[0m"$watt_docker_aws_repository_uri

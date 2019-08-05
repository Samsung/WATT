#!/bin/bash

# Usage:
# ./docker-watt-image-push.sh AWS_ACCOUNT_ID

# Check jq package.
if ! dpkg -s jq > /dev/null; then
    echo "jq package is not installed. Use the following command for installation:"
    echo "sudo apt-get install -y jq"
    exit 1
fi

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

# Get ARN of running watt task.
watt_cluster="watt-cluster"
watt_task_arn=`aws ecs list-tasks --cluster $watt_cluster --region $region | jq '.taskArns[0]'`
if [[ $watt_task_arn = null ]]; then
    echo "Could not found running watt task to be stopped."
    exit 1
fi

# Get task id from full task arn.
watt_task_id=${watt_task_arn#*/}
# Cut the last " character.
watt_task_id=${watt_task_id:0:-1}

# Stop WATT task.
if ! aws ecs stop-task --cluster $watt_cluster --task $watt_task_id --region $region; then
    echo "Could not stop watt task."
    exit 1
fi

# Make sure task has been stopped.
sleep 5
echo -e "\033[0;32mSuccessfully stopped WATT task\033[0m"

# Run WATT task in order to take new image into account.
if ! aws ecs run-task --cluster $watt_cluster --task-definition WATT:5 --region $region; then
    echo "Could not run watt task."
    exit 1
fi

echo -e "\033[0;32mSuccessfully run WATT task\033[0m"

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
 * Install docker-ce (not docker). Follow steps from https://docs.docker.com/install/linux/docker-ce/ubuntu/. Recommended version is 18.06.1~ce~3-0~ubuntu. If you are using a newer one give it a try.
 * Install docker compose. Follow steps from https://docs.docker.com/compose/install/.
 * Verify docker installation:
```bash
docker run hello-world
```
 * If the following error appears this means you have to [add your user to docker group](https://docs.docker.com/install/linux/linux-postinstall/).
```bash
ERROR: Couldn't connect to Docker daemon at http+docker://localunixsocket - is it running?
```
 * If user can not be added due to the following error, manually add your user to docker group, for example, using *sudo vigr* tool.
```bash
usermod: user 'foo' does not exist
```
* WATT along with mongodb images can be built and run by:
```bash
./docker-run.sh
```
* Ensure 3000 port to be free. You should see logs on terminal:
```bash
watt_container_1   | Listening on port 3000
watt_container_1   | TAUComm started
mongo_container_1  | 2019-03-11T07:18:23.178+0000 I NETWORK  [thread1] connection accepted from 172.19.0.3:36916 #1 (1 connection now open)
```
* Open localhost:3000 in Browser.

## Inspecting docker images.
WATT and mongodb images are composed together by docker-compose.yml. However, if you want to execute any command on particular image type:
```bash
docker run -it 5f142ecd12f5 bash
```
ImageId can be found from:
```bash
docker images
```
## Building WATT in docker container
If you already did compose, for example, by invoking ./docker-run.sh you can attach to running container:
```bash
docker container attach 12cf98736487
```
And type 'b', container id comes from
```bash
docker container ls
```

## Inspecting running contatiner
It's possible to execute any command on running container:
```bash
docker container exec -i 12cf98736487 bash
```

## Pushing docker images to AWS repositories
 * Make sure your .git folder is not huge since its size significantly increases docker image.
```bash
./docker-run.sh
```
 * List docker images:
```bash
docker images
```
 * Sample output:
```bash
watt_watt_container                                                               latest              fa2fc69d89a1        5 days ago          3.36GB
mongo                                                                             3.4.19              056cb4b05c15        5 weeks ago         376MB
```
 * [Install the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-linux.html)
 * [Push images to aws repositories](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/docker-basics.html#use-ecr).
 * Images should be available at [repositories](https://us-east-2.console.aws.amazon.com/ecr/repositories?region=us-east-2).

## Setup WATT on AWS
 * Update docker-compose-aws.yml with new docker images repositories.
 * You can change default memory limits for each container in ecs-params.yml
 * [Install the Amazon ECS CLI](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ECS_CLI_installation.html)
 * [Create Your Cluster](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-cli-tutorial-ec2.html), for example,
```bash
ecs-cli up --force --keypair id_rsa --capability-iam --size 1 --instance-type t2.large --vpc vpc-0d05d256d9261ccb5 --subnets subnet-0b31dfed2f9dddb0a --security-group sg-09d2b747ca8b77f1a --cluster-config watt-cluster-config --region us-east-2
```
 * It is recommended to create your own Virtual Private Cloud (vpc), Subnet and Security Group unless you are just replacing current image.
 * [Deploy the Compose File to a Cluster](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-cli-tutorial-ec2.html#ECS_CLI_tutorial_compose_deploy), for example,
```bash
ecs-cli compose --file docker-compose-aws.yml --verbose up --create-log-groups --cluster-config watt-cluster-config --region us-east-2
```
 * See watt-awslogs-group at [CloudWatch](https://us-east-2.console.aws.amazon.com/cloudwatch/home?region=us-east-2#logs), you can also download them by
```bash
aws logs get-log-events --log-group-name watt-awslogs-group --log-stream-name watt/watt_container/0f16fa2e-6db9-4cff-8b13-821b3c72f446 --output text --region us-east-2
```
 * If you see 'Invalid command () was entered' please follow further steps
 * Due to no support for [interactive mode in compose](https://github.com/aws/amazon-ecs-cli/issues/706) there is a need to manually edit task definition
 * Go to Task [Definitions](https://us-east-2.console.aws.amazon.com/ecs/home?region=us-east-2#/taskDefinitions) and chose your task.
 * Click "Create new revision"
 * In 'JSON' tab, add the following section to watt container:
```bash
"interactive": true,
"pseudoTerminal": true,
```
 * Run task (Actions -> Run Task)
 * Verify if WATT starts properly by inspecting the logs.


## License
Refer [WATT License](https://github.com/Samsung/WATT/wiki/License)

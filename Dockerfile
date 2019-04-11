# build docker image by
# $ sudo docker build -t simple .

# To try something more ambitious, you can run an Ubuntu container with:
# $ sudo docker run -it simple bash

# Download base image ubuntu 16.04 since most developers are using it.
FROM ubuntu:16.04

################################ AS ROOT ################################

# nacl_sdk requires libc for i386
RUN dpkg --add-architecture i386

# Install WATT's dependencies to avoid doing this by launch script
# since it is expected to be run as regular user and sudo is not recommended
# by docker documentation.
RUN apt-get update && \
    apt-get install -y \
        lsb-release \
        libgconf-2-4 \
        android-tools-adb \
        git \
        python-pip \
        curl \
        build-essential \
        cmake \
        ca-certificates \
        libc6:i386 \
        pciutils \
        curl \
        zip && \
    apt-get -o Dpkg::Options::="--force-overwrite" install -y \
        openjdk-8-jdk && \
    curl -sL https://deb.nodesource.com/setup_10.x | bash - && \
    apt-get install -y nodejs && \
    apt-get -y clean && \
    apt-get -y autoclean && \
    apt-get -y autoremove

# Install python additional modules.
RUN pip install \
        psutil \
        requests

# Create new user to invoke launch script with user privileges.
# Running it as root causes issue for npm postinstall in Design Editor.
RUN groupadd -r watt_group && useradd --no-log-init -m -g watt_group watt_user
USER watt_user

################################ AS USER ################################

WORKDIR /home/watt_user/

# Download and install (latest) Tizen Studio 3.2 into default ~/tizen-studio (for user certificate creation)
RUN curl -sL http://download.tizen.org/sdk/Installer/tizen-studio_3.2/web-cli_Tizen_Studio_3.2_ubuntu-64.bin > web-cli_Tizen_Studio_3.2_ubuntu-64.bin && \
    chmod +x web-cli_Tizen_Studio_3.2_ubuntu-64.bin && \
    mkdir /home/watt_user/tizen-studio && \
    ./web-cli_Tizen_Studio_3.2_ubuntu-64.bin --accept-license /home/watt_user/tizen-studio && \
    rm web-cli_Tizen_Studio_3.2_ubuntu-64.bin

# Download and install Tizen Studio 2.5 into ~/tizen-studio-2.5 (for profile creation and packaging)
# Latest version is unable to pack to wgt once user cert is specified
# More details at http://suprem.sec.samsung.net/jira/browse/TIZENWF-2298
# or https://developer.tizen.org/ko/forums/sdk-ide/pwd-fle-format-profile.xml-certificates?langredirect=1
RUN curl -sL http://download.tizen.org/sdk/Installer/tizen-studio_2.5/web-cli_Tizen_Studio_2.5_ubuntu-64.bin > web-cli_Tizen_Studio_2.5_ubuntu-64.bin && \
    chmod +x web-cli_Tizen_Studio_2.5_ubuntu-64.bin && \
    mkdir /home/watt_user/tizen-studio-2.5 && \
    ./web-cli_Tizen_Studio_2.5_ubuntu-64.bin --accept-license /home/watt_user/tizen-studio-2.5 && \
    rm web-cli_Tizen_Studio_2.5_ubuntu-64.bin

# Consider cloning WATT from scratch once new (docker) user will be created to access github.
COPY --chown=watt_user:watt_group . /home/watt_user/WATT

WORKDIR /home/watt_user/WATT

# Invalidate submodules path. Otherwise submodules like tern (submodule of brackets-src) would
# refer to local PC path (not docker one), launch will init them.
RUN git submodule deinit -f .

EXPOSE 3000

ENV NODE_ENV=docker

# Prepare WATT (download node modules, emsdk, build DE ).
# This affects docker image size, can be used to speed up container start.
# RUN ./launch --dry
#     npm cache clean --force && \
#     rm -rf tools/wabt/out/

# Launch WATT by CMD command so you can replace it by any command to test image.
# Features behind flags like pwe, smart things are not added.
CMD [ "./launch", "--verbose" ]

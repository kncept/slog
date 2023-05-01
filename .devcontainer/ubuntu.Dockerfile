FROM docker.io/ubuntu:23.04
# https://github.com/kncept/super-simple-blog
# DEBUGGING: docker build -f .devcontainer/ubuntu.Dockerfile -t ubuntu-dev . && docker run -it ubuntu-dev bash

# consider lscr.io/linuxserver/code-server:latest

RUN apt-get update
RUN apt-get -y install sudo wget curl vim git

# Locale injector
# RUN \
    # echo LANGUAGE=en_US.UTF-8 >> /etc/environment && \
    # echo LC_ALL=en_US.UTF-8 >> /etc/environment && \
    # echo LANG=en_US.UTF-8 >> /etc/environment && \
    # echo LC_CTYPE=en_US.UTF-8 >> /etc/environment


# User
RUN usermod -aG sudo ubuntu
RUN echo "ubuntu:ubuntu" | chpasswd
USER ubuntu
WORKDIR /home/ubuntu

ARG NODE_VERSION=18
# install NVM and node version
RUN \
    curl -sL https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.0/install.sh -o install_nvm.sh && \
    bash install_nvm.sh && \
    rm -fr install_nvm.sh



# RUN printf "[url \"ssh://git@github.com/\"] \n        insteadOf = https://github.com/\n" >> ~/.gitconfig


FROM node:14-slim

WORKDIR /code

# https://askubuntu.com/questions/265471/autoreconf-not-found-error-during-making-qemu-1-4-0
RUN apt-get update && apt-get install -y \
    make \
    libtool \
    automake \
    autoconf \
    nasm

ADD ./package.json ./package-lock.json /code/
RUN npm install

ADD . /code

ENTRYPOINT [ "" ]

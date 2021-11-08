FROM ubuntu:20.04

RUN apt-get update
RUN apt-get install -y wget bundle inkscape

WORKDIR /build

COPY build.sh .
COPY jekyll-source/ ./jekyll-source
RUN ls

RUN ./build.sh

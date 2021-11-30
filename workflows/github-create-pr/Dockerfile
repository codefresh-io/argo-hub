FROM golang:alpine

RUN apk update
RUN apk add git curl
RUN go get github.com/github/hub

ENTRYPOINT hub

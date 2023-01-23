FROM alpine:3.15.0

ARG ARGO_WORKFLOWS_CLI_VERSION=v3.2.6

RUN wget https://github.com/argoproj/argo-workflows/releases/download/$ARGO_WORKFLOWS_CLI_VERSION/argo-linux-amd64.gz \
    && gunzip argo-linux-amd64.gz \
    && chmod +x argo-linux-amd64 \
    && mv ./argo-linux-amd64 /usr/local/bin/argo

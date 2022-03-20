FROM alpine:3.15.1

ARG ARGOCD_CLI_VERSION=v2.1.7

RUN wget -O /usr/local/bin/argocd https://github.com/argoproj/argo-cd/releases/download/$ARGOCD_CLI_VERSION/argocd-linux-amd64 \
 && chmod +x /usr/local/bin/argocd

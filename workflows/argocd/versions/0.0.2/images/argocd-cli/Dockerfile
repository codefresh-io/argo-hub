FROM alpine:3.22.0

ARG ARGOCD_CLI_VERSION=v3.0.6

RUN wget -O /usr/local/bin/argocd https://github.com/argoproj/argo-cd/releases/download/$ARGOCD_CLI_VERSION/argocd-linux-amd64 \
 && chmod +x /usr/local/bin/argocd

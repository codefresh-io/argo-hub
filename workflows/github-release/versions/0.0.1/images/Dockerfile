FROM node:13.0-alpine

ARG CF_CLI_VERSION=v0.35.0

RUN apk add -U --no-cache openssl bash wget jq libgcc libstdc++

RUN wget https://github.com/codefresh-io/cli/releases/download/v0.35.0/codefresh-${CF_CLI_VERSION}-alpine-x64.tar.gz -O - \
  | tar -xzf - -C /usr/local/bin

WORKDIR /plugin

COPY github-release-cli/package* ./
RUN npm install

COPY github-release-cli/ ./
RUN npm run build && npm install -g

COPY run.sh run.sh

SHELL [ "/bin/bash" ]

CMD /plugin/run.sh

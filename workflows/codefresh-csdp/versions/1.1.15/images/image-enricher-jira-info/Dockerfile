FROM node:22.17.1-bookworm-slim

RUN adduser --gecos "" --disabled-password --home /home/cfu --shell /bin/bash cfu

WORKDIR /app/

COPY package.json .
COPY yarn.lock .

RUN apt-get update && \
  apt-get install -y python3 make g++
RUN yarn --prod --network-timeout 3000000 && \
    yarn cache clean

COPY --chown=cfu --chmod=775 . .

RUN mkdir /cf-outputs && chmod 775 /cf-outputs && chown cfu /cf-outputs

USER cfu

CMD [ "node", "/app/src/index.js" ]

FROM node:18.12.1-bullseye-slim

RUN adduser --gecos "" --disabled-password --home /home/cfu --shell /bin/bash cfu

WORKDIR /app/

COPY package.json .
COPY yarn.lock .

RUN yarn --prod

COPY --chown=cfu --chmod=775 . .

RUN mkdir /cf-outputs && chmod 775 /cf-outputs && chown cfu /cf-outputs

USER cfu

CMD [ "node", "/app/src/index.js" ]

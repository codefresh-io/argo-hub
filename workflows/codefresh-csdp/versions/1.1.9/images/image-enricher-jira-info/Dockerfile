FROM node:18.12.1-alpine

WORKDIR /app/

COPY package.json .
COPY yarn.lock .

RUN apk add --update python3 make g++ && \
  rm -rf /var/cache/apk/*
RUN yarn --prod

COPY . .

CMD [ "node", "/app/src/index.js" ]

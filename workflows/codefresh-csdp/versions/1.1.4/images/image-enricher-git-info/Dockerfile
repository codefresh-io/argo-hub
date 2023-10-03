FROM node:14.18.1-alpine

WORKDIR /app/

COPY package.json .
COPY yarn.lock .

RUN yarn

COPY . .

CMD [ "node", "/app/src/index.js" ]

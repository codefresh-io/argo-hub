FROM node:18.12.1-alpine

WORKDIR /app/

COPY package.json .
COPY yarn.lock .

RUN yarn

COPY . .

CMD [ "node", "/app/src/index.js" ]
FROM node:12.22.11-stretch

WORKDIR /app/

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "node", "/app/src/index.js" ]

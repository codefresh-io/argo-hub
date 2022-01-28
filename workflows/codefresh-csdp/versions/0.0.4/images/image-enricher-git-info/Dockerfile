FROM node:erbium

WORKDIR /app/

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "node", "/app/src/index.js" ]

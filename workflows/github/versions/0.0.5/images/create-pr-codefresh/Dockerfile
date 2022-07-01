FROM node:16.15.1-stretch-slim

WORKDIR /app/

COPY package.json ./

COPY yarn.lock ./

COPY . .

RUN yarn install --frozen-lockfile

RUN yarn build

RUN yarn install --production

CMD [ "yarn", "start" ]

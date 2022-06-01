FROM node:16.13.2-alpine

WORKDIR /app/

COPY package.json ./

COPY yarn.lock ./

COPY . .

RUN yarn install --frozen-lockfile

RUN yarn build

RUN yarn install --production

CMD [ "yarn", "start" ]

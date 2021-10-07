FROM node:14.17.0-stretch-slim

RUN apk add --no-cache bash git openssh-client

# Create app directory
WORKDIR /app/

COPY package.json ./

COPY yarn.lock ./

# install cf-api required binaries
RUN yarn install --frozen-lockfile --production

# copy app files
COPY . ./

# run application
CMD ["node", "/app/index.js"]

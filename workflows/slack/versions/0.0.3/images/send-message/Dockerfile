FROM node:22-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json yarn.lock ./

RUN apk update && apk upgrade && yarn install
# If you are building your code for production
# RUN yarn install --production --frozen-lockfile

# Bundle app source
COPY . .

CMD ["node", "/usr/src/app/index.js"]

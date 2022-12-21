FROM --platform=linux/amd64 node:16-alpine as builder

# Create app directory
WORKDIR /app/

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Bundle app source
COPY . .

RUN npm ci

RUN npm run build

RUN rm -rf ./node_modules

RUN npm ci --only=production

FROM --platform=linux/amd64 node:16-alpine as app

WORKDIR /app/

COPY package*.json ./

COPY --from=builder /app/lib ./lib
COPY --from=builder /app/node_modules ./node_modules

CMD [ "node", "lib/index.js" ]
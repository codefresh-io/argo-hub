FROM node:16.15.1-strech-slim

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

RUN npm ci --only=production

CMD [ "node", "lib/index.js" ]

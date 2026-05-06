# DHI source: https://hub.docker.com/repository/docker/octopusdeploy/dhi-node
ARG DHI_NODE_TAG=22.22.0-debian13

FROM octopusdeploy/dhi-node:${DHI_NODE_TAG}-dev AS build

RUN mkdir /cf-outputs

WORKDIR /app

COPY package.json yarn.lock .yarnrc ./

RUN yarn --prod --frozen-lockfile

FROM octopusdeploy/dhi-node:${DHI_NODE_TAG}@sha256:929e379216af18f2998563acdacef4554897f30d19fdcc7ee25955c97f736c2e AS production

WORKDIR /app

COPY --from=build --chown=node:node --chmod=775 /cf-outputs /cf-outputs
COPY --from=build --chown=node:node --chmod=775 /app/node_modules ./node_modules
COPY --chown=node:node --chmod=775 package.json ./
COPY --chown=node:node --chmod=775 ./src ./src

USER node

CMD [ "node", "/app/src/index.js" ]

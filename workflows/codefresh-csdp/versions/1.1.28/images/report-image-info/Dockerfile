# DHI source: https://hub.docker.com/repository/docker/octopusdeploy/dhi-node
ARG DHI_NODE_TAG=22-debian13

FROM octopusdeploy/dhi-node:${DHI_NODE_TAG}-dev AS build

RUN mkdir /cf-outputs

WORKDIR /app

COPY package.json yarn.lock .yarnrc ./

RUN yarn --prod --frozen-lockfile

FROM octopusdeploy/dhi-node:${DHI_NODE_TAG}@sha256:20ddc80f72ca9ed6ee7d4a8b86e2ee031fa786dc7a6225ef7bfc284ec778f6c3 AS production

WORKDIR /app

COPY --from=build --chown=node:node --chmod=775 /cf-outputs /cf-outputs
COPY --from=build --chown=node:node --chmod=775 /app/node_modules ./node_modules
COPY --chown=node:node --chmod=775 package.json ./
COPY --chown=node:node --chmod=775 ./src ./src

USER node

CMD [ "node", "/app/src/index.js" ]

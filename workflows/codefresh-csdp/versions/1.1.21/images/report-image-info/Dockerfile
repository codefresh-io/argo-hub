# https://hub.docker.com/repository/docker/octopusdeploy/dhi-node
FROM octopusdeploy/dhi-node:22.22.0-debian13-dev AS build

RUN mkdir /cf-outputs

WORKDIR /app

COPY package.json yarn.lock .yarnrc ./

RUN yarn --prod --frozen-lockfile && yarn cache clean

FROM octopusdeploy/dhi-node:22.22.0-debian13 AS production

WORKDIR /app

COPY --from=build --chown=nonroot:nonroot /cf-outputs /cf-outputs
COPY --from=build --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --chown=nonroot:nonroot package.json ./
COPY --chown=nonroot:nonroot ./src ./src

USER nonroot

CMD [ "node", "/app/src/index.js" ]

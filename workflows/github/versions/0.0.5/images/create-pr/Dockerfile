FROM debian:stable-slim
ARG TARGETARCH
RUN apt update -y && apt install git curl -y && curl -L "https://github.com/mislav/hub/releases/download/v2.14.2/hub-linux-${TARGETARCH}-2.14.2.tgz" --output /tmp/hub.tar.gz && tar -xvf /tmp/hub.tar.gz -C /tmp && mv /tmp/hub-linux-${TARGETARCH}-2.14.2/bin/hub /usr/local/bin/ && rm -rf /tmp/hub* && rm -rf /var/lib/apt/lists/*
ENTRYPOINT hub

FROM alpine/git:v2.34.2

# Install GitHub CLI (gh) and yq tool
# Note: The apk package for github-cli was only 2.2.0 and we needed a higher version for the `gh label` command
RUN wget https://github.com/cli/cli/releases/download/v2.11.3/gh_2.11.3_linux_amd64.tar.gz && \
    tar -xvf gh_2.11.3_linux_amd64.tar.gz --strip-components=2 -C /usr/local/bin gh_2.11.3_linux_amd64/bin/gh && \
    rm gh_2.11.3_linux_amd64.tar.gz && \
    chmod +x /usr/local/bin/gh && \
    wget https://github.com/mikefarah/yq/releases/download/v4.25.2/yq_linux_amd64 -O /usr/bin/yq && \
    chmod +x /usr/bin/yq

COPY promote.sh /

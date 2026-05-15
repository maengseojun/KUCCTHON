# Dev container for KUCCTHON
FROM mcr.microsoft.com/devcontainers/base:ubuntu

ARG NODE_VERSION=22.22.2
ARG NPM_VERSION=10.9.7

# Install tooling and exact Node.js version
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl git build-essential python3 ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz -o /tmp/node.tar.xz \
  && tar -xJf /tmp/node.tar.xz -C /usr/local --strip-components=1 \
  && rm /tmp/node.tar.xz

RUN npm install -g npm@${NPM_VERSION}

# Use the vscode user from the base image
USER vscode
WORKDIR /workspace

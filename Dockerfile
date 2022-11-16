FROM alpine:latest
LABEL org.opencontainers.image.maintainer="AsP3X"
LABEL org.opencontainers.image.name="healthcheck"

RUN apk update && apk upgrade
RUN apk add --no-cache bash curl nano wget

SHELL ["/bin/bash", "-c"]

# Install nvm with node and npm
RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.38.0/install.sh | bash \
    && export NVM_DIR="$HOME/.nvm" \
    && . $NVM_DIR/nvm.sh \
    && nvm install 16.6.1 \
    && nvm alias default 16.6.1 \
    && nvm use default

RUN apk add --no-cache npm
RUN npm install -g yarn

WORKDIR /service

COPY ./assets/ ./assets/
COPY ./routes/ ./routes/
COPY package.json .
COPY yarn.lock .
COPY service.js .
COPY .env .

RUN yarn install

EXPOSE 3000
CMD ["yarn", "start"]
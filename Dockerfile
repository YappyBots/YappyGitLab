#######################################
# Install node dependencies
#######################################
FROM node:alpine as install
RUN apk update && \
    apk upgrade && \
    apk add --no-cache bash git openssh
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production

#######################################
# Setting up production
#######################################
FROM node:alpine
COPY --from=install /app /app
WORKDIR /app
COPY lib lib
ENV PORT=8080 \
    IP="0.0.0.0" \
    DISABLED_COMMANDS="exec,update,reload,reboot,eval"
ENV DISCORD_TOKEN \
    DB_URL \
    DISCORD_CLIENT_ID \
    DISCORD_CLIENT_SECRET \
    DISCORD_CHANNEL_LOGGING \
    BDPW_KEY \
    LOG_LEVEL

#######################################
# Run application
#######################################
USER node
CMD IS_DOCKER=true node lib/

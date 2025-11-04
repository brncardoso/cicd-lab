# Etapa de build usando Node 16-slim
FROM node:16-slim as BUILDER 
LABEL maintainer="Bruno"

WORKDIR /home/node/app

# Instala dependências da aplicacao
COPY package*.json ./
RUN npm install

COPY . ./

# Etapa final usando Node 10-alpine
FROM node:10-alpine

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

COPY --from=BUILDER /home/node/app/ ./

WORKDIR /home/node/app

USER node

COPY --chown=node:node . .

EXPOSE 8080

CMD [ "node", "app.js" ]

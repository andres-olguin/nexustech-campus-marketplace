FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN MONGOMS_DISABLE_POSTINSTALL=1 npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npm run migration:run:prod && npm start"]

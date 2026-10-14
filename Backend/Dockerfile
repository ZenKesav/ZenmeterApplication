FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 5005

ENV NODE_ENV=production

CMD ["npm", "start"]

FROM node:20.15.1-alpine3.19

WORKDIR /app

COPY package*.json ./

COPY . .

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

ENTRYPOINT ["sh", "-c", "npm install && if [ \"$NODE_ENV\" = 'development' ]; then npm run dev; else npm start; fi"]
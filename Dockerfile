FROM node:20.15.0

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/ 

RUN npm install 

COPY . .

EXPOSE 8080

EXPOSE 8080

CMD ["npm", "run", "dev"]

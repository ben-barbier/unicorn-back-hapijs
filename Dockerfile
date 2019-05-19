FROM node:11-alpine

WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

RUN npm run compile

EXPOSE 3000
EXPOSE 3100

CMD [ "npm", "start" ]

FROM node:21

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD [ "sh", "-c", "npm run initialise_service && npm start" ]

USER node

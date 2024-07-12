FROM node:21

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Create the logs directory and set permissions so that files can be stored here by a logger
RUN mkdir -p ./logs && chown -R node:node ./logs

# environment variable for project root - it is used by the code to locate the created directories above !
ENV PROJECT_ROOT=/usr/src/app

EXPOSE 3000

CMD [ "sh", "-c", "npm run initialise_service && npm start" ]

USER node

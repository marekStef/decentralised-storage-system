FROM node:21

ARG DELETE_AND_INITIALISE=false
# RUN if [ "$DELETE_AND_INITIALISE" = "true" ] ; then npm run delete_database > /usr/src/app/delete_db.log 2>&1 ; fi

# (this is the working directory for your application)
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

# for production
# RUN npm ci --only=production

RUN npm install

COPY . .

# Create the logs directory and set permissions so that files can be stored here by a logger
RUN mkdir -p ./logs && chown -R node:node ./logs

# environment variable for project root - it is used by the code to locate the created directories above !
ENV PROJECT_ROOT=/usr/src/app

# Port 3001 available to the world outside this container
EXPOSE 3001

CMD [ "npm", "start" ]

# Switch to a non-root user
USER node

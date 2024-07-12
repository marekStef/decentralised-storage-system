FROM node:21

# (this is the working directory for your application)
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

# for production
# RUN npm ci --only=production

RUN npm install

COPY . .

# Create the temp_uploads directory and set permissions so that temporary files can be stored here
RUN mkdir -p ./temp_uploads && chown -R node:node ./temp_uploads
# Create the logs directory and set permissions so that files can be stored here by a logger
RUN mkdir -p ./logs && chown -R node:node ./logs

# environment variable for project root - it is used by the code to locate the created directories above !
ENV PROJECT_ROOT=/usr/src/app

EXPOSE 3002

CMD [ "npm", "start" ]

# Switch to a non-root user
USER node

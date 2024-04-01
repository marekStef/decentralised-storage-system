FROM node:21

# (this is the working directory for your application)
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

# for production
# RUN npm ci --only=production

RUN npm install

COPY . .

# Port 3000 available to the world outside this container
EXPOSE 3003

CMD [ "npm", "start" ]

# Switch to a non-root user
USER node

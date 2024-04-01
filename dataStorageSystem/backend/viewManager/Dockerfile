FROM node:21

# (this is the working directory for your application)
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

# for production
# RUN npm ci --only=production

RUN npm install

COPY . .

EXPOSE 3002

CMD [ "npm", "start" ]

# Switch to a non-root user
USER node

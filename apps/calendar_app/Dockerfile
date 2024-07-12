FROM node:21

WORKDIR /usr/src/app

# Ensure node user has access to the .next directory
RUN mkdir -p /usr/src/app/.next/cache && chown -R node:node /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN chown -R node:node /usr/src/app/.next

ENV PORT 5000
EXPOSE 5000

CMD ["npm", "run", "dev"]

# Switch to a non-root user
USER node
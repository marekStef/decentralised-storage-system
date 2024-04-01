FROM node:latest as builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --silent

COPY / ./

RUN npm run build

FROM nginx:alpine

# Removing default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copying the built static files from the builder to the nginx serving directory
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
FROM nginx:1.25.2

# Remove dafault
RUN rm /etc/nginx/conf.d/default.conf

# Add custom
COPY ./gateway/nginx/gateway.conf /etc/nginx/conf.d/
COPY ./gateway/nginx/cors.conf /etc/nginx/

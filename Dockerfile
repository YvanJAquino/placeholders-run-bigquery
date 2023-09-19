# builder is responsible for building [compiling] the JS Framework source code
# into HTML, CSS, and JS.  The built output is available from the /dist directory.
FROM    node:20-bullseye AS builder
WORKDIR /app
COPY    package*.json .
RUN     npm i --silent
COPY    . .
RUN     npm run build

# Use Nginx as the web server.  See nginx.conf for details on how requests are
# proxied to the backend.  
FROM    nginx:latest
# Load the key environment variables.  These are overridable via the Cloud Run
# interface.
ENV     PROXY_HOST="127.0.0.1" \
        PROXY_PORT="9080" \
        PROJECT_ID="holy-diver-297719" \
        DATASET_ID="testing" \
        TABLE_ID="gsa_placeholder_testing"
# Copy the compiled HTML/JS from /app/dist        
COPY    --from=builder /app/dist /usr/share/nginx/html
# Copy the bq-proxy into /usr/bin.  Alternatively, this can be built in another
# container at Docker build time.  
COPY    bq-proxy /usr/bin
# Copy the Nginx config, overwriting the default.conf 
COPY    nginx.conf /etc/nginx/conf.d/default.conf
# Create a startup script that runs bq-proxy as a background process
# Make it executable.
RUN     cat <<EOF > /home/startup
#!/bin/bash
bq-proxy &
exec nginx -g "daemon off;"
EOF
RUN     chmod +x /home/startup
# Use this script 
CMD     ["./home/startup"]


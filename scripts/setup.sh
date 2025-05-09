#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Starting project setup...${NC}"

# Function to validate domain name
validate_domain() {
    if [[ ! $1 =~ ^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$ ]]; then
        echo "Invalid domain name format. Please enter a valid domain (e.g., example.com)"
        return 1
    fi
    return 0
}

# Get and validate domain name
while true; do
    read -p "Enter your domain name (e.g., example.com): " DOMAIN_NAME
    if validate_domain "$DOMAIN_NAME"; then
        break
    fi
done

# Check if .env file exists, if not create it
if [ ! -f .env ]; then
    echo -e "${BLUE}Creating .env file...${NC}"
    touch .env
    
    # Prompt for Cloudflare credentials
    read -p "Enter your Cloudflare API Token: " cf_token
    read -p "Enter your Cloudflare Account ID: " cf_account_id
    
    # Add to .env file
    echo "NEXT_PUBLIC_CLOUDFLARE_TOKEN=$cf_token" >> .env
    echo "NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=$cf_account_id" >> .env
    echo "NEXT_PUBLIC_SITE_DOMAIN=$DOMAIN_NAME" >> .env
    echo "NEXT_PUBLIC_SITE_URL=https://$DOMAIN_NAME" >> .env
fi

# PostgreSQL setup section
echo -e "${BLUE}Setting up PostgreSQL...${NC}"
sudo apt-get install -y postgresql postgresql-contrib

# Stop PostgreSQL first
echo -e "${BLUE}Stopping PostgreSQL service...${NC}"
sudo systemctl stop postgresql

# Drop and recreate cluster
echo -e "${BLUE}Dropping existing PostgreSQL cluster...${NC}"
sudo pg_dropcluster --stop 15 main
echo -e "${BLUE}Creating fresh PostgreSQL cluster...${NC}"
sudo pg_createcluster 15 main

# Start PostgreSQL service
echo -e "${BLUE}Starting PostgreSQL service...${NC}"
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Wait for PostgreSQL to be ready
echo -e "${BLUE}Waiting for PostgreSQL to start...${NC}"
sleep 5

# Get PostgreSQL credentials
echo -e "${BLUE}Setting up PostgreSQL credentials...${NC}"
read -p "Enter PostgreSQL database name (default: AffTrack): " POSTGRES_DB
POSTGRES_DB=${POSTGRES_DB:-AffTrack}
read -p "Enter PostgreSQL user (default: postgres): " POSTGRES_USER
POSTGRES_USER=${POSTGRES_USER:-postgres}
read -sp "Enter PostgreSQL password: " POSTGRES_PASSWORD
echo

# Create fresh database and user
echo -e "${BLUE}Creating fresh database and user...${NC}"
sudo -u postgres psql -c "DROP DATABASE IF EXISTS \"$POSTGRES_DB\";"
sudo -u postgres psql -c "DROP USER IF EXISTS $POSTGRES_USER;"
sudo -u postgres psql -c "CREATE USER $POSTGRES_USER WITH ENCRYPTED PASSWORD '$POSTGRES_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE \"$POSTGRES_DB\" OWNER $POSTGRES_USER;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE \"$POSTGRES_DB\" TO $POSTGRES_USER;"

# Update pg_hba.conf to use md5 authentication
echo -e "${BLUE}Updating PostgreSQL authentication...${NC}"
sudo sed -i 's/local   all             postgres                                peer/local   all             postgres                                md5/' /etc/postgresql/15/main/pg_hba.conf
sudo sed -i 's/host    all             all             127.0.0.1\/32            scram-sha-256/host    all             all             127.0.0.1\/32            md5/' /etc/postgresql/15/main/pg_hba.conf

# Restart PostgreSQL to apply changes
sudo systemctl restart postgresql
sleep 5

# Test database connection
echo -e "${BLUE}Testing database connection...${NC}"
if PGPASSWORD=$POSTGRES_PASSWORD psql -h localhost -U $POSTGRES_USER -d $POSTGRES_DB -c '\q'; then
    echo -e "${GREEN}Database connection successful!${NC}"
else
    echo -e "${RED}Database connection failed. Please check your credentials and try again.${NC}"
    exit 1
fi

# Install dependencies if needed
echo -e "${BLUE}Installing dependencies...${NC}"
npm install

# Initialize database
echo -e "${BLUE}Initializing database...${NC}"
npx prisma generate
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Prisma client generated successfully!${NC}"
else
    echo -e "${RED}Prisma client generation failed.${NC}"
    exit 1
fi

echo -e "${BLUE}Running database migrations...${NC}"
npx prisma migrate deploy
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Database migrations completed successfully!${NC}"
else
    echo -e "${RED}Database migrations failed.${NC}"
    exit 1
fi

# Install Certbot for SSL
echo -e "${BLUE}Installing Certbot...${NC}"
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# Setup Nginx configuration
echo -e "${BLUE}Setting up Nginx configuration...${NC}"

# Create temporary Nginx config file
cat > /tmp/nginx.conf << EOL
# Primary HTTPS server
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name ${DOMAIN_NAME};

    ssl_certificate /etc/letsencrypt/live/${DOMAIN_NAME}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN_NAME}/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
        
        client_max_body_size 50m;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN_NAME};
    return 301 https://\$server_name\$request_uri;
}
EOL

# Clean up existing configurations
echo -e "${BLUE}Cleaning up existing Nginx configurations...${NC}"
sudo rm -f /etc/nginx/sites-enabled/*
sudo rm -f /etc/nginx/sites-available/nextjs-site.conf

# Move the config file to the correct location with sudo
sudo mv /tmp/nginx.conf /etc/nginx/sites-available/nextjs-site.conf

# Create symbolic link
sudo ln -sf /etc/nginx/sites-available/nextjs-site.conf /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
echo -e "${BLUE}Setting up SSL with Let's Encrypt...${NC}"

# Create a temporary email for Let's Encrypt
ADMIN_EMAIL="admin@${DOMAIN_NAME}"

# Run certbot with proper domain name
sudo certbot --nginx \
    --non-interactive \
    --agree-tos \
    --email "${ADMIN_EMAIL}" \
    --domains "${DOMAIN_NAME}" \
    --redirect

echo -e "${GREEN}Setup completed successfully!${NC}"
echo -e "${GREEN}Your site should now be accessible at https://${DOMAIN_NAME}${NC}"
echo -e "${GREEN}Your database is ready to use.${NC}"
echo -e "${BLUE}You can now start your application with:${NC}"
echo -e "npm run dev"
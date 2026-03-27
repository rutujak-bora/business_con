#!/bin/bash
set -e

echo "Updating packages..."
sudo apt-get update -y
sudo DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

echo "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "Installing PM2 and Nginx..."
sudo npm install -g pm2
sudo apt-get install -y nginx

echo "Cloning repository..."
cd /home/ubuntu
if [ -d "business_con" ]; then
    rm -rf business_con
fi
git clone https://github.com/rutujak-bora/business_con.git
cd business_con

echo "Setting up environment..."
if [ -f "/home/ubuntu/.env.local" ]; then
    mv /home/ubuntu/.env.local .
fi

echo "Installing dependencies & building..."
npm install
npm run build

echo "Starting with PM2..."
pm2 stop all || true
pm2 delete all || true
pm2 start npm --name "business_app" -- start
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

echo "Configuring Nginx..."
sudo bash -c 'cat > /etc/nginx/sites-available/default <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF'

sudo systemctl restart nginx

echo "Deployment completed successfully! The app is running on Port 80."

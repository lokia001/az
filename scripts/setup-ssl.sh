#!/bin/bash

# Script to set up SSL with Let's Encrypt for Nginx
# Usage: sudo ./setup-ssl.sh working.mytests.id.vn

# Check if script is running with sudo/root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (use sudo)"
  exit 1
fi

# Get domain from command line or use default
DOMAIN=${1:-working.mytests.id.vn}
EMAIL="admin@${DOMAIN}"

echo "===================================================="
echo "🔒 Setting up SSL for domain: $DOMAIN"
echo "===================================================="

# Install certbot if not already installed
echo "📦 Checking for certbot..."
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
else
    echo "✅ Certbot is already installed"
fi

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "❌ Nginx is not installed. Please install Nginx first."
    exit 1
fi

# Verify Nginx configuration before proceeding
echo "🔍 Checking Nginx configuration..."
nginx -t
if [ $? -ne 0 ]; then
    echo "❌ Nginx configuration has errors. Please fix them before proceeding."
    exit 1
fi

# Backup current Nginx config
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
echo "📂 Backing up current Nginx configuration..."
mkdir -p /etc/nginx/sites-available/backup
cp /etc/nginx/sites-available/working.conf /etc/nginx/sites-available/backup/working.conf.${TIMESTAMP}

# Create a new SSL-enabled Nginx configuration
echo "📝 Creating SSL configuration for Nginx..."
cat > /etc/nginx/sites-available/working.conf << EOF
# HTTP server - redirects to HTTPS
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    
    # Redirect all HTTP requests to HTTPS
    location / {
        return 301 https://\$host\$request_uri;
    }
    
    # Let's Encrypt validation
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};

    # SSL certificates will be managed by certbot
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/${DOMAIN}/chain.pem;
    
    # SSL configuration
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;
    
    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    
    # HSTS (uncomment if you're sure you want this)
    # add_header Strict-Transport-Security "max-age=63072000" always;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # Frontend configuration
    root /var/www/html;
    index index.html;

    # Handle frontend routes
    location / {
        try_files \$uri \$uri/ /index.html;
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-XSS-Protection "1; mode=block";
        add_header X-Content-Type-Options "nosniff";
        add_header Referrer-Policy "strict-origin-when-cross-origin";
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE, PATCH' always;
        add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Requested-With' always;
    }

    # Cache static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # Increase timeouts
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        proxy_read_timeout 300;
        send_timeout 300;

        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE, PATCH' always;
        add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Requested-With' always;
        
        # Handle OPTIONS requests
        if (\$request_method = 'OPTIONS') {
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
}
EOF

echo "✅ Created new Nginx configuration with SSL support"

# Obtain SSL certificates
echo "🔒 Obtaining SSL certificates from Let's Encrypt..."
certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email ${EMAIL} --redirect

# Check if certbot was successful
if [ $? -ne 0 ]; then
    echo "❌ Failed to obtain SSL certificates. Reverting to backup configuration..."
    cp /etc/nginx/sites-available/backup/working.conf.${TIMESTAMP} /etc/nginx/sites-available/working.conf
    nginx -t && systemctl reload nginx
    echo "Consider using the manual method:"
    echo "  sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
    exit 1
fi

# Test Nginx configuration
echo "🔍 Testing new Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration test passed"
    echo "🔄 Reloading Nginx service..."
    systemctl reload nginx
    
    echo "===================================================="
    echo "✅ SSL setup complete! Your site should now be accessible via HTTPS."
    echo "🔗 https://${DOMAIN}"
    echo "===================================================="
    echo "🔄 Automatic renewal has been set up. Certificates will renew automatically."
    echo "To manually renew: sudo certbot renew"
    echo "To test renewal: sudo certbot renew --dry-run"
else
    echo "❌ Nginx configuration test failed. Reverting to backup configuration..."
    cp /etc/nginx/sites-available/backup/working.conf.${TIMESTAMP} /etc/nginx/sites-available/working.conf
    systemctl reload nginx
fi

# Set up auto-renewal
echo "⏰ Verifying certbot renewal timer..."
systemctl status certbot.timer

echo "===================================================="
echo "📝 REMINDER: Update Backend URLs and Configs"
echo "===================================================="
echo "Remember to update any URLs in your backend configuration that should now use HTTPS."
echo "This includes:"
echo "  - Jwt:Issuer and Jwt:Audience in appsettings.Production.json"
echo "  - Auth:FrontendPasswordResetBaseUrl in appsettings.Production.json"
echo "  - CORS allow origins"
echo "===================================================="

# Deployment Guide

This guide covers deploying the City Bus Tracker application to production.

## Prerequisites

- Production Oracle Database instance
- Node.js 18+ installed on server
- Nginx or Apache web server
- SSL certificate (recommended)
- Domain name (optional)

## Backend Deployment

### 1. Prepare the Server

```bash
# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Oracle Instant Client
# Download from Oracle website and install according to your OS
```

### 2. Deploy Backend Code

```bash
# Clone repository
git clone https://github.com/idabella/city_bus_tracker.git
cd city_bus_tracker/backend

# Install dependencies
npm install --production

# Create production environment file
cp .env.example .env
nano .env
# Configure production Oracle credentials
```

### 3. Build and Start

```bash
# Build TypeScript
npm run build

# Start with PM2
pm2 start dist/server.js --name city-bus-tracker-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### 4. Configure Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Frontend Deployment

### 1. Build Frontend

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build
# This creates a 'dist' folder with static files
```

### 2. Deploy Static Files

**Option A: Nginx**

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/city-bus-tracker/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:3001;
    }
}
```

**Option B: Apache**

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot /var/www/city-bus-tracker/frontend/dist

    <Directory /var/www/city-bus-tracker/frontend/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # React Router support
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # API proxy
    ProxyPass /api http://localhost:3001/api
    ProxyPassReverse /api http://localhost:3001/api
</VirtualHost>
```

## Database Setup

### 1. Create Production Database

```sql
-- Connect as SYSDBA
sqlplus sys/password@PROD as sysdba

-- Run infrastructure setup
@oracle/migrations/setup_infrastructure.sql

-- Connect as BUS_ADMIN
sqlplus bus_admin/YourProductionPassword@PROD

-- Run all migrations
@oracle/migrations/tables_objects.sql
-- Run other migration files...
```

### 2. Configure Backups

```bash
# Create backup script
#!/bin/bash
BACKUP_DIR="/backups/oracle"
DATE=$(date +%Y%m%d_%H%M%S)

expdp bus_admin/password@PROD \
  directory=BACKUP_DIR \
  dumpfile=city_bus_tracker_$DATE.dmp \
  logfile=city_bus_tracker_$DATE.log \
  schemas=BUS_ADMIN

# Add to crontab for daily backups
0 2 * * * /path/to/backup_script.sh
```

## SSL/HTTPS Setup

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
```

## Environment Variables

### Backend (.env)

```env
# Production Oracle Database
ORACLE_USER=bus_admin
ORACLE_PASSWORD=YourSecurePassword
ORACLE_CONNECTION_STRING=prod-db-server:1521/PROD

# Server Configuration
PORT=3001
NODE_ENV=production
```

### Frontend (.env)

```env
# Production API URL
VITE_API_URL=https://api.yourdomain.com/api
```

## Monitoring

### PM2 Monitoring

```bash
# View logs
pm2 logs city-bus-tracker-api

# Monitor resources
pm2 monit

# View status
pm2 status
```

### Nginx Logs

```bash
# Access logs
tail -f /var/log/nginx/access.log

# Error logs
tail -f /var/log/nginx/error.log
```

## Performance Optimization

### Backend

1. **Enable clustering** with PM2:
   ```bash
   pm2 start dist/server.js -i max --name city-bus-tracker-api
   ```

2. **Enable compression** in Express (already configured)

3. **Database connection pooling** (already configured in oracle.ts)

### Frontend

1. **Enable gzip** in Nginx:
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   ```

2. **Browser caching**:
   ```nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

## Security Checklist

- [ ] Change all default passwords
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall (only allow 80, 443, 22)
- [ ] Set up database backups
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Keep dependencies updated
- [ ] Set up monitoring and alerts

## Troubleshooting

### Backend won't start
```bash
# Check PM2 logs
pm2 logs city-bus-tracker-api

# Check Oracle connection
sqlplus bus_admin/password@PROD
```

### Frontend shows blank page
- Check browser console for errors
- Verify API URL in .env
- Check Nginx configuration
- Verify build was successful

### Database connection errors
- Verify Oracle Instant Client is installed
- Check connection string in .env
- Verify database is running
- Check firewall rules

## Rollback Procedure

```bash
# Backend
pm2 stop city-bus-tracker-api
git checkout previous-version
npm install
npm run build
pm2 restart city-bus-tracker-api

# Frontend
cd frontend
git checkout previous-version
npm install
npm run build
# Copy dist/ to web server
```

# Deployment Guide

## Options

| Method | Best for | Difficulty |
|--------|----------|------------|
| [Docker](#option-1-docker-recommended) | Any server / cloud | Easy |
| [PM2 on VPS](#option-2-pm2-on-vps-ubuntu) | Ubuntu/Debian VPS | Medium |
| [Railway](#option-3-railway-easiest-cloud) | Quick cloud deploy | Easy |
| [Render](#option-4-render) | Free-tier cloud | Easy |
| [AWS EC2](#option-5-aws-ec2) | Production scale | Advanced |

---

## Prerequisites (all options)

1. **MongoDB Atlas** URI is set in `.env` as `MONGO_URI`
2. Strong `JWT_SECRET` and `JWT_REFRESH_SECRET` (32+ random characters)
3. Node.js 20+ installed (for non-Docker options)

---

## Option 1: Docker (Recommended)

### 1a. Single server with docker-compose

```bash
# 1. Clone the repo on your server
git clone <your-repo-url>
cd nestjs

# 2. Create production .env
cp .env.example .env
nano .env   # fill in MONGO_URI, JWT secrets, etc.

# 3. Build and start
docker-compose up -d --build

# 4. Check logs
docker-compose logs -f api

# 5. Verify health
curl http://localhost:3000/api/v1/health
```

**Stop / restart:**
```bash
docker-compose down
docker-compose up -d
```

---

### 1b. Local dev with Docker (MongoDB included)

```bash
docker-compose -f docker-compose.dev.yml up
# API:           http://localhost:3000
# Mongo Express: http://localhost:8081  (admin / admin123)
```

---

## Option 2: PM2 on VPS (Ubuntu)

### Step 1 — Server setup

```bash
# Connect to your VPS
ssh root@your-server-ip

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install git (if not present)
sudo apt-get install -y git
```

### Step 2 — Deploy the app

```bash
# Clone your repo
git clone <your-repo-url> /var/www/cloud-solutions
cd /var/www/cloud-solutions

# Install dependencies
npm ci --omit=dev

# Create and fill .env
cp .env.example .env
nano .env

# Build
npm run build

# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 process list (survives reboots)
pm2 save

# Enable PM2 startup on boot
pm2 startup
# Copy-paste the command it prints, then run it
```

### Step 3 — Nginx reverse proxy

```bash
sudo apt-get install -y nginx

sudo nano /etc/nginx/sites-available/cloud-solutions
```

Paste this config:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/cloud-solutions /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 4 — Free SSL with Certbot

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
# Certbot auto-renews; test with:
sudo certbot renew --dry-run
```

### PM2 Useful commands

```bash
pm2 status                          # list all processes
pm2 logs cloud-solutions-api        # tail logs
pm2 restart cloud-solutions-api     # restart
pm2 reload cloud-solutions-api      # zero-downtime reload
pm2 stop cloud-solutions-api        # stop
pm2 monit                           # live dashboard
```

---

## Option 3: Railway (Easiest cloud)

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select this repo
3. Add environment variables in the Railway dashboard:

```
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=<strong-secret>
JWT_REFRESH_SECRET=<strong-secret>
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
PORT=3000
```

4. Railway auto-detects Node.js and runs `npm run build` + `npm run start:prod`
5. Add a custom domain in Settings → Domains

**Cost:** Free tier available; ~$5/month for hobby plan.

---

## Option 4: Render

1. Go to [render.com](https://render.com) → New → Web Service → Connect GitHub repo
2. Configure:
   - **Build Command:** `npm ci && npm run build`
   - **Start Command:** `npm run start:prod`
   - **Environment:** Node
3. Add environment variables (same as Railway above)
4. Deploy

**Cost:** Free tier (spins down after 15 min idle); $7/month for always-on.

---

## Option 5: AWS EC2

### Launch instance

1. AWS Console → EC2 → Launch Instance
2. Choose **Ubuntu 22.04 LTS** (t2.micro for free tier)
3. Create/select a key pair
4. Security Group inbound rules:
   - SSH: port 22 (your IP only)
   - HTTP: port 80 (anywhere)
   - HTTPS: port 443 (anywhere)

### Deploy

```bash
# SSH into instance
ssh -i your-key.pem ubuntu@<EC2-public-ip>

# Follow PM2 steps from Option 2
```

### Optional: Use Elastic IP

Assign an Elastic IP so your server IP doesn't change on restart:
- EC2 → Elastic IPs → Allocate → Associate with your instance

### Optional: Route 53 DNS

- Create A record pointing `your-domain.com` → Elastic IP

---

## Environment Variables Reference

Copy `.env.example` to `.env` and fill in all values:

```env
NODE_ENV=production
PORT=3000
API_VERSION=v1

# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

# JWT — use long random strings (32+ chars)
JWT_SECRET=<generate: openssl rand -base64 32>
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=<generate: openssl rand -base64 32>
JWT_REFRESH_EXPIRES_IN=30d

# Rate limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# CORS — comma-separated allowed origins
CORS_ORIGIN=https://your-frontend.com,https://www.your-frontend.com
```

Generate strong secrets:
```bash
openssl rand -base64 32
```

---

## MongoDB Atlas Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. **Database Access** → Add user with password
4. **Network Access** → Add IP:
   - `0.0.0.0/0` for all servers (or add your server's specific IP)
5. **Connect** → Drivers → Copy the connection string
6. Replace `<password>` and `<dbname>` in the string

---

## Health Check

After any deployment, verify the API is live:

```bash
curl https://your-domain.com/api/v1/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "environment": "production",
    "uptime": 123.4
  }
}
```

---

## Update / Redeploy

### Docker
```bash
git pull
docker-compose up -d --build
```

### PM2
```bash
git pull
npm ci --omit=dev
npm run build
pm2 reload ecosystem.config.js --env production
```

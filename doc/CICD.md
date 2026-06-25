# Auto-Deploy: Push to Master → Ubuntu Server

Every time you run `git push production master` from your laptop, the server:
1. Receives the code
2. Installs dependencies
3. Builds the app
4. Reloads PM2 with zero downtime

---

## Step 1 — One-time server setup

SSH into your Ubuntu server, then run:

```bash
ssh ubuntu@YOUR-SERVER-IP

# Download and run the setup script
curl -fsSL https://raw.githubusercontent.com/YOUR-REPO/main/scripts/setup-server.sh | bash
```

Or copy the script manually:

```bash
# On your local machine
scp scripts/setup-server.sh ubuntu@YOUR-SERVER-IP:~/

# On the server
bash ~/setup-server.sh
```

This will:
- Install Node.js 20
- Install PM2
- Create `/var/repo/cloud-solutions.git` (bare repo)
- Create `/var/www/cloud-solutions` (app folder)
- Install the `post-receive` hook automatically

---

## Step 2 — Configure .env on the server

The `.env` file is **never committed to git** (it's in `.gitignore`).  
You must create it manually on the server once:

```bash
nano /var/www/cloud-solutions/.env
```

Fill in your real values:

```env
NODE_ENV=production
PORT=3000
API_VERSION=v1

MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority

JWT_SECRET=<run: openssl rand -base64 32>
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=<run: openssl rand -base64 32>
JWT_REFRESH_EXPIRES_IN=30d

THROTTLE_TTL=60
THROTTLE_LIMIT=100

CORS_ORIGIN=https://your-frontend.com
```

Generate strong secrets:
```bash
openssl rand -base64 32   # run twice — once per JWT secret
```

---

## Step 3 — Add server as git remote (on your laptop)

```bash
# In your project folder on your local machine
git remote add production ubuntu@YOUR-SERVER-IP:/var/repo/cloud-solutions.git

# Verify
git remote -v
# production  ubuntu@YOUR-SERVER-IP:/var/repo/cloud-solutions.git (fetch)
# production  ubuntu@YOUR-SERVER-IP:/var/repo/cloud-solutions.git (push)
```

---

## Step 4 — First deploy

```bash
git push production master
```

You will see live output in your terminal:

```
Counting objects: 5, done.
Delta compression using up to 8 threads.
Compressing objects: 100% (3/3), done.
...
remote: ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
remote: 🚀 Deploying master @ a1b2c3d4
remote:    2024-01-15 12:00:00
remote: ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
remote: 📂 Checking out code ...
remote: 📦 Installing dependencies ...
remote: 🔨 Building ...
remote: ♻️  Reloading PM2 ...
remote: ✅ Done! http://65.2.100.200:3000/api/v1/health
remote: ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Step 5 — PM2 survive server reboots (run once on server)

```bash
pm2 startup
# It prints a command — copy and run it, e.g.:
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

pm2 save
```

Now PM2 auto-starts after any server reboot.

---

## Daily workflow (from your laptop)

```bash
# Make changes
git add .
git commit -m "feat: add new feature"

# Deploy
git push production master

# Done — server auto-deploys in ~30 seconds
```

---

## Nginx + SSL (optional but recommended)

### Install Nginx

```bash
sudo apt-get install -y nginx
```

### Create config

```bash
sudo nano /etc/nginx/sites-available/cloud-solutions
```

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
sudo nginx -t && sudo systemctl reload nginx
```

### Free SSL

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Certbot auto-renews. After this, your API is live at `https://your-domain.com/api/v1/`.

---

## View deploy logs on server

```bash
# All deploy history
cat /var/log/cloud-solutions-deploy.log

# Live app logs
pm2 logs cloud-solutions-api

# PM2 live dashboard
pm2 monit
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Permission denied (publickey)` | Add your SSH public key to `~/.ssh/authorized_keys` on the server |
| `Could not read from remote repository` | Check `git remote -v` — IP and path must be exact |
| PM2 process not starting | Check `pm2 logs` and verify `/var/www/cloud-solutions/.env` exists |
| Port 3000 not accessible | Open port: `sudo ufw allow 3000` (or use Nginx on port 80) |
| Build fails on server | Check Node version: `node -v` must be 20+ |

---

## SSH key setup (if not already done)

```bash
# On your laptop — generate key if you don't have one
ssh-keygen -t ed25519 -C "your-email@example.com"

# Copy your public key to the server
ssh-copy-id ubuntu@YOUR-SERVER-IP

# Test — should log in WITHOUT asking for password
ssh ubuntu@YOUR-SERVER-IP
```

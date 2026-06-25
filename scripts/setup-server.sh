#!/usr/bin/env bash
# Run this ONCE on your Ubuntu server to set everything up.
# Usage: bash setup-server.sh
# Replace the variables below before running.

set -e

# ─── CONFIG — change these ────────────────────────────────────────────────────
APP_USER="ubuntu"           # your SSH user on the server
REPO_DIR="/var/repo/cloud-solutions.git"
APP_DIR="/var/www/cloud-solutions"
PM2_APP="cloud-solutions-api"
NODE_VERSION="20"
# ──────────────────────────────────────────────────────────────────────────────

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🛠  CloudSolutions Server Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ─── 1. Install Node.js ───────────────────────────────────────────────────────
echo ""
echo "1️⃣  Installing Node.js $NODE_VERSION ..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v && npm -v

# ─── 2. Install PM2 ───────────────────────────────────────────────────────────
echo ""
echo "2️⃣  Installing PM2 ..."
sudo npm install -g pm2
pm2 -v

# ─── 3. Create app directory ──────────────────────────────────────────────────
echo ""
echo "3️⃣  Creating app directory at $APP_DIR ..."
sudo mkdir -p "$APP_DIR"
sudo chown "$APP_USER":"$APP_USER" "$APP_DIR"

# ─── 4. Create bare git repository ───────────────────────────────────────────
echo ""
echo "4️⃣  Creating bare git repo at $REPO_DIR ..."
sudo mkdir -p "$REPO_DIR"
sudo chown "$APP_USER":"$APP_USER" "$REPO_DIR"
git init --bare "$REPO_DIR"

# ─── 5. Install post-receive hook ─────────────────────────────────────────────
echo ""
echo "5️⃣  Installing post-receive hook ..."
HOOK_PATH="$REPO_DIR/hooks/post-receive"

cat > "$HOOK_PATH" << 'HOOK'
#!/usr/bin/env bash
set -e

REPO_DIR="/var/repo/cloud-solutions.git"
APP_DIR="/var/www/cloud-solutions"
BRANCH="master"
PM2_APP="cloud-solutions-api"
LOG_FILE="/var/log/cloud-solutions-deploy.log"

while read oldrev newrev refname; do
  PUSHED_BRANCH=$(git rev-parse --symbolic --abbrev-ref "$refname")

  if [ "$PUSHED_BRANCH" != "$BRANCH" ]; then
    echo "⚠  Pushed to '$PUSHED_BRANCH' — skipping deployment (only deploys master)."
    exit 0
  fi

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🚀 Deploying $BRANCH @ $newrev"
  echo "   $(date '+%Y-%m-%d %H:%M:%S')"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  echo "📂 Checking out code ..."
  GIT_WORK_TREE="$APP_DIR" git checkout -f "$BRANCH"

  echo "📦 Installing dependencies ..."
  cd "$APP_DIR"
  npm ci --omit=dev --ignore-scripts

  echo "🔨 Building ..."
  npm run build

  mkdir -p "$APP_DIR/logs"

  echo "♻️  Reloading PM2 ..."
  if pm2 describe "$PM2_APP" > /dev/null 2>&1; then
    pm2 reload "$PM2_APP" --update-env
  else
    pm2 start ecosystem.config.js --env production
    pm2 save
  fi

  echo "✅ Done! http://$(hostname -I | awk '{print $1}'):3000/api/v1/health"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

done 2>&1 | tee -a "$LOG_FILE"
HOOK

chmod +x "$HOOK_PATH"
echo "   Hook installed at $HOOK_PATH"

# ─── 6. Create .env on server ─────────────────────────────────────────────────
echo ""
echo "6️⃣  Creating .env template at $APP_DIR/.env ..."
cat > "$APP_DIR/.env" << 'ENV'
NODE_ENV=production
PORT=3000
API_VERSION=v1

MONGO_URI=REPLACE_WITH_YOUR_MONGO_ATLAS_URI

JWT_SECRET=REPLACE_WITH_STRONG_32CHAR_SECRET
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=REPLACE_WITH_ANOTHER_STRONG_32CHAR_SECRET
JWT_REFRESH_EXPIRES_IN=30d

THROTTLE_TTL=60
THROTTLE_LIMIT=100

CORS_ORIGIN=https://your-frontend.com
ENV

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Server setup complete!"
echo ""
echo "NEXT STEPS:"
echo ""
echo "  1. Edit the .env file on this server:"
echo "     nano $APP_DIR/.env"
echo ""
echo "  2. On your LOCAL machine, add the server as a git remote:"
echo "     git remote add production $APP_USER@<YOUR-SERVER-IP>:$REPO_DIR"
echo ""
echo "  3. Push to deploy:"
echo "     git push production master"
echo ""
echo "  4. (First time only) Set up PM2 to survive reboots:"
echo "     pm2 startup"
echo "     # run the command it prints, then:"
echo "     pm2 save"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

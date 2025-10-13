#!/usr/bin/env bash
set -euo pipefail

# Blue-Green Deploy Script (SSH + rsync)
# 1) Fill in CONFIG section
# 2) Run: bash deploy-bluegreen.sh

# ----- CONFIG -----
HOST="youruser@yourhost.com"            # SSH host (user@domain)
APP_DIR="~/apps/digital-hermit"         # Base app dir on server
LOCAL_DIR="/Users/ericmasmela/Documents/local web/landing-page"  # Local source dir
USE_HOSTING_DB_CONFIG=true               # If true, copy hosting DB config over
HOSTING_DB_CONFIG_LOCAL="/Users/ericmasmela/Documents/local web/landing-page-live/config/database-hosting.php"
HOSTING_DB_CONFIG_REMOTE="config/database.php"

# Optional MySQL migrations via CLI (uncomment and fill to enable)
# DB_HOST="your_db_host"; DB_NAME="your_db_name"; DB_USER="your_db_user"; DB_PASS="your_db_pass"
# RUN_MIGRATIONS=true
# MIGRATION_FILES=("database-setup.sql" "add-auth-fields.sql")

# ----- DERIVED -----
TIMESTAMP=$(date +%Y%m%d%H%M%S)
RELEASE_DIR="$APP_DIR/releases/$TIMESTAMP"
CURRENT_LINK="$APP_DIR/current"

echo "==> Creating release directory on host"
ssh "$HOST" "mkdir -p '$RELEASE_DIR' '$APP_DIR/shared/uploads' '$APP_DIR/releases'"

echo "==> Syncing files to new release"
rsync -avz --delete \
  --exclude .git --exclude node_modules \
  "$LOCAL_DIR/" "$HOST:$RELEASE_DIR/"

if [ "$USE_HOSTING_DB_CONFIG" = true ]; then
  echo "==> Copying hosting DB config"
  rsync -avz "$HOSTING_DB_CONFIG_LOCAL" "$HOST:$RELEASE_DIR/$HOSTING_DB_CONFIG_REMOTE"
fi

# Optional migrations
if [ "${RUN_MIGRATIONS:-false}" = true ]; then
  for mf in "${MIGRATION_FILES[@]}"; do
    echo "==> Running migration: $mf"
    ssh "$HOST" "mysql -h '$DB_HOST' -u '$DB_USER' -p'$DB_PASS' '$DB_NAME' < '$RELEASE_DIR/$mf'"
  done
fi

echo "==> Health check (optional)"
echo "(If you have a health endpoint, curl it here before switch)"
# ssh "$HOST" "curl -fsS http://localhost/health.php > /dev/null"

echo "==> Atomic switch to new release"
ssh "$HOST" "ln -sfn '$RELEASE_DIR' '$CURRENT_LINK'"

echo "==> Cleaning old releases (keep last 5)"
ssh "$HOST" "ls -1dt $APP_DIR/releases/* | tail -n +6 | xargs -r rm -rf"

echo "==> Done. Point your web root to $CURRENT_LINK if not already."




















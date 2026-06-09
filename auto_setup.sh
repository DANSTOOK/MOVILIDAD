#!/bin/bash
set -e

echo "🚂 Automatic Railway Setup for OXXO Movilidad"
echo "=============================================="

PROJECT_ID="1d79793e-5e0c-4d61-912b-14118534e7ee"
SERVICE_ID="5dab4d40-816e-476a-8ab4-9cb1c779f841"

# Step 1: Set environment variables on MOVILIDAD service
echo ""
echo "[1/3] Setting environment variables on MOVILIDAD service..."

railway variable set NODE_ENV "production" \
  --service MOVILIDAD \
  --environment production

railway variable set PORT "3001" \
  --service MOVILIDAD \
  --environment production

JWT_SECRET="sk_prod_$(date +%s)_railway_$(openssl rand -hex 16 2>/dev/null || echo 'default')"
railway variable set JWT_SECRET "$JWT_SECRET" \
  --service MOVILIDAD \
  --environment production

echo "✓ Variables set:"
railway variable list --service MOVILIDAD --environment production

# Step 2: Get the service ready
echo ""
echo "[2/3] Service status:"
railway service status MOVILIDAD

# Step 3: Trigger redeploy
echo ""
echo "[3/3] Triggering redeploy..."
railway service redeploy MOVILIDAD --yes || echo "⚠️  Redeploy command may need manual trigger"

echo ""
echo "=============================================="
echo "✅ Setup attempted!"
echo ""
echo "Next steps:"
echo "1. Create PostgreSQL in Railway dashboard"
echo "2. Get DATABASE_URL and set as variable"
echo "3. Redeploy MOVILIDAD service"
echo ""
echo "Dashboard: https://railway.com/project/1d79793e-5e0c-4d61-912b-14118534e7ee"

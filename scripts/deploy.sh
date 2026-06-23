#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Creator Membership Platform — Soroban Contract Deployment Script
# Deploys the contract to Stellar Testnet
# ═══════════════════════════════════════════════════════════════

set -e

echo "╔══════════════════════════════════════════════════╗"
echo "║  Creator Membership Platform — Contract Deploy   ║"
echo "╚══════════════════════════════════════════════════╝"

# Configuration
NETWORK="testnet"
RPC_URL="https://soroban-testnet.stellar.org"
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
SOURCE_ACCOUNT="${STELLAR_ACCOUNT:-deployer}"
CONTRACT_DIR="./contracts/creator-membership"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Step 1: Generate deployer account (if not exists)
echo -e "\n${BLUE}[1/5]${NC} Setting up deployer account..."
stellar keys generate --fund "$SOURCE_ACCOUNT" 2>/dev/null || echo -e "${YELLOW}Account '$SOURCE_ACCOUNT' already exists${NC}"

PUBLIC_KEY=$(stellar keys public-key "$SOURCE_ACCOUNT")
echo -e "${GREEN}✓${NC} Deployer public key: $PUBLIC_KEY"

# Step 2: Build the contract
echo -e "\n${BLUE}[2/5]${NC} Building smart contract..."
cd "$CONTRACT_DIR"
stellar contract build
cd -
echo -e "${GREEN}✓${NC} Contract built successfully"

# Step 3: Find the WASM file
WASM_FILE=$(find "$CONTRACT_DIR/target/wasm32v1-none/release" -name "*.wasm" -type f | head -1)
if [ -z "$WASM_FILE" ]; then
    echo -e "${RED}✗${NC} No WASM file found. Build may have failed."
    exit 1
fi
echo -e "${GREEN}✓${NC} Found WASM: $WASM_FILE"

# Step 4: Deploy to testnet
echo -e "\n${BLUE}[3/5]${NC} Deploying contract to $NETWORK..."
CONTRACT_ID=$(stellar contract deploy \
    --wasm "$WASM_FILE" \
    --source "$SOURCE_ACCOUNT" \
    --network "$NETWORK" \
    --rpc-url "$RPC_URL" \
    --network-passphrase "$NETWORK_PASSPHRASE" \
    --ignore-checks \
    --alias creator-membership)

echo -e "${GREEN}✓${NC} Contract deployed!"
echo -e "  Contract ID: ${GREEN}$CONTRACT_ID${NC}"

# Step 5: Initialize the contract
echo -e "\n${BLUE}[4/5]${NC} Initializing contract..."
stellar contract invoke \
    --id "$CONTRACT_ID" \
    --source "$SOURCE_ACCOUNT" \
    --network "$NETWORK" \
    --rpc-url "$RPC_URL" \
    --network-passphrase "$NETWORK_PASSPHRASE" \
    -- \
    initialize \
    --admin "$PUBLIC_KEY"

echo -e "${GREEN}✓${NC} Contract initialized with admin: $PUBLIC_KEY"

# Step 6: Write contract ID to .env.local
echo -e "\n${BLUE}[5/5]${NC} Writing contract ID to .env.local..."
if [ -f ".env.local" ]; then
    # Replace existing contract ID or append
    if grep -q "NEXT_PUBLIC_CONTRACT_ID" .env.local; then
        sed -i "s|NEXT_PUBLIC_CONTRACT_ID=.*|NEXT_PUBLIC_CONTRACT_ID=$CONTRACT_ID|" .env.local
    else
        echo "NEXT_PUBLIC_CONTRACT_ID=$CONTRACT_ID" >> .env.local
    fi
else
    cp .env.example .env.local
    sed -i "s|NEXT_PUBLIC_CONTRACT_ID=.*|NEXT_PUBLIC_CONTRACT_ID=$CONTRACT_ID|" .env.local
fi
echo -e "${GREEN}✓${NC} Contract ID saved to .env.local"

echo ""
echo "═══════════════════════════════════════════════════"
echo -e "  ${GREEN}Deployment Complete!${NC}"
echo "═══════════════════════════════════════════════════"
echo ""
echo "  Contract ID: $CONTRACT_ID"
echo "  Network:     $NETWORK"
echo "  Explorer:    https://stellar.expert/explorer/testnet/contract/$CONTRACT_ID"
echo ""
echo "  Next steps:"
echo "  1. Copy the Contract ID to your .env.local file"
echo "  2. Run 'npm run dev' to start the frontend"
echo ""

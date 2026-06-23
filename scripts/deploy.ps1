$ErrorActionPreference = "Stop"

Write-Host "Creator Membership Platform - Contract Deploy"

$NETWORK = "testnet"
$RPC_URL = "https://soroban-testnet.stellar.org"
$NETWORK_PASSPHRASE = "Test SDF Network ; September 2015"
$SOURCE_ACCOUNT = "deployer"
$CONTRACT_DIR = "./contracts/creator-membership"

Write-Host "[1/5] Setting up deployer account..."
try {
    stellar keys generate --fund $SOURCE_ACCOUNT 2>$null
} catch {
    Write-Host "Account $SOURCE_ACCOUNT already exists"
}

$PUBLIC_KEY = (stellar keys public-key $SOURCE_ACCOUNT).Trim()
Write-Host "Deployer public key: $PUBLIC_KEY"

Write-Host "[2/5] Building smart contract..."
Set-Location $CONTRACT_DIR
stellar contract build
Set-Location ../..
Write-Host "Contract built successfully"

$WASM_FILE = Get-ChildItem -Path "$CONTRACT_DIR/target/wasm32v1-none/release" -Filter "*.wasm" | Select-Object -First 1
if (-not $WASM_FILE) {
    Write-Host "No WASM file found. Build may have failed."
    exit 1
}
$WASM_FILE_PATH = $WASM_FILE.FullName
Write-Host "Found WASM: $($WASM_FILE.Name)"

Write-Host "[3/5] Deploying contract to $NETWORK..."
$CONTRACT_ID = (stellar contract deploy --wasm $WASM_FILE_PATH --source $SOURCE_ACCOUNT --network $NETWORK --rpc-url $RPC_URL --network-passphrase $NETWORK_PASSPHRASE --ignore-checks --alias creator-membership).Trim()

Write-Host "Contract deployed! ID: $CONTRACT_ID"

Write-Host "[4/5] Initializing contract..."
stellar contract invoke --id $CONTRACT_ID --source $SOURCE_ACCOUNT --network $NETWORK --rpc-url $RPC_URL --network-passphrase $NETWORK_PASSPHRASE -- initialize --admin $PUBLIC_KEY

Write-Host "Contract initialized with admin: $PUBLIC_KEY"

Write-Host "[5/5] Writing contract ID to .env.local..."
if (Test-Path ".env.local") {
    $envFile = Get-Content ".env.local"
    if ($envFile -match "NEXT_PUBLIC_CONTRACT_ID") {
        $envFile = $envFile -replace "NEXT_PUBLIC_CONTRACT_ID=.*", "NEXT_PUBLIC_CONTRACT_ID=$CONTRACT_ID"
        $envFile | Set-Content ".env.local"
    } else {
        Add-Content -Path ".env.local" -Value "NEXT_PUBLIC_CONTRACT_ID=$CONTRACT_ID"
    }
} else {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
        $envFile = Get-Content ".env.local"
        $envFile = $envFile -replace "NEXT_PUBLIC_CONTRACT_ID=.*", "NEXT_PUBLIC_CONTRACT_ID=$CONTRACT_ID"
        $envFile | Set-Content ".env.local"
    } else {
        Set-Content -Path ".env.local" -Value "NEXT_PUBLIC_CONTRACT_ID=$CONTRACT_ID"
    }
}
Write-Host "Contract ID saved to .env.local"
Write-Host "Deployment Complete!"
Write-Host "Next steps: Run npm run dev"

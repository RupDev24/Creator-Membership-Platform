// ═══════════════════════════════════════════════════════════════
// Soroban RPC Client — Server Connection Layer
// ═══════════════════════════════════════════════════════════════

import * as StellarSdk from "@stellar/stellar-sdk";
import { NETWORKS } from "@/lib/utils";

const NETWORK = NETWORKS.testnet;

/**
 * Create and return a Soroban RPC server instance.
 */
export function getSorobanServer(): StellarSdk.rpc.Server {
  return new StellarSdk.rpc.Server(NETWORK.rpcUrl, {
    allowHttp: false,
  });
}

/**
 * Get the contract ID from environment variables.
 */
export function getContractId(): string {
  const contractId = process.env.NEXT_PUBLIC_CONTRACT_ID;
  if (!contractId || contractId === "CONTRACT_ADDRESS_HERE") {
    // Return a placeholder for dev mode
    return "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
  }
  return contractId;
}

/**
 * Get the network passphrase.
 */
export function getNetworkPassphrase(): string {
  return NETWORK.passphrase;
}

/**
 * Get the Horizon URL for balance queries.
 */
export function getHorizonUrl(): string {
  return NETWORK.horizonUrl;
}

/**
 * Build a base transaction for Soroban contract calls.
 */
export async function buildTransaction(
  sourceAddress: string,
  operations: StellarSdk.xdr.Operation[]
): Promise<StellarSdk.Transaction> {
  const server = getSorobanServer();

  // Load the source account
  const account = await server.getAccount(sourceAddress);

  // Build the transaction
  const txBuilder = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK.passphrase,
  });

  // Add operations
  for (const op of operations) {
    txBuilder.addOperation(op);
  }

  // Set timeout
  txBuilder.setTimeout(30);

  return txBuilder.build();
}

/**
 * Simulate a transaction on the Soroban RPC server.
 */
export async function simulateTransaction(
  tx: StellarSdk.Transaction
): Promise<StellarSdk.rpc.Api.SimulateTransactionResponse> {
  const server = getSorobanServer();
  return await server.simulateTransaction(tx);
}

/**
 * Assemble a transaction with simulation results.
 * Returns a ready-to-sign transaction.
 */
export function assembleTransaction(
  tx: StellarSdk.Transaction,
  simulation: StellarSdk.rpc.Api.SimulateTransactionResponse
): StellarSdk.Transaction {
  if (StellarSdk.rpc.Api.isSimulationError(simulation)) {
    throw new Error(`Simulation failed: ${JSON.stringify(simulation)}`);
  }

  const assembled = StellarSdk.rpc.assembleTransaction(
    tx,
    simulation as StellarSdk.rpc.Api.SimulateTransactionSuccessResponse
  ).build();

  return assembled;
}

/**
 * Submit a signed transaction to the network and poll for result.
 */
export async function submitTransaction(
  signedTxXdr: string
): Promise<StellarSdk.rpc.Api.GetSuccessfulTransactionResponse> {
  const server = getSorobanServer();
  const tx = StellarSdk.TransactionBuilder.fromXDR(
    signedTxXdr,
    NETWORK.passphrase
  );

  const sendResponse = await server.sendTransaction(tx);

  if (sendResponse.status === "ERROR") {
    throw new Error(
      `Transaction send failed: ${sendResponse.errorResult?.toXDR("base64") || "Unknown error"}`
    );
  }

  // Poll for transaction result
  const hash = sendResponse.hash;
  let getResponse: StellarSdk.rpc.Api.GetTransactionResponse;

  // Poll with exponential backoff
  let attempts = 0;
  const maxAttempts = 30;

  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 1000 + attempts * 500));
    getResponse = await server.getTransaction(hash);

    if (getResponse.status !== "NOT_FOUND") {
      if (getResponse.status === "SUCCESS") {
        return getResponse as StellarSdk.rpc.Api.GetSuccessfulTransactionResponse;
      }
      if (getResponse.status === "FAILED") {
        throw new Error(`Transaction failed on-chain: ${hash}`);
      }
    }

    attempts++;
  }

  throw new Error(`Transaction polling timed out: ${hash}`);
}

/**
 * Fetch events from the Soroban RPC for a given contract.
 */
export async function getContractEvents(
  contractId: string,
  startLedger?: number,
  limit = 100
): Promise<StellarSdk.rpc.Api.EventResponse> {
  const server = getSorobanServer();

  const filters: StellarSdk.rpc.Api.EventFilter[] = [
    {
      type: "contract",
      contractIds: [contractId],
    },
  ];

  const requestParams: StellarSdk.rpc.Server.GetEventsRequest = {
    filters,
    pagination: { limit },
  };

  if (startLedger) {
    requestParams.startLedger = startLedger;
  }

  return await server.getEvents(requestParams);
}

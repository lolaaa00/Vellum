export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_GENLAYER_CHAIN_ID ?? 61999);
export const RPC_URL = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL ?? 'https://studio.genlayer.com/api';
export const EXPLORER_URL = process.env.NEXT_PUBLIC_GENLAYER_EXPLORER_URL ?? 'https://explorer-studio.genlayer.com';
export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_VELLUM_CONTRACT_ADDRESS ?? '').trim();
export const NETWORK_LABEL = 'GenLayer StudioNet';
export const CHAIN_HEX = `0x${CHAIN_ID.toString(16)}`;
export const isConfigured = () => /^0x[a-fA-F0-9]{40}$/.test(CONTRACT_ADDRESS);
export const explorerTx = (hash: string) => `${EXPLORER_URL}/tx/${hash}`;
export const explorerAddress = (address: string) => `${EXPLORER_URL}/address/${address}`;

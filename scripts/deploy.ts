import { readFileSync } from 'fs';
import path from 'path';
import type { GenLayerClient, TransactionHash } from 'genlayer-js/types';

export default async function main(client: GenLayerClient<any>) {
  const code = new Uint8Array(readFileSync(path.resolve(process.cwd(), 'contracts/vellum.py')));
  await client.initializeConsensusSmartContract();
  const hash = await client.deployContract({ code, args: [] });
  const receipt: any = await client.waitForTransactionReceipt({ hash: hash as TransactionHash, status: 'ACCEPTED' as any, retries: 200 });
  const address = receipt?.data?.contract_address ?? receipt?.txDataDecoded?.contractAddress;
  console.log(JSON.stringify({ network: 'studionet', chainId: 61999, hash, address }, null, 2));
}

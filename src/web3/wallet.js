import { MONAD_TESTNET } from '../game/constants.js';

const MONAD_CHAIN_ID = '0x279f';
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

function getEthereum() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask is unavailable in this browser context.');
  }
  return window.ethereum;
}

export async function switchToMonadTestnet() {
  const ethereum = getEthereum();
  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: MONAD_CHAIN_ID }],
    });
  } catch (switchError) {
    if (switchError?.code !== 4902) throw switchError;
    await ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: MONAD_CHAIN_ID,
        chainName: 'Monad Testnet',
        nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
        rpcUrls: ['https://testnet-rpc.monad.xyz/'],
        blockExplorerUrls: ['https://testnet.monadexplorer.com/'],
      }],
    });
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: MONAD_CHAIN_ID }],
    });
  }
}

export async function connectWallet() {
  const ethereum = getEthereum();
  const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
  const address = accounts?.[0];
  if (!address) throw new Error('MetaMask did not return an account.');
  await switchToMonadTestnet();
  return { address };
}

export function encodeVictoryData(deityName, tilesConquered) {
  const message = `MONAD_PANTHEON_WIN:${deityName}:${tilesConquered}`;
  return `0x${Array.from(new TextEncoder().encode(message), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('')}`;
}

export async function claimVictoryOnChain(address, tilesConquered, deityName, contractAddress) {
  const ethereum = getEthereum();
  if (!/^0x[a-fA-F0-9]{40}$/.test(address || '')) {
    throw new Error('Connect a valid wallet before submitting an on-chain claim.');
  }

  const to = contractAddress && contractAddress !== ZERO_ADDRESS
    ? contractAddress
    : address;
  if (!/^0x[a-fA-F0-9]{40}$/.test(to)) {
    throw new Error('Enter a valid 0x-prefixed contract address, or leave it empty to send to your wallet.');
  }

  await switchToMonadTestnet();
  const txHash = await ethereum.request({
    method: 'eth_sendTransaction',
    params: [{
      from: address,
      to,
      value: '0x0',
      data: encodeVictoryData(deityName, tilesConquered),
    }],
  });
  return { txHash };
}

export { MONAD_TESTNET };

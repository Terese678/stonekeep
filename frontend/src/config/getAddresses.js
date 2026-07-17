// Picks the right set of contract addresses based on whichever network
// the connected wallet is currently on. Reads the chain ID via wagmi's
// useChainId() and matches it against our known testnet/mainnet IDs
// (see wagmi.js for where these chain IDs are defined).

import { useChainId } from 'wagmi'
import { ADDRESSES } from './addresses'

const CHAIN_IDS = {
  testnet: 968,
  mainnet: 677,
}

export function useContractAddresses() {
  const chainId = useChainId()

  if (chainId === CHAIN_IDS.mainnet) {
    return ADDRESSES.mainnet
  }
  if (chainId === CHAIN_IDS.testnet) {
    return ADDRESSES.testnet
  }

  // Wallet is on some other network entirely — not safe to guess
  return null
}
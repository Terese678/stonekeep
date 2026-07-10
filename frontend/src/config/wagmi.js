// Wagmi configuration for Stonekeep.
// Defines BOT Chain as a custom chain (it isn't a built-in preset in wagmi/viem)
// and sets up wallet connection (MetaMask, etc.) plus the RPC transport.

import { createConfig, http } from 'wagmi'
import { defineChain } from 'viem'
import { injected } from 'wagmi/connectors'

// BOT Chain Testnet, used while we're building and testing.
// Chain ID and RPC confirmed from BOT Chain's dev docs.
export const botChainTestnet = defineChain({
  id: 968,
  name: 'BOT Chain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BOT',
    symbol: 'BOT',
  },
  rpcUrls: {
    default: { http: ['https://rpc.bohr.life'] },
  },
  blockExplorers: {
    default: { name: 'BOT Scan', url: 'https://scan.botchain.ai' },
  },
  testnet: true,
})

// BOT Chain Mainnet; we'll switch to this once testnet is validated
// and we're ready to deploy for real (around July 19-21 per our plan).
export const botChainMainnet = defineChain({
  id: 677,
  name: 'BOT Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'BOT',
    symbol: 'BOT',
  },
  rpcUrls: {
    default: { http: ['https://rpc.botchain.ai'] },
  },
  blockExplorers: {
    default: { name: 'BOT Scan', url: 'https://scan.botchain.ai' },
  },
})

// Main wagmi config: this is what wraps our whole app.
// chains: both testnet and mainnet are registered, so switching later is easy.
// connectors: injected() covers MetaMask and similar browser wallets.
// transports: tells wagmi which RPC URL to use for each chain.
export const config = createConfig({
  chains: [botChainTestnet, botChainMainnet],
  connectors: [injected()],
  transports: {
    [botChainTestnet.id]: http(),
    [botChainMainnet.id]: http(),
  },
})
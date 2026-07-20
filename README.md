# Stonekeep

On-chain proof of authorship for creators, built on BOT Chain.

## What this is

Stonekeep lets a creator register their work (a script, a file, anything) permanently on-chain. Once it's registered, that record can never be changed or deleted; it's proof of who made something, and exactly when.

This milestone covers proof of authorship, IPFS storage, and ownership transfer; all working end-to-end with a live frontend, deployed on both testnet and mainnet.

## How it works

1. A creator uploads a file. It's hashed in the browser (a fingerprint of its exact content) and uploaded to IPFS via Pinata. The hash, IPFS link, and a title get registered on-chain.
2. Anyone can upload that same file later and instantly see who registered it, when, and view the file itself via its IPFS link.
3. The registered owner can transfer rights to someone else's wallet if ownership changes hands.

## Frontend

A working dashboard (React + Vite + wagmi) with four live features:

- **Wallet** — connect/disconnect via MetaMask
- **Register Work** — hash a file, upload to IPFS, write it on-chain
- **Verify a Work** — re-check a file against the chain, no wallet needed
- **Transfer Rights** — hand off ownership to a new wallet address

The frontend automatically detects which network your wallet is connected to (testnet or mainnet) and uses the correct contract addresses.

## Contracts

- `StonekeepRegistry.sol` — the core registry. Handles registering and looking up proof of authorship. Once something is registered here, it's permanent. Emits a `WorkRegistered` event on every registration, so external platforms and future indexers can track registrations in real time rather than scanning every block.
- `RightsAssignment.sol` — handles transferring ownership of a registered work. Kept separate from the registry on purpose, since ownership can change hands while the original proof never should. Emits a `RightsTransferred` event on every transfer, capturing the previous and new holder.
- `interfaces/IStonekeepRegistry.sol` — a blueprint the two contracts above use 
to talk to each other without depending on internal details. This same 
interface means marketplaces, licensing platforms, or NFT tools can build 
directly on top of Stonekeep's proof layer — calling `getWork()` to verify 
authorship on-chain, without needing our permission or routing through us.

## Deployed on BOT Chain Testnet

- StonekeepRegistry: `0xFc3eEC7D47E390A88D41860A7f331fFAab932044`
- RightsAssignment: `0x7FB8B8B3Bd735212cd913A0d404b08F6c6d87798`

## Deployed on BOT Chain Mainnet

- StonekeepRegistry: `0x8e364326718676f3b1D74C8b51C3D355C4d659AE`
- RightsAssignment: `0x7C4Cf3beA7e77aF85d6e3c13Df0Fe32Cd78539dB`

## Known limitations

- **Front-running**: like any on-chain proof-of-first system, a pending 
  `registerWork` transaction is visible in the mempool before it's mined. 
  A malicious actor could theoretically see the hash and race to register 
  it first with higher gas. This is a known tradeoff of the current design, 
  not specific to Stonekeep.

- **Zero-address transfer**: `transferRights` currently doesn't block 
  transferring ownership to the zero address, which would lock a work 
  permanently. I have a one-line fix ready, but redeploying now would mean 
  new contract addresses and re-registering test data, so it's deferred 
  to a follow-up update.

## Scripts

- `scripts/deploy.js` — deploys both contracts
- `scripts/registerWork.js` — registers a file's hash on-chain
- `scripts/verifyWork.js` — looks up a registered work
- `scripts/transferRights.js` — transfers ownership of a registered work

## Running this yourself

Install dependencies, compile the contracts, then deploy:

\`\`\`
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network botchainTestnet
# or
npx hardhat run scripts/deploy.js --network botchainMainnet
\`\`\`

You'll need a `.env` file with your own `PRIVATE_KEY` and test BOT tokens from the BOT Chain testnet faucet.

To run the frontend:

\`\`\`
cd frontend
npm install
npm run dev
\`\`\`

You'll need a `frontend/.env` file with your own `VITE_PINATA_JWT` for IPFS uploads.
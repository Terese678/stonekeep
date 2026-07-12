# Stonekeep

On-chain proof of authorship for creators, built on BOT Chain.

## What this is

Stonekeep lets a creator register their work (a script, a file, anything) permanently on-chain. Once it's registered, that record can never be changed or deleted; it's proof of who made something, and exactly when.

This milestone covers proof of authorship, IPFS storage, and ownership transfer; all working end-to-end with a live frontend.

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

## Contracts

- `StonekeepRegistry.sol` — the core registry. Handles registering and looking up proof of authorship. Once something is registered here, it's permanent.
- `RightsAssignment.sol` — handles transferring ownership of a registered work. Kept separate from the registry on purpose, since ownership can change hands while the original proof never should.
- `interfaces/IStonekeepRegistry.sol` — a blueprint the two contracts above use to talk to each other without depending on internal details.

## Deployed on BOT Chain Testnet

- StonekeepRegistry: `0xd82378cD929036AfC32db97DFe86b9fCF2e46258`
- RightsAssignment: `0xb24DaB8a0E6Ad8Ac9a76746C6fF37fAFa4671Aaa`

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
\`\`\`

You'll need a `.env` file with your own `PRIVATE_KEY` and test BOT tokens from the BOT Chain testnet faucet.

To run the frontend:

\`\`\`
cd frontend
npm install
npm run dev
\`\`\`

You'll need a `frontend/.env` file with your own `VITE_PINATA_JWT` for IPFS uploads.
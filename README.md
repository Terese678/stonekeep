# Stonekeep

On-chain proof of authorship for creators, built on BOT Chain.

## What this is

Stonekeep lets a creator register their work (a script, a file, anything) permanently on-chain. Once registered, that record can never be changed or deleted; it's proof of who made something, and exactly when.

This is the first milestone: proof of authorship and ownership transfer. Royalty rails and IPFS storage integration are planned next.

## How it works

1. A creator hashes their work (a fingerprint of its exact content) and registers it on-chain, along with a title and a link to where the file is actually stored (currently a placeholder, IPFS integration coming next).
2. Anyone can look up that hash later and see who registered it, and when.
3. The registered owner can transfer rights to someone else if needed.

## Contracts

- **StonekeepRegistry.sol** — the core registry. Handles registering and looking up proof of authorship. Once something is registered here, it's permanent.
- **RightsAssignment.sol** — handles transferring ownership of a registered work. Kept separate from the registry on purpose, since ownership can change hands while the original proof never should.
- **interfaces/IStonekeepRegistry.sol** — a blueprint the two contracts above use to talk to each other without depending on internal details.

## Deployed on BOT Chain Testnet

- StonekeepRegistry: `0xd82378cD929036AfC32db97DFe86b9fCF2e46258`
- RightsAssignment: `0xb24DaB8a0E6Ad8Ac9a76746C6fF37fAFa4671Aaa`

## Scripts

- `scripts/deploy.js` — deploys both contracts
- `scripts/registerWork.js` — registers a file's hash on-chain
- `scripts/verifyWork.js` — looks up a registered work
- `scripts/transferRights.js` — transfers ownership of a registered work

## Running this yourself

Install dependencies, compile the contracts, then deploy:

    npm install
    npx hardhat compile
    npx hardhat run scripts/deploy.js --network botchainTestnet

You'll need a `.env` file with your own `PRIVATE_KEY` and test BOT tokens from the BOT Chain testnet faucet.
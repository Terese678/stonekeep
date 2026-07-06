// This script looks up a registered work on-chain and shows what was
// saved: who registered it, its IPFS link, title, and when.
// Run it with: npx hardhat run scripts/verifyWork.js --network botchainTestnet

const REGISTRY_ADDRESS = "0xd82378cD929036AfC32db97DFe86b9fCF2e46258";

// The exact fingerprint we got when we registered our file earlier.
const WORK_HASH = "0xc54c09666efda15b0489e22c58c55c1767af67ae076eee6a7e873ee678c2692d";

async function main() {
  const registry = await ethers.getContractAt("StonekeepRegistry", REGISTRY_ADDRESS);

  const [author, ipfsHash, title, timestamp] = await registry.getWork(WORK_HASH);

  console.log("Author wallet:", author);
  console.log("IPFS link:", ipfsHash);
  console.log("Title:", title);
  console.log("Registered at (timestamp):", timestamp.toString());
  console.log("Registered at (readable date):", new Date(Number(timestamp) * 1000).toString());
}

main();
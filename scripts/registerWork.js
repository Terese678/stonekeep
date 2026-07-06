// This script registers a real file on-chain. It reads the file, creates
// a fingerprint (hash) of its exact contents, then calls registerWork()
// on our deployed StonekeepRegistry contract.
// Run it with: npx hardhat run scripts/registerWork.js --network botchainTestnet

const fs = require("fs");

// The StonekeepRegistry address from our deploy step.
const REGISTRY_ADDRESS = "0xd82378cD929036AfC32db97DFe86b9fCF2e46258";

async function main() {
  // Read the actual file's content from disk.
  const fileContent = fs.readFileSync("sample-work.txt");

  // Create a fingerprint of that exact content. If even one character in
  // the file changes, this fingerprint changes completely.
  const workHash = ethers.keccak256(fileContent);

  // A placeholder IPFS link for now, later this would be the real
  // address where the file is actually stored on IPFS.
  const ipfsHash = "ipfs://placeholder-for-now";

  const title = "The Chariot Merchant - Scene 1";

  console.log("File fingerprint (hash):", workHash);

  const registry = await ethers.getContractAt("StonekeepRegistry", REGISTRY_ADDRESS);

  console.log("Sending registration transaction...");
  const tx = await registry.registerWork(workHash, ipfsHash, title);
  const receipt = await tx.wait();

  console.log("Registered! Transaction hash:", receipt.hash);
  console.log("View it here: https://scan.bohr.life/tx/" + receipt.hash);
}

main();
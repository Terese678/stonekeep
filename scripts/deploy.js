// This script deploys our two contracts (StonekeepRegistry and RightsAssignment)
// to whichever BOTChain network you point it at.
// Run it with: npx hardhat run scripts/deploy.js --network botchainTestnet
//          or: npx hardhat run scripts/deploy.js --network botchainMainnet

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Deploying from address:", signer.address);

  // Deploy the registry first, it has no dependencies.
  const StonekeepRegistry = await ethers.getContractFactory("StonekeepRegistry");
  const registry = await StonekeepRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("StonekeepRegistry deployed at:", registryAddress);

  // Deploy RightsAssignment second, it needs the registry's address
  // to know where to check for registered works.
  const RightsAssignment = await ethers.getContractFactory("RightsAssignment");
  const rights = await RightsAssignment.deploy(registryAddress);
  await rights.waitForDeployment();
  const rightsAddress = await rights.getAddress();
  console.log("RightsAssignment deployed at:", rightsAddress);
}

main();
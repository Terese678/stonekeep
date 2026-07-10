// This script transfers ownership of a registered work to a new address,
// proving RightsAssignment.sol actually works on-chain.
// Run it with: npx hardhat run scripts/transferRights.js --network botchainTestnet

const RIGHTS_ADDRESS = "0xb24DaB8a0E6Ad8Ac9a76746C6fF37fAFa4671Aaa";

// The same fingerprint we registered earlier.
const WORK_HASH = "0x055facc663f545b6ab2b92f76f08bc552313a7181e751b3b1b3e38d70dff76cc";

// Paste in a second wallet address here - the new "owner" we're
// transferring rights to.
const NEW_HOLDER_ADDRESS = "0xA3B404e605223382103E73060d82D958b7C80884";

async function main() {
  const rights = await ethers.getContractAt("RightsAssignment", RIGHTS_ADDRESS);

  console.log("Current rights holder:", await rights.getRightsHolder(WORK_HASH));

  console.log("Sending transfer transaction...");
  const tx = await rights.transferRights(WORK_HASH, NEW_HOLDER_ADDRESS);
  const receipt = await tx.wait();

  console.log("Transferred! Transaction hash:", receipt.hash);
  console.log("View it here: https://scan.bohr.life/tx/" + receipt.hash);

  console.log("New rights holder:", await rights.getRightsHolder(WORK_HASH));
}

main();
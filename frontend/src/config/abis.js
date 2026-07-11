// ABI for the StonekeepRegistry contract.
// its pulled from artifacts/contracts/StonekeepRegistry.sol/StonekeepRegistry.json
// Only the "abi" array matters here, bytecode/etc. stay in the Hardhat artifacts.

export const registryAbi = [
  {
    "inputs": [{ "internalType": "bytes32", "name": "workHash", "type": "bytes32" }],
    "name": "getWork",
    "outputs": [
      { "internalType": "address", "name": "author", "type": "address" },
      { "internalType": "string", "name": "ipfsHash", "type": "string" },
      { "internalType": "string", "name": "title", "type": "string" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "workHash", "type": "bytes32" },
      { "internalType": "string", "name": "ipfsHash", "type": "string" },
      { "internalType": "string", "name": "title", "type": "string" }
    ],
    "name": "registerWork",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]
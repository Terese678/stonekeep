// ABI for the StonekeepRegistry contract.
// Its pulled from artifacts/contracts/StonekeepRegistry.sol/StonekeepRegistry.json
// Only the "abi" array matters here, bytecode/etc. stay in the Hardhat artifacts.

export const registryAbi = [
  {
    "inputs": [{ "internalType": "bytes32", "name": "workHash", "type": "bytes32" }],
    "name": "getWork",
    "outputs": [
      { "internalType": "address", "name": "author", "type": "address" },
      { "internalType": "string", "name": "ipfsHash", "type": "string" },
      { "internalType": "string", "name": "title", "type": "string" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "bool", "name": "attestsOwnership", "type": "bool" },
      { "internalType": "bool", "name": "disputed", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "workHash", "type": "bytes32" },
      { "internalType": "string", "name": "ipfsHash", "type": "string" },
      { "internalType": "string", "name": "title", "type": "string" },
      { "internalType": "bool", "name": "attestsOwnership", "type": "bool" }
    ],
    "name": "registerWork",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "workHash", "type": "bytes32" }],
    "name": "flagDisputed",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "workHash", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "author", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "ipfsHash", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "title", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "indexed": false, "internalType": "bool", "name": "attestsOwnership", "type": "bool" }
    ],
    "name": "WorkRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "workHash", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "author", "type": "address" }
    ],
    "name": "WorkDisputed",
    "type": "event"
  }
]
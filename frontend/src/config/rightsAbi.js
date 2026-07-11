// ABI for RightsAssignment - tracks who currently holds rights to a
// registered work, separate from the Registry (which never changes
// once a work is registered).

export const rightsAbi = [
  {
    "inputs": [{ "internalType": "bytes32", "name": "workHash", "type": "bytes32" }],
    "name": "getRightsHolder",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "workHash", "type": "bytes32" },
      { "internalType": "address", "name": "newHolder", "type": "address" }
    ],
    "name": "transferRights",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]
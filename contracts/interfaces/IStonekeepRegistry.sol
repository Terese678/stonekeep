// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// This interface exists so other contracts like the one that will handle
// rights transfers later can read from the registry without needing to
// know how it's built internally. If I ever rewrite the registry's logic,
// anything depending on this interface keeps working unchanged.
interface IStonekeepRegistry {
    function getWork(bytes32 workHash) external view returns (address author, string memory ipfsHash, string memory title, uint256 timestamp);
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IStonekeepRegistry {
    function getWork(bytes32 workHash) external view returns (
        address author,
        string memory ipfsHash,
        string memory title,
        uint256 timestamp,
        bool attestsOwnership,
        bool disputed
    );
}
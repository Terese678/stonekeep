// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IStonekeepRegistry.sol";

// This contract handles who currently owns the rights to a registered
// work. It's kept separate from the registry on purpose: the registry
// never changes once something is registered, but ownership can change
// hands over time, so that logic lives here instead.
contract RightsAssignment {

    // The registry this contract checks against, to confirm a work is
    // actually registered before letting anyone deal with its rights.
    IStonekeepRegistry public registry;

    // This will track who currently holds the rights to a work. If a work has never
    // been transferred, this stays empty; in that case, the original
    // author (from the registry) is treated as the current owner.
    mapping(bytes32 => address) private currentHolder;

    // Broadcast every time rights actually change hands. Lets an indexer
    // (or any platform plugging into Stonekeep) track ownership history
    // for a work over time, instead of only ever seeing its current holder.
    event RightsTransferred(
        bytes32 indexed workHash,
        address indexed previousHolder,
        address indexed newHolder,
        uint256 timestamp
    );

    // It runs once, when this contract is first deployed. It's told where
    // to find the registry so it can check registered works.
    constructor(address registryAddress) {
        registry = IStonekeepRegistry(registryAddress);
    }

    // anyone can call this to check who currently owns a work's rights.
    // If ownership was never transferred, we fall back to the original
    // author recorded in the registry.
    function getRightsHolder(bytes32 workHash) external view returns (address) {
        address holder = currentHolder[workHash];

        if (holder == address(0)) {
            (address author, , , ) = registry.getWork(workHash);
            return author;
        }

        return holder;
    }

    // this will let the current rights holder transfer ownership to someone new.
    // Only the current holder can do this; nobody else is allowed to
    // give away rights that aren't theirs.
    function transferRights(bytes32 workHash, address newHolder) external {
        address caller = msg.sender;
        address current = currentHolder[workHash];

        if (current == address(0)) {
            (address author, , , ) = registry.getWork(workHash);
            current = author;
        }

        require(caller == current, "Only the current rights holder can transfer this");

        currentHolder[workHash] = newHolder;

        emit RightsTransferred(workHash, current, newHolder, block.timestamp);
    }
}
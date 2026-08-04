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

    // This tracks who currently holds the rights to a work. If a work has
    // never been transferred, this stays empty, and the original author
    // from the registry is treated as the current owner.
    mapping(bytes32 => address) private currentHolder;

    // Broadcast every time rights to a work are transferred. Lets an
    // indexer build a full ownership history for any given work without
    // scanning every block.
    event RightsTransferred(bytes32 indexed workHash, address indexed previousHolder, address indexed newHolder);

    // Runs once, when this contract is first deployed. It's told where
    // to find the registry so it can check registered works.
    constructor(address registryAddress) {
        registry = IStonekeepRegistry(registryAddress);
    }

    // Anyone can call this to check who currently owns a work's rights.
    // If ownership was never transferred, we fall back to the original
    // author recorded in the registry.
    function getRightsHolder(bytes32 workHash) external view returns (address) {
        address holder = currentHolder[workHash];

        if (holder == address(0)) {
            (address author, , , , , ) = registry.getWork(workHash);
            return author;
        }

        return holder;
    }

    // Lets the current rights holder transfer ownership to someone new.
    // Only the current holder can do this, nobody else is allowed to
    // give away rights that aren't theirs.
    function transferRights(bytes32 workHash, address newHolder) external {
        require(newHolder != address(0), "Cannot transfer to the zero address");

        address caller = msg.sender;
        address current = currentHolder[workHash];

        if (current == address(0)) {
            // This call to the registry is a view function with no
            // ability to call back into this contract, so there's no
            // reentrancy risk here even though it happens before the
            // state change below.
            (address author, , , , , ) = registry.getWork(workHash);
            current = author;
        }

        require(caller == current, "Only the current rights holder can transfer this");
        require(newHolder != caller, "Cannot transfer rights to yourself");

        currentHolder[workHash] = newHolder;

        emit RightsTransferred(workHash, current, newHolder);
    }
}
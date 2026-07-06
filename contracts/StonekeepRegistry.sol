// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IStonekeepRegistry.sol";

// This is the actual registry, the place where proof of authorship gets
// permanently saved. Once someone registers their work here, it can never
// be deleted or changed. That permanence is the whole point.
contract StonekeepRegistry is IStonekeepRegistry {

    // Everything we know about one registered work: who registered it,
    // where the actual file lives (IPFS), what it's called, and exactly
    // when it was registered.
    struct Work {
        address author;
        string ipfsHash;
        string title;
        uint256 timestamp;
    }

    // The actual storage. Think of this like a filing cabinet: you give it
    // a hash (the fingerprint of a file), and it hands back the Work record
    // saved under that fingerprint.
    mapping(bytes32 => Work) private works;

    // This is how a creator actually registers their work. They provide
    // the fingerprint (hash) of their file, the IPFS link to where the
    // actual file is stored, and a title. Once saved, this can never be
    // overwritten; that permanence is what makes it real proof.
    function registerWork(bytes32 workHash, string memory ipfsHash, string memory title) external {
        require(works[workHash].timestamp == 0, "This work is already registered");

        works[workHash] = Work(msg.sender, ipfsHash, title, block.timestamp);
    }

    // This is how anyone can check who registered a work, where to find it,
    // and when. It's "view" because it only reads information, it never
    // changes anything, so it's free to call.
    function getWork(bytes32 workHash) external view returns (address author, string memory ipfsHash, string memory title, uint256 timestamp) {
        Work memory work = works[workHash];
        return (work.author, work.ipfsHash, work.title, work.timestamp);
    }
}
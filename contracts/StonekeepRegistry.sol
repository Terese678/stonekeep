// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IStonekeepRegistry.sol";

// This is the actual registry, the place where proof of authorship gets
// permanently saved. Once someone registers their work here, it can never
// be deleted or changed. That permanence is the whole point.
contract StonekeepRegistry is IStonekeepRegistry {

    // Everything we know about one registered work: who registered it,
    // where the actual file lives (IPFS), what it's called, when it was
    // registered, whether they attested to being the creator, and
    // whether they've since flagged it disputed.
    struct Work {
        address author;
        string ipfsHash;
        string title;
        uint256 timestamp;
        bool attestsOwnership;
        bool disputed;
    }

    // The actual storage. Think of this like a filing cabinet: you give it
    // a hash (the fingerprint of a file), and it hands back the Work record
    // saved under that fingerprint.
    mapping(bytes32 => Work) private works;

    // Broadcast every time a new work gets registered. Lets anyone
    // listening (an indexer, a future "browse all works" page, another
    // platform plugging in) hear about it in real time instead of having
    // to scan every block.
    event WorkRegistered(
        bytes32 indexed workHash,
        address indexed author,
        string ipfsHash,
        string title,
        uint256 timestamp,
        bool attestsOwnership
    );

    // Broadcast when someone flags their own registration as disputed.
    event WorkDisputed(bytes32 indexed workHash, address indexed author);

    // This is how a creator actually registers their work. They provide
    // the fingerprint (hash) of their file, the IPFS link to where the
    // actual file is stored, a title, and an explicit attestation that
    // they're the creator. attestsOwnership must be true, it's not
    // optional, every registrant has to affirmatively make that claim.
    // Once saved, this can never be overwritten; that permanence is what
    // makes it real proof.
    function registerWork(
        bytes32 workHash,
        string memory ipfsHash,
        string memory title,
        bool attestsOwnership
    ) external {
        require(works[workHash].timestamp == 0, "This work is already registered");
        require(attestsOwnership, "You must attest that you are the creator of this work");

        works[workHash] = Work(msg.sender, ipfsHash, title, block.timestamp, attestsOwnership, false);

        emit WorkRegistered(workHash, msg.sender, ipfsHash, title, block.timestamp, attestsOwnership);
    }

    // Lets the original author flag their own registration as disputed,
    // say, if they registered the wrong file by mistake. This doesn't
    // remove or hide the record, nothing can, it just adds a visible flag.
    // Only the original author can call this.
    function flagDisputed(bytes32 workHash) external {
        require(works[workHash].timestamp != 0, "This work is not registered");
        require(works[workHash].author == msg.sender, "Only the original author can flag this work");
        require(!works[workHash].disputed, "This work is already flagged as disputed");

        works[workHash].disputed = true;

        emit WorkDisputed(workHash, msg.sender);
    }

    // This is how anyone can check who registered a work, where to find it,
    // when, whether they attested to ownership, and whether it's disputed.
    // It's "view" because it only reads information, it never changes
    // anything, so it's free to call.
    function getWork(bytes32 workHash) external view returns (
        address author,
        string memory ipfsHash,
        string memory title,
        uint256 timestamp,
        bool attestsOwnership,
        bool disputed
    ) {
        Work memory work = works[workHash];
        return (work.author, work.ipfsHash, work.title, work.timestamp, work.attestsOwnership, work.disputed);
    }
}
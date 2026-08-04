// test/Stonekeep.test.js
//
// Automated tests for StonekeepRegistry and RightsAssignment. These
// don't just check the happy path, they also confirm the contracts
// correctly reject the actions they're supposed to reject. 

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StonekeepRegistry", function () {
  let registry;
  let owner, other;
  const workHash = ethers.keccak256(ethers.toUtf8Bytes("sample-file-content"));

  beforeEach(async function () {
    [owner, other] = await ethers.getSigners();
    const StonekeepRegistry = await ethers.getContractFactory("StonekeepRegistry");
    registry = await StonekeepRegistry.deploy();
    await registry.waitForDeployment();
  });

  it("registers a work when attestsOwnership is true", async function () {
    await registry.connect(owner).registerWork(workHash, "ipfsHash123", "My Work", true);

    const work = await registry.getWork(workHash);
    expect(work.author).to.equal(owner.address);
    expect(work.attestsOwnership).to.equal(true);
    expect(work.disputed).to.equal(false);
  });

  it("rejects registration when attestsOwnership is false", async function () {
    await expect(
      registry.registerWork(workHash, "ipfsHash123", "My Work", false)
    ).to.be.revertedWith("You must attest that you are the creator of this work");
  });

  it("rejects registering the same work hash twice", async function () {
    await registry.registerWork(workHash, "ipfsHash123", "My Work", true);

    await expect(
      registry.connect(other).registerWork(workHash, "differentIpfs", "Different Title", true)
    ).to.be.revertedWith("This work is already registered");
  });

  it("lets the original author flag their own work as disputed", async function () {
    await registry.connect(owner).registerWork(workHash, "ipfsHash123", "My Work", true);
    await registry.connect(owner).flagDisputed(workHash);

    const work = await registry.getWork(workHash);
    expect(work.disputed).to.equal(true);
  });

  it("rejects flagging disputed by anyone other than the original author", async function () {
    await registry.connect(owner).registerWork(workHash, "ipfsHash123", "My Work", true);

    await expect(
      registry.connect(other).flagDisputed(workHash)
    ).to.be.revertedWith("Only the original author can flag this work");
  });

  it("rejects flagging a work that's already disputed", async function () {
    await registry.connect(owner).registerWork(workHash, "ipfsHash123", "My Work", true);
    await registry.connect(owner).flagDisputed(workHash);

    await expect(
      registry.connect(owner).flagDisputed(workHash)
    ).to.be.revertedWith("This work is already flagged as disputed");
  });
});

describe("RightsAssignment", function () {
  let registry, rights;
  let author, holder, stranger;
  const workHash = ethers.keccak256(ethers.toUtf8Bytes("sample-file-content"));

  beforeEach(async function () {
    [author, holder, stranger] = await ethers.getSigners();

    const StonekeepRegistry = await ethers.getContractFactory("StonekeepRegistry");
    registry = await StonekeepRegistry.deploy();
    await registry.waitForDeployment();

    const RightsAssignment = await ethers.getContractFactory("RightsAssignment");
    rights = await RightsAssignment.deploy(await registry.getAddress());
    await rights.waitForDeployment();

    await registry.connect(author).registerWork(workHash, "ipfsHash123", "My Work", true);
  });

  it("falls back to the original author when rights were never transferred", async function () {
    expect(await rights.getRightsHolder(workHash)).to.equal(author.address);
  });

  it("lets the current holder transfer rights to someone new", async function () {
    await rights.connect(author).transferRights(workHash, holder.address);
    expect(await rights.getRightsHolder(workHash)).to.equal(holder.address);
  });

  it("rejects transfers from anyone who isn't the current holder", async function () {
    await expect(
      rights.connect(stranger).transferRights(workHash, holder.address)
    ).to.be.revertedWith("Only the current rights holder can transfer this");
  });

  it("rejects transferring to the zero address", async function () {
    await expect(
      rights.connect(author).transferRights(workHash, ethers.ZeroAddress)
    ).to.be.revertedWith("Cannot transfer to the zero address");
  });

  it("rejects transferring rights to yourself", async function () {
    await expect(
      rights.connect(author).transferRights(workHash, author.address)
    ).to.be.revertedWith("Cannot transfer rights to yourself");
  });

  it("respects a second transfer after the first one", async function () {
    await rights.connect(author).transferRights(workHash, holder.address);
    await rights.connect(holder).transferRights(workHash, stranger.address);

    expect(await rights.getRightsHolder(workHash)).to.equal(stranger.address);
  });
});
// Hardhat setup for compiling and deploying Stonekeep's contracts.

require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // loads PRIVATE_KEY from .env, keeps it out of this file

const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  solidity: "0.8.24", // must match the version used in the .sol files

  networks: {
    // BOT Chain Testnet, used for all our testing so far
    botchainTestnet: {
      url: "https://rpc.bohr.life",
      chainId: 968,
      accounts: [PRIVATE_KEY],
    },

    // BOT Chain Mainnet; real network, real BOT gas, real deployment
    botchainMainnet: {
      url: "https://rpc.botchain.ai",
      chainId: 677,
      accounts: [PRIVATE_KEY],
    },
  },
};
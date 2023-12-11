require("@nomiclabs/hardhat-waffle");
require('dotenv').config();


module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337
    },
    evmsidechain: {
      url: "https://rpc-evm-sidechain.xrpl.org", 
      chainId:  1440002,
      accounts: [process.env.PRIVATE_KEY],
    },

  },
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};

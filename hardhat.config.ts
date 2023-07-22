import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";
import "@openzeppelin/hardhat-upgrades";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomiclabs/hardhat-etherscan";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-abi-exporter";
import "hardhat-contract-sizer";
import "hardhat-finder";
import "@dlsl/hardhat-gobind";

import "./tasks/accounts";
import "./tasks/decode-data";
import "./tasks/grant-reward";
import "./tasks/redeem";

dotenv.config();

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          optimizer: { enabled: true, runs: 200 },
          outputSelection: {
            "*": {
              "*": [
                "storageLayout",
                "metadata",
                "devdoc",
                "userdoc",
                "evm.methodIdentifiers",
                "evm.gasEstimates",
              ],
            },
          },
        },
      },
    ],
  },
  defaultNetwork: "astraTestnet",
  networks: {
    hardhat: {
      gas: 20000000,
      gasPrice: 100000000000, // 50 Gwei
    },
    goerli: {
      url: process.env.GOERLI_URL || "",
      accounts: [process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY : ""],
      timeout: 8000000,
      gasPrice: 20000000000, // 50 Gwei
    },
    astra: {
      url: process.env.ASTRA_URL_PROD || "",
      accounts: [
        process.env.PRIVATE_KEY_PROD ? process.env.PRIVATE_KEY_PROD : "",
      ],
      timeout: 8000000,
      gasPrice: 2000000000000, // 20 Gwei
    },
    astraTestnet: {
      url: process.env.ASTRA_URL || "",
      accounts: [process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY : ""],
      timeout: 8000000,
      gasPrice: 2000000000000, // 20 Gwei
    },
  },
  gasReporter: {
    enabled: !!process.env.REPORT_GAS,
    currency: "USD",
  },
  abiExporter: {
    path: "./build/abi",
    clear: true,
    flat: true,
    spacing: 2,
  },
  gobind: {
    outdir: "./go-types/contract",
    deployable: false,
    runOnCompile: false,
    verbose: false,
    onlyFiles: ["contracts/reward-creator/Fund.sol"],
  },
  mocha: {
    timeout: 30000,
  },
  etherscan: {
    apiKey: {
      goerli: process.env.ETHERSCAN_API_KEY || "",
      astraTestnet: "abc",
      astra: "abc",
    },
    customChains: [
      {
        network: "astraTestnet",
        chainId: 11115,
        urls: {
          apiURL: "https://chainindexing.astranaut.dev/api",
          browserURL: "https://blockscout.astranaut.dev",
          // apiURL: "https://blockscout.astranaut.dev/api",
          // browserURL: "https://blockscout.astranaut.dev",
        },
      },
      {
        network: "astra",
        chainId: 11110,
        urls: {
          apiURL: process.env.EXPLORER_API_PROD || "",
          browserURL: process.env.EXPLORER_URL_PROD || "",
        },
      },
    ],
  },
};

export default config;

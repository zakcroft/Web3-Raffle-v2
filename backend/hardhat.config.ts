import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';

import '@typechain/hardhat';

import 'hardhat-deploy';
import 'hardhat-gas-reporter';
import { HardhatUserConfig } from 'hardhat/config';

import { config } from 'dotenv';
import 'solidity-coverage';

config({ path: '.env.local' });

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: '0.8.17',
      },
    ],
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      chainId: 1337,
    },
    seploia: {
      url: process.env.SEPOLIA_URL_INFURA,
      accounts: [process.env.DEV_1_PRIVATE_KEY],
      chainId: 11155111,
      blockConfirmations: 2,
    },
    bscTest: {
      url: process.env.BNB_TESTNET_RPC_URL_QUICKNODE,
      accounts: [process.env.DEV_1_PRIVATE_KEY],
      chainId: 97,
      blockConfirmations: 6,
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL,
      accounts: [process.env.PRODUCTION_PRIVATE_KEY],
      chainId: 1,
    },
  },
  etherscan: {
    apiKey: process.env.BSC_SCANNER_API_KEY,
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    outputFile: 'gas-report.txt',
    noColors: true,
    // coinmarketcap: process.env.COINMARKET_CAP_API_KEY,
    //token: "MATIC", // for polygon blockchain(optional).
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      default: 1,
    },
  },
  paths:{
    sources: './contracts',
    deploy: 'deploy'
  }
};

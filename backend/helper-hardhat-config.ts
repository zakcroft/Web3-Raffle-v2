import { BigNumber, ethers } from 'ethers';

export interface networkConfigItem {
  name: string;
  blockConfirmations?: number;
  vrfCoordinator?: string;
  subscriptionId?: number;
  gasLane?: string;
  callbackGasLimit?: number;
  tokenCost?: BigNumber;
  automationUpdateInterval?: number;
}

interface NetworkConfigType {
  [key: number]: networkConfigItem;
}

const tokenCost =  ethers.utils.parseUnits("0.1", "ether");

const networkConfig: NetworkConfigType = {
  31337: {
    name: 'localhost',
    subscriptionId: 9214,
    tokenCost,
    gasLane:
      '0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc', //this is mocked
    callbackGasLimit: 2500000,// 2500000 === maxGasLimit // cost 137501 ?
    automationUpdateInterval: 30,
  },
  4: {
    name: 'sepolia',
    vrfCoordinator: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
    subscriptionId: 9214,
    tokenCost,
    gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", //30 gwei
    callbackGasLimit: 100000,
    automationUpdateInterval: 30,
  },
  97: {
    name: 'bnbTest',
    vrfCoordinator: '0x6A2AAd07396B36Fe02a22b33cf443582f682c82f',
    subscriptionId: 1498,
    tokenCost,
    gasLane:
      '0xd4bb89654db74673a187bd804519e65e3f71a52bc55f11da7601a13dcf505314', //gasLaneRinkeby30
    callbackGasLimit: 100000,
    automationUpdateInterval: 1,
  },
};

const developmentChains: string[] = ['hardhat', 'localhost'];
const frontEndContractsFile =
  '../frontend/src/constants/contractAddresses.json';
const frontEndAbiFile = '../frontend/src/constants/abi.json';

export {
  networkConfig,
  developmentChains,
  frontEndContractsFile,
  frontEndAbiFile,
};

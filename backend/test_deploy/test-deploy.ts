import { developmentChains, networkConfig } from '../helper-hardhat-config';
import { network } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const deployMocks: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment,
) {
  // @ts-ignore
  const { deployments, getNamedAccounts, network, ethers } = hre;
  const { deploy, log } = deployments;
  const { deployer, player } = await getNamedAccounts();

  const BASE_FEE = ethers.utils.parseEther('0.25'); //Premium	0.25 LINK
  const GAS_PRICE_LINK = 1e9; //1000000000

  const chainId = network.config.chainId;
  const helperNetworkConfig = networkConfig[chainId as number];

  let vrfCoordinatorV2Mock, subscriptionId;

  const { gasLane, callbackGasLimit, automationUpdateInterval } =
    helperNetworkConfig;

  if (developmentChains.includes(network.name)) {
    log('Deploying mocks...');
    await deploy('VRFCoordinatorV2Mock', {
      contract: 'VRFCoordinatorV2Mock',
      from: deployer,
      log: true,
      args: [BASE_FEE, GAS_PRICE_LINK],
    });
    vrfCoordinatorV2Mock = await ethers.getContract('VRFCoordinatorV2Mock');
    const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
    const transactionReceipt = await transactionResponse.wait();
    subscriptionId = transactionReceipt.events[0].args.subId;
  }

  const raffleNFTTEST = await deploy('RaffleNFTTEST', {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });

  const raffleTEST = await deploy('RaffleTEST', {
    from: deployer,
    args: [
      raffleNFTTEST.address,
      vrfCoordinatorV2Mock.address,
      gasLane,
      callbackGasLimit,
      automationUpdateInterval,
    ],
    log: true,
    waitConfirmations: 1,
  });

  const RaffleTESTDeployed = await ethers.getContract('RaffleTEST');
  const RaffleNFTTESTDeployed = await ethers.getContract('RaffleNFTTEST');
  console.log(
    'RaffleNFTTESTDeployed s_owner',
    await RaffleNFTTESTDeployed.s_owner(),
  );

  if (developmentChains.includes(network.name)) {
    await vrfCoordinatorV2Mock.addConsumer(
      subscriptionId,
      RaffleTESTDeployed.address,
    );
    const VRF_MOCK_FUND_AMOUNT = '1000000000000000000000';
    await vrfCoordinatorV2Mock.fundSubscription(
      subscriptionId,
      VRF_MOCK_FUND_AMOUNT,
    );
  }

  console.log('RaffleNFTTESTDeployed address', RaffleNFTTESTDeployed.address);
  console.log('RaffleTESTDeployed address', RaffleTESTDeployed.address);
  console.log('Owner address', deployer);
  console.log('Player address', player);
  //RaffleTESTDeployed.makeNFT();

  const checkData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(''));
  //const { triggerRaffleDaw } = await RaffleTESTDeployed.callStatic.checkUpkeep(checkData);
  const tx = await RaffleTESTDeployed.performUpkeep(checkData);
  const txReceipt = await tx.wait(1);

  const requestId = txReceipt.events![2].args!.requestId;
  console.log(`Performed upkeep with RequestId: ${requestId}`);

  log('Local network detected! Deploying mocks...');
};

export default deployMocks;

deployMocks.tags = ['all', 'RaffleTEST', 'RaffleNFTTEST'];

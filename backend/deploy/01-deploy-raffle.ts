import { developmentChains, networkConfig } from '../helper-hardhat-config';
import { network } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

import { verify } from '../utils/verify';

const deployRaffle: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment,
) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network, ethers } = hre;
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  const VRF_MOCK_FUND_AMOUNT = '1000000000000000000000';

  console.log('NETWORK ++++', network.name);

  const helperNetworkConfig = networkConfig[chainId as number] || {};

  let vrfCoordinatorV2Mock, vrfCoordinatorV2Address, subscriptionId;

  // mock vrfCoordinatorV2
  if (developmentChains.includes(network.name)) {
    vrfCoordinatorV2Mock = await ethers.getContract('VRFCoordinatorV2Mock');
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;

    const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
    const transactionReceipt = await transactionResponse.wait();

    // console.log('transactionResponse===', transactionResponse);
    // console.log('transactionReceipt===', transactionReceipt);

    subscriptionId = transactionReceipt.events[0].args.subId;
    console.log('subscriptionId===', subscriptionId.toString());
  } else {
    // using test and main network
    vrfCoordinatorV2Address = helperNetworkConfig['vrfCoordinator']!;
    subscriptionId = helperNetworkConfig['subscriptionId']!;
  }

  log('----------------------------------------------------');
  log('Deploying Raffle and waiting for confirmations...');

  const { tokenCost, gasLane, callbackGasLimit, automationUpdateInterval } =
    helperNetworkConfig;

  console.log('entranceFee', tokenCost?.toString());
  const _MAX_COINS = 1000000;
  const _INIT_SALES_ALLOCATION = 1000;

  // RAFFLE TOKEN
  const raffleTokenDeployObject = await deploy('RaffleToken', {
    from: deployer,
    args: [_MAX_COINS],
    log: true,
    // @ts-ignore
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log(`RaffleToken deployed at ${raffleTokenDeployObject.address}`);

  // RAFFLE
  const args = [
    raffleTokenDeployObject.address,
    vrfCoordinatorV2Address,
    subscriptionId,
    tokenCost,
    gasLane,
    callbackGasLimit,
    automationUpdateInterval,
  ];

  const raffleDeployObject = await deploy('Raffle', {
    from: deployer,
    args,
    log: true,
    // @ts-ignore
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  //Ways to get contract instance

  // 1: Get contract, instantiate and deploy
  // const Token = await ethers.getContractFactory("RaffleToken");
  // const tokenDeployed = await Token.deploy(_MAX_COINS);
  //  log(`1: tokenDeployed `, tokenDeployed);

  // 2: Get contract, attach deployed instance address and no need to deploy
  // const Token = await ethers.getContractFactory("RaffleToken");
  // const tokenLinkedToDeployedInstance = Token.attach(RaffleToken.address);
  //  log(`2: tokenLinkedToDeployedInstance `, tokenLinkedToDeployedInstance);

  // 3: Get contract and attach with deployed instance in one go using getContractAt
  // const tokenLinkedToDeployedInstance = await ethers.getContractAt("RaffleToken", RaffleToken.address);
  // log(`3: deployed tokenLinkedToDeployedInstance `, tokenLinkedToDeployedInstance);

  const raffleTokenDeployed = await ethers.getContractAt(
    'RaffleToken',
    raffleTokenDeployObject.address,
  );
  //log(`raffleToken`, raffleTokenDeployed);

  await raffleTokenDeployed.transfer(
    raffleDeployObject.address,
    _INIT_SALES_ALLOCATION,
  );
  log(
    `raffleToken.transfer to raffle _INIT_SALES_ALLOCATION ...`,
    raffleDeployObject.address,
    _INIT_SALES_ALLOCATION,
  );

  log(`deployer`, deployer);
  const ownerBalance = await raffleTokenDeployed.balanceOf(deployer);
  const raffleBalance = await raffleTokenDeployed.balanceOf(
    raffleDeployObject.address,
  );
  log(`ownerBalance`, ownerBalance.toString());
  log(`raffleBalance`, raffleBalance.toString());

  const raffle = await ethers.getContract('Raffle');

  if (developmentChains.includes(network.name)) {
    await vrfCoordinatorV2Mock.addConsumer(subscriptionId, raffle.address);

    const added = await vrfCoordinatorV2Mock.consumerIsAdded(
      subscriptionId,
      raffle.address,
    );
    log(`raffle`, raffle.address);
    log(`added Consumer`, added);

    await vrfCoordinatorV2Mock.fundSubscription(
      subscriptionId,
      VRF_MOCK_FUND_AMOUNT,
    );
  }

  if (
    !developmentChains.includes(network.name) &&
    process.env.BSC_SCANNER_API_KEY
  ) {
    await verify(raffleDeployObject.address, args);
  }

  log(`Verifying done for raffleDeployObject... ${raffleDeployObject.address}`);
  log(` Raffle... ${raffle.address}`);
};

export default deployRaffle;

deployRaffle.tags = ['all', 'Raffle', 'RaffleToken'];

import { ethers, network } from 'hardhat';

import { BigNumber } from 'ethers';

import { Raffle, VRFCoordinatorV2Mock } from '../typechain-types';

async function mockKeepers() {
  const raffle: Raffle = await ethers.getContract('Raffle');
  console.log('Running mockKeepers with raffle.address', raffle.address);
  const checkData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(''));
  const { triggerRaffleDaw } = await raffle.callStatic.checkUpkeep(checkData);
  if (triggerRaffleDaw) {
    const tx = await raffle.performUpkeep(checkData);
    const txReceipt = await tx.wait(1);

    const requestId = txReceipt.events![2].args!.requestId;
    console.log(`Performed upkeep with RequestId: ${requestId}`);

    if (network.config.chainId == 31337) {
      await mockVrf(requestId, raffle);
    }
  } else {
    console.log('Not enough time has passed');
    console.log('Last draw', (await raffle.getLastDrawTimeStamp()).toString());
    console.log('Next draw', (await raffle.getNextDrawTimeStamp()).toString());
    console.log(
      'Difference',
      (await raffle.getCountDownToDrawTimeStamp()).toString(),
    );
  }
}

async function mockVrf(requestId: BigNumber, raffle: Raffle) {
  const vrfCoordinatorV2Mock: VRFCoordinatorV2Mock = await ethers.getContract(
    'VRFCoordinatorV2Mock',
  );
  await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, raffle.address);

  const recentWinner = await raffle.getLastWinner();
  console.log(`The winner is: ${recentWinner}`);
}

mockKeepers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

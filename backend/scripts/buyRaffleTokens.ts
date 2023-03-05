import { ethers, getNamedAccounts } from 'hardhat';

import { BigNumber } from 'ethers';

import { logStats } from './logStats';

async function buyRaffleTokens() {
  const accounts = await getNamedAccounts();
  const player = accounts.player;

  await logStats('START OF BUY RAFFLE TOKENS');

  const raffle = await ethers.getContract('Raffle', player);

  const tokenCost = await raffle.getTokenCost();
  console.log('Token Cost ETH', ethers.utils.formatEther(tokenCost.toString()));

  // buy 5 tokens
  const amountToBuy = 5;
  const tokensToBuy = BigNumber.from(tokenCost.mul(amountToBuy));
  await raffle.buyRaffleTokens({ value: tokensToBuy });

  console.log(
    `Bought ${amountToBuy} Raffle Tokens Cost ETH:`,
    ethers.utils.formatEther(tokensToBuy.toString()),
  );

  await logStats('END OF BUY RAFFLE TOKENS')
}

buyRaffleTokens()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

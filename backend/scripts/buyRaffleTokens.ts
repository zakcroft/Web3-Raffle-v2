import { ethers, getNamedAccounts } from 'hardhat';

import { BigNumber } from 'ethers';

async function buyRaffleTokens() {
  const accounts = await getNamedAccounts();
  const owner = accounts.deployer;
  const player = accounts.player;

  console.log('Raffle contract owner', owner);
  console.log('Player buying RaffleTokens', player);

  const raffle = await ethers.getContract('Raffle', player);
  const raffleToken = await ethers.getContract('RaffleToken', player);

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

  const tokenBalance = await raffleToken.balanceOf(player);
  console.log('RaffleToken contract balance:', tokenBalance.toString());
}

buyRaffleTokens()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

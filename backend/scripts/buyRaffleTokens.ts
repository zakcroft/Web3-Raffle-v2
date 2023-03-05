import { ethers, getNamedAccounts } from 'hardhat';

import { BigNumber } from 'ethers';

async function buyRaffleTokens() {
  const accounts = await getNamedAccounts();
  const owner = accounts.deployer;
  const player = accounts.player;

  const raffle = await ethers.getContract('Raffle', player);

  const raffleToken = await ethers.getContract('RaffleToken', player);

  console.log('buyRaffleTokens');
  const tokenCost = await raffle.getTokenCost();
  console.log('tokenCost!', tokenCost.toString());

  // buy 10 tokens
  const tokensToBuy = BigNumber.from(tokenCost.mul(10));
  await raffle.buyRaffleTokens({ value: tokensToBuy });
  console.log('Bought Raffle Tokens', tokensToBuy.toString());

  const amountToEnter = BigNumber.from('3');
  console.log('owner', owner);
  console.log('player', player);

  // approve the raffle to spend the tokens
  await raffleToken.increaseAllowance(raffle.address, amountToEnter.toString());

  const allowanceSet = await raffleToken.allowance(player, raffle.address);

  await raffle.enterRaffle(amountToEnter);
  console.log('Entered Raffle with ', allowanceSet.toString(), ' token(s)');
}

buyRaffleTokens()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

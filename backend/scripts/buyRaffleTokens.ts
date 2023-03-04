import { ethers, getNamedAccounts } from 'hardhat';

import { BigNumber } from 'ethers';

async function buyRaffleTokens() {
  const accounts = await getNamedAccounts();
  const owner = accounts.deployer;
  const player = accounts.player;

  console.log('buyRaffleTokens');
  const raffle = await ethers.getContract('Raffle', player);
  const raffleToken = await ethers.getContract('RaffleToken', player);
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

  const deployerConnectedContract = raffle.connect(owner);
  const winnings = await deployerConnectedContract.pickWinner([0x1]);
  console.log('winner', winnings);
}

buyRaffleTokens()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

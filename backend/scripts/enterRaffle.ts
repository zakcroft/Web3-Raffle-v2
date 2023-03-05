import { ethers, getNamedAccounts } from 'hardhat';

import { BigNumber } from 'ethers';

async function enterRaffle() {
  const accounts = await getNamedAccounts();
  const owner = accounts.deployer;
  const player = accounts.player;

  console.log('Raffle contract owner', owner);
  console.log('Player entering RaffleTokens', player);

  const raffle = await ethers.getContract('Raffle', player);
  const raffleToken = await ethers.getContract('RaffleToken', player);

  const amountToEnter = BigNumber.from('3');

  // Approve the raffle to spend the tokens
  await raffleToken.increaseAllowance(raffle.address, amountToEnter.toString());

  const allowanceSet = await raffleToken.allowance(player, raffle.address);

  await raffle.enterRaffle(amountToEnter);

  console.log(
    'Entered Raffle contract with',
    allowanceSet.toString(),
    'token(s)',
  );

  const tokenBalanceAfterAllowances = await raffleToken.balanceOf(player);
  console.log(
    'New RaffleToken contract balance:',
    tokenBalanceAfterAllowances.toString(),
  );

  const raffleBalance = await raffle.getPlayerBalance(player);
  console.log('Updated Raffle contract balance:', raffleBalance.toString());
}

enterRaffle()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

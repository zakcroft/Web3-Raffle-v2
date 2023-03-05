import { ethers, getNamedAccounts } from 'hardhat';

export async function logStats(msg?: string) {
  const accounts = await getNamedAccounts();
  const owner = accounts.deployer;
  const player = accounts.player;

  const raffle = await ethers.getContract('Raffle', owner);
  const raffleToken = await ethers.getContract('RaffleToken', owner);

  console.log(msg, ':STATS =======================================================');

  // Token
  console.log('=== RaffleToken ===');
  console.log('RaffleToken address balance', (await ethers.provider.getBalance(raffle.address)).toString());
  console.log('Owner RaffleToken balance:', (await raffleToken.balanceOf(owner)).toString());
  console.log('Player RaffleToken balance:', (await raffleToken.balanceOf(player)).toString());

  // Raffle
  console.log('=== Raffle ===');
  console.log('Raffle state', (await raffle.getRaffleState()).toString());
  console.log('Raffle address balance', (await ethers.provider.getBalance(raffle.address)).toString());
  console.log('Raffle player balance', (await raffle.getPlayerBalance(player)).toString());

  // Owner and player
  console.log('=== Owner and player ===');
  console.log('Owner address', owner);
  console.log('Owner address balance', (await ethers.provider.getBalance(owner)).toString());
  console.log('Player address', player);
  console.log('Player address balance', (await ethers.provider.getBalance(player)).toString());

  console.log('END ==============================================================');
}

// logStats()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });

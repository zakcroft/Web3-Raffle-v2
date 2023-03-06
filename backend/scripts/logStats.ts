import { ethers, getNamedAccounts } from 'hardhat';

export async function logStats(msg?: string) {
  const accounts = await getNamedAccounts();
  const owner = accounts.deployer;
  const player = accounts.player;

  const raffle = await ethers.getContract('Raffle', owner);
  const raffleToken = await ethers.getContract('RaffleToken', owner);

  const format = (v:string) => {
    const units = ethers.utils.formatUnits(v, 'ether').toString()
    return ethers.utils.commify(units)
  }
  const getBalance = async (address:string) => {
    const v = (await ethers.provider.getBalance(address)).toString()
    return format(v)
  }

  console.log('*******************************************************************');
  console.log(msg, 'BELOW =======================================================');

  console.log('=== Base Stats ===');
  console.log('Game ID', (await raffle.getGameID()).toString());
  console.log('Raffle state', (await raffle.getRaffleState()).toString());
  console.log('Token Cost ETH', format((await raffle.getTokenCost()).toString()));
  console.log('Last draw', (await raffle.getLastDrawTimeStamp()).toString());
  console.log('Next draw', (await raffle.getNextDrawTimeStamp()).toString());
  console.log('Countdown to draw ms', (await raffle.getCountDownToDrawTimeStamp()).toString());

  // Owner and player
  console.log('=== Owner and player ===');
  console.log('Owner address', owner);
  console.log('Owner balance', (await getBalance(owner)).toString());
  console.log('Player address', player);
  console.log('Player balance', (await getBalance(player)).toString());

  // Token
  console.log('=== RaffleToken ===');
  console.log('RaffleToken address balance', (await getBalance(raffleToken.address)).toString());
  console.log('Owner RaffleToken balance:', (await raffleToken.balanceOf(owner)).toString());
  console.log('Player RaffleToken balance:', (await raffleToken.balanceOf(player)).toString());
  console.log('Player RaffleToken balance:', (await raffleToken.balanceOf(player)).toString());

  // Raffle
  console.log('=== Raffle ===');
  console.log('Raffle address balance', (await getBalance(raffle.address)).toString());
  console.log('Raffle player balance', (await raffle.getPlayerBalance(player)).toString());

  console.log('END ==============================================================');
  console.log('*******************************************************************');
}

// logStats()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });

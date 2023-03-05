import { ethers, getNamedAccounts } from 'hardhat';

async function getEndGameInfo() {
  const accounts = await getNamedAccounts();
  const owner = accounts.deployer;
  const player = accounts.player;

  const raffle = await ethers.getContract('Raffle', owner);
  const raffleToken = await ethers.getContract('RaffleToken', owner);

  const ownerTokenBalance = await raffleToken.balanceOf(owner);
  console.log('Owner final RaffleToken contract balance:', ownerTokenBalance.toString());

  const playerTokenBalance = await raffleToken.balanceOf(player);
  console.log('Player final RaffleToken contract balance:', playerTokenBalance.toString());

  const state = await raffle.getRaffleState();
  console.log('Raffle state', state.toString());

  const raffleContractBalance = await ethers.provider.getBalance(raffle.address)
  console.log('Raffle contract balance', raffleContractBalance.toString());

  console.log('Raffle player balance', (await raffle.getPlayerBalance(player)).toString());

}

getEndGameInfo()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

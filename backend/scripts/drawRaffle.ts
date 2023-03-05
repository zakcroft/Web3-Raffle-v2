import { ethers, getNamedAccounts } from 'hardhat';

async function drawRaffle() {
  const accounts = await getNamedAccounts();
  const owner = accounts.deployer;

  const raffle = await ethers.getContract('Raffle', owner);
  const winnings = await raffle.pickWinner([0x1]);
  console.log('winner', winnings);
}

drawRaffle()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

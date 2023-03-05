import { ethers, getNamedAccounts } from 'hardhat';

async function openRaffle() {
  const accounts = await getNamedAccounts();
  const owner = accounts.deployer;

  console.log('Opening raffle');

  const raffle = await ethers.getContract('Raffle', owner);
  await raffle.openRaffle();

  console.log('Raffle open');
}

openRaffle()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

import { ethers } from 'hardhat';

async function enterRaffle() {
  console.log('Entering Raffle!');
  const raffle = await ethers.getContract('Raffle');
  const entranceFee = await raffle.getEntranceFee();
  console.log('Entrance Fee!', entranceFee.toString());
  await raffle.enterRaffle({ value: entranceFee + 1 });
  console.log('Entered!');
}

enterRaffle()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

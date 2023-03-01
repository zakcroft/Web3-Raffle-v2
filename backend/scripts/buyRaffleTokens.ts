import { ethers } from 'hardhat';

async function buyRaffleTokens() {
  console.log('buyRaffleTokens');
  const raffle = await ethers.getContract('Raffle');
  const entranceFee = await raffle.getEntranceFee();
  console.log('Entrance Fee!', entranceFee.toString());

  await raffle.buyRaffleTokens({ value: entranceFee + 1 });
  console.log('Bought Raffle Tokens');
}

buyRaffleTokens()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

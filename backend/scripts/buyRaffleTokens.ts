import { ethers } from 'hardhat';
import { BigNumber } from "ethers";

async function buyRaffleTokens() {
  console.log('buyRaffleTokens');
  const raffle = await ethers.getContract('Raffle');
  const tokenCost = await raffle.getTokenCost();
  console.log('tokenCost!', tokenCost.toString());
  console.log('tokenCos2!',BigNumber.from(tokenCost.mul(10)).toString());
  // buy 10 tokens
  await raffle.buyRaffleTokens({ value: BigNumber.from(tokenCost.mul(10))   });
  console.log('Bought Raffle Tokens');
}

buyRaffleTokens()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

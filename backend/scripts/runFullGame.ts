import { storeNFTDir } from '../deploy/uploadToNftStorage';
import { buyRaffleTokens } from './buyRaffleTokens';
import { enterRaffle } from './enterRaffle';
import { vrfDrawRaffle } from './vrfDrawRaffle';

async function runFullGame() {
  // await buyRaffleTokens();
  // await buyRaffleTokens();
  // await enterRaffle();
  // setTimeout(async () => {
  //   await vrfDrawRaffle();
  // }, 5000);
  await storeNFTDir();
}

runFullGame()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

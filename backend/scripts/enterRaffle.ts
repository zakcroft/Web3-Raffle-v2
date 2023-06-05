import { ethers, getNamedAccounts } from "hardhat";

import { BigNumber } from "ethers";

import { logStats } from "./logStats";

export async function enterRaffle() {
  const accounts = await getNamedAccounts();
  const player = accounts.player;

  const raffle = await ethers.getContract("Raffle", player);
  const raffleToken = await ethers.getContract("RaffleToken", player);

  const amountToEnter = BigNumber.from("10");

  // Approve the raffle to spend the tokens
  await raffleToken.increaseAllowance(raffle.address, amountToEnter.toString());

  const allowanceSet = await raffleToken.allowance(player, raffle.address);

  await raffle.enterRaffle(amountToEnter);

  console.log(
    "Entered Raffle contract with",
    allowanceSet.toString(),
    "token(s)"
  );

  await logStats("After enter");
}

enterRaffle()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

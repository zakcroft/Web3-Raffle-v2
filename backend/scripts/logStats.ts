import { ethers, getNamedAccounts } from "hardhat";

export async function logStats(msg?: string, run = true) {
  const accounts = await getNamedAccounts();
  const owner = accounts.deployer;
  const player = accounts.player;

  const raffle = await ethers.getContract("Raffle");
  const raffleToken = await ethers.getContract("RaffleToken");
  const raffleNFT = await ethers.getContract("RaffleNFT");

  const format = (v: string) => {
    const units = ethers.utils.formatUnits(v, "ether").toString();
    return ethers.utils.commify(units);
  };
  const getBalance = async (address: string) => {
    const v = (await ethers.provider.getBalance(address)).toString();
    return format(v);
  };

  if (!run) return;

  console.log(
    "*******************************************************************"
  );
  console.log(
    msg,
    "BELOW ======================================================="
  );

  console.log("=== Addresses ===");
  console.log("Raffle address", raffle.address);
  console.log("RaffleToken address", raffleToken.address);
  console.log("RaffleNFT address", raffleNFT.address);
  console.log("Owner address", owner);
  console.log("Player address", player);

  console.log("=== Base Stats ===");
  console.log("Game ID", (await raffle.getGameID()).toString());
  console.log("Raffle state", (await raffle.getRaffleState()).toString());
  console.log("Number of players", (await raffle.getNumberOfPlayers()).toString());
  console.log(
    "Token Cost ETH",
    format((await raffle.getTokenCost()).toString())
  );
  console.log("Last draw", (await raffle.getLastDrawTimeStamp()).toString());
  console.log("Next draw", (await raffle.getNextDrawTimeStamp()).toString());
  console.log(
    "Latest block timestamp",
    (await ethers.provider.getBlock("latest")).timestamp
  );
  console.log(
    "Countdown to draw s",
    (await raffle.getCountDownToDrawTimeStamp()).toString()
  );

  // Owner and player
  console.log("=== Balances ===");
  console.log("Owner balance", (await getBalance(owner)).toString());
  console.log("Player balance", (await getBalance(player)).toString());
  console.log("=== Raffle ===");
  console.log(
    "Raffle address balance",
    (await getBalance(raffle.address)).toString()
  );
  console.log(
    "Raffle player balance",
    (await raffle.getPlayerBalance(player)).toString()
  );

  console.log("=== RaffleToken ===");
  console.log(
    "RaffleToken address balance",
    (await getBalance(raffleToken.address)).toString()
  );
  console.log(
    "RaffleToken Raffle balance:",
    (await raffleToken.balanceOf(raffle.address)).toString()
  );
  console.log(
    "RaffleToken Owner balance:",
    (await raffleToken.balanceOf(owner)).toString()
  );
  console.log(
    "RaffleToken Player balance:",
    (await raffleToken.balanceOf(player)).toString()
  );

  // Closed
  if ((await raffle.getRaffleState()) === 2) {
    console.log("Total supply", (await raffleNFT.totalSupply()).toString());

    console.log(
      "RaffleNFT winner tokenURI",
      (await raffleNFT.getLastMintedTokenUri()).toString()
    );
    console.log(
      "End game gas cost",
      (await raffle.getEndGameGasCost()).toString()
    );

    console.log(
      "Mint gas costs",
      (await raffleNFT.getMintGasCost()).toString()
    );
    console.log(
      "Total supply of NFTs awarded",
      (await raffleNFT.totalSupply()).toString()
    );
  }

  console.log(
    "END =============================================================="
  );
  console.log(
    "*******************************************************************"
  );
}

const {
  frontEndContractsFile,
  frontEndRaffleAbiFile,
  frontEndRaffleTokenAbiFile,
} = require("../helper-hardhat-config");
const fs = require("fs");
const { network, ethers } = require("hardhat");

module.exports = async () => {
  if (process.env.UPDATE_FRONT_END) {
    console.log("Writing to front end...");
    await updateContractAddresses();
    await updateAbi();
    console.log("Front end written!");
  }
};

async function updateAbi() {
  const raffle = await ethers.getContract("Raffle");
  const raffleToken = await ethers.getContract("RaffleToken");
  fs.writeFileSync(
    frontEndRaffleAbiFile,
    raffle.interface.format(ethers.utils.FormatTypes.json)
  );
  fs.writeFileSync(
    frontEndRaffleTokenAbiFile,
    raffleToken.interface.format(ethers.utils.FormatTypes.json)
  );
}

async function updateContractAddresses() {
  const raffle = await ethers.getContract("Raffle");
  const raffleToken = await ethers.getContract("RaffleToken");
  const contractAddresses = JSON.parse(
    fs.readFileSync(frontEndContractsFile, "utf8")
  );
  if (network.config.chainId.toString() in contractAddresses) {
    if (
      !contractAddresses[network.config.chainId.toString()].includes(
        raffle.address
      )
    ) {
      contractAddresses[network.config.chainId.toString()].push(raffle.address);
    }
    if (
      !contractAddresses[network.config.chainId.toString()].includes(
        raffleToken.address
      )
    ) {
      contractAddresses[network.config.chainId.toString()].push(
        raffleToken.address
      );
    }
  } else {
    contractAddresses[network.config.chainId.toString()] = [
      raffle.address,
      raffleToken.address,
    ];
  }
  fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses));
}
module.exports.tags = ["all", "frontend"];

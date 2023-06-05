import * as path from "path";

const { frontEndContractsFile } = require("../helper-hardhat-config");
const fs = require("fs");
const { network, ethers, artifacts } = require("hardhat");

module.exports = async () => {
  if (process.env.UPDATE_FRONT_END) {
    console.log("Writing to front end...");
    await updateContractAddresses();
    await saveAbi("Raffle");
    await saveAbi("RaffleToken");
    console.log("Front end written!");
  }
};

const fileExists = async (path: string) => {
  try {
    await fs.promises.stat(path);
    return true;
  } catch (error) {
    return false;
  }
};

function lowercaseFirstLetter(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

const saveAbi = async (smartContractName: string) => {
  // Check if abi dir exists
  const pathToDir = path.join(__dirname, "../../", `frontend/src/abis`);
  if (!(await fileExists(pathToDir))) {
    try {
      await fs.promises.mkdir(pathToDir);
      console.log("Directory created successfully!");
    } catch (err) {
      console.error(err);
    }
  }

  // Get artifact
  const artifact = await artifacts.readArtifact(smartContractName);

  const name = `${lowercaseFirstLetter(artifact.contractName)}Abi`;
  // Check if the abi file with the given name Smart Contract exists
  const pathToFile = path.join(pathToDir, `${name}.ts`);

  // Remove file if exists
  if (await fileExists(pathToFile)) {
    try {
      await fs.promises.rm(pathToFile);
      console.log("Removed file successfully!");
    } catch (err) {
      console.error(err);
    }
  }

  // Create new file and save new abi
  await fs.promises.writeFile(
    pathToFile,
    `export const ${name} = ${JSON.stringify(artifact.abi)} as const;`
  );
};

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

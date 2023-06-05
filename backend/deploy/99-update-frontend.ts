import * as path from "path";

const fs = require("fs");
const { network, ethers, artifacts } = require("hardhat");

module.exports = async () => {
  if (process.env.UPDATE_FRONT_END) {
    console.log("Writing to front end...");
    await saveAbi("Raffle");
    await saveAbi("RaffleToken");
    await updateContractAddresses();
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

async function createDirIfNotExist(pathToDir: string) {
  if (!(await fileExists(pathToDir))) {
    try {
      await fs.promises.mkdir(pathToDir);
      console.log("Directory created successfully!");
    } catch (err) {
      console.error(err);
    }
  }
}

function lowercaseFirstLetter(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

async function removeFileIfExists(pathToFile: string) {
  if (await fileExists(pathToFile)) {
    try {
      await fs.promises.rm(pathToFile);
      console.log("Removed file successfully!");
    } catch (err) {
      console.error(err);
    }
  }
}

const pathToDir = path.join(__dirname, "../../", `frontend/src/abis`);

const saveAbi = async (smartContractName: string) => {
  const artifact = await artifacts.readArtifact(smartContractName)
  const name = `${lowercaseFirstLetter(artifact.contractName)}Abi`;
  const pathToFile = path.join(pathToDir, `${name}.ts`);

  await createDirIfNotExist(pathToDir)
  await removeFileIfExists(pathToFile);

  await fs.promises.writeFile(
    pathToFile,
    `export const ${name} = ${JSON.stringify(artifact.abi)} as const;`
  );
};

async function updateContractAddresses() {
  const raffle = await ethers.getContract("Raffle");
  const raffleToken = await ethers.getContract("RaffleToken");

  const pathToFile = `${pathToDir}/contractAddresses.ts`;
  await removeFileIfExists(pathToFile);

  const contractAddresses = {};

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

  await fs.promises.writeFile(
    pathToFile,
    `export const contractAddresses = ${JSON.stringify(
      contractAddresses
    )} as const;`
  );
}
module.exports.tags = ["all", "frontend"];

import * as path from 'path';
import { filesFromPath } from 'files-from-path';
import { File, NFTStorage } from 'nft.storage';

const { network, deployments } = require('hardhat');

const { developmentChains } = require('../helper-hardhat-config');
const { verify } = require('../utils/verify');

const NFT_STORAGE_KEY = process.env.NFT_STORAGE || '';

async function storeNFTDir(directoryPath = './nft-resources') {
  const { log } = deployments;

  log('----------------------------------------------------');
  log('Uploading NFTs to storage...');

  const files = await filesFromPath(directoryPath, {
    pathPrefix: path.resolve(directoryPath),
  });

  const storage = new NFTStorage({ token: NFT_STORAGE_KEY });
  const responses = [];
  for await (let file of files) {
    const response = await storage.store({
      image: new File([file.stream()], file.name, { type: 'image/jpg' }),
      name: file.name,
      description: `An adorable ${file.name}`,
      attributes: [{ trait_type: 'cuteness', value: 100 }],
    });
    responses.push(response);
  }
  log('Done uploading...', responses);

  return responses;
}

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const tokenUris = await storeNFTDir();

  log('----------------------------------------------------');
  log('Deploying RaffleNFT...');
  const args = [tokenUris];
  const raffleNFT = await deploy('RaffleNFT', {
    from: deployer,
    args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  // Verify the deployment
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log('Verifying...');
    await verify(raffleNFT.address, args);
  }
};

module.exports.tags = ['all', 'RaffleNFT'];

import * as path from 'path';
import { File, Web3Storage, filesFromPath } from 'web3.storage';

const { network, deployments } = require('hardhat');

const { developmentChains } = require('../helper-hardhat-config');
const { verify } = require('../utils/verify');

const WEB3_STORAGE = process.env.WEB3_STORAGE || '';

const symbol = 'RAFFLE_WINNER';

async function storeNFTDir(directoryPath = './nft-resources') {
  const { log } = deployments;

  log('----------------------------------------------------');
  log('Uploading NFTs to storage...');

  const files = await filesFromPath(directoryPath, {
    pathPrefix: path.resolve(directoryPath),
  });

  const storage = new Web3Storage({ token: WEB3_STORAGE });
  const cids = [];
  for await (let file of files) {
    const fileNameWithExtension = file.name.replace('/', '');
    const fileNameWithExtensionLowerCase = fileNameWithExtension.toLowerCase();
    const name = fileNameWithExtension.split('.')[0];
    const nameLowerCase = name.toLowerCase();

    const createIpfsUrl = (cid, name) => `ipfs://${cid}/${name}`;

    const cid = await storage.put([
      { ...file, name: fileNameWithExtensionLowerCase },
    ]);
    const image = createIpfsUrl(cid, fileNameWithExtensionLowerCase);

    // meta
    const metaBuffer = Buffer.from(
      JSON.stringify({
        image,
        name,
        symbol,
        description: `Raffle winning NFT name: ${name}`,
        attributes: [{ game_outcome: 'winner', value: 100 }],
      }),
    );

    const metaCid = await storage.put([
      new File([metaBuffer], `${nameLowerCase}.json`),
    ]);
    const metaIpfsUrl = createIpfsUrl(metaCid, `${nameLowerCase}.json`);
    cids.push(metaIpfsUrl);
  }
  log('Done uploading...', cids);
  log(
    'TokenUri mapping',
    cids.map((cid) => cid),
  );

  return cids.map((cid) => cid);
}

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const tokenUris = await storeNFTDir();

  log('----------------------------------------------------');
  log('Deploying RaffleNFT...');

  const args = ['RaffleERC721', symbol, tokenUris];
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

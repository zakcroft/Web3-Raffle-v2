const { assert } = require('chai');
const { network, deployments, ethers } = require('hardhat');
const { developmentChains } = require('../helper-hardhat-config');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('Raffle NFT', function () {
      let raffleNFT, accounts, deployer, player;

      beforeEach(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        player = accounts[1];
        await deployments.fixture(['RaffleNFT']);
        raffleNFT = await ethers.getContract('RaffleNFT');
      });

      describe('init', () => {
        it('Initializes the NFT Correctly.', async () => {
          const DEFAULT_ADMIN_ROLE = '0x00';
          const MINTER_ROLE = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes('MINTER_ROLE'),
          );
          const name = await raffleNFT.name();
          const symbol = await raffleNFT.symbol();
          const owner = await raffleNFT.getOwner();
          const tokenCounter = await raffleNFT.getTokenCounter();
          const tokenUri = await raffleNFT.getTokenUri(0);

          assert.equal(name, 'RaffleERC721');
          assert.equal(symbol, 'RAFFLE_WINNER');
          assert.equal(owner, deployer.address);

          // roles
          assert(raffleNFT.hasRole(DEFAULT_ADMIN_ROLE, deployer.address));
          assert(raffleNFT.hasRole(MINTER_ROLE, deployer.address));

          // uris
          assert.equal(tokenCounter, 0);
          assert(tokenUri.startsWith('ipfs://'));
        });
      });

      describe('Mint', () => {
        it('Mints Random NFT Correctly.', async () => {
          const rnd = 2;
          await raffleNFT.mintNft(player.address, rnd);
          const expectedTokenUri = await raffleNFT.getTokenUri(rnd);
          const to = await raffleNFT.ownerOf(0);
          const actualMintedTokenUri = await raffleNFT.getLastMintedTokenUri();
          const counter = await raffleNFT.getTokenCounter();

          assert.equal(to, player.address);
          assert.equal(actualMintedTokenUri, expectedTokenUri);
          assert.equal(counter, 1);
        });
      });
    });

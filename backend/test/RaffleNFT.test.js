const { assert } = require('chai');
const { network, deployments, ethers } = require('hardhat');
const { developmentChains } = require('../helper-hardhat-config');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('Raffle NFT', function () {
      let raffleNFT, accounts, deployer;

      beforeEach(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        await deployments.fixture(['RaffleNFT']);
        raffleNFT = await ethers.getContract('RaffleNFT');
      });

      describe('init', () => {
        it('Initializes the NFT Correctly.', async () => {
          const DEFAULT_ADMIN_ROLE = '0x00';
          const MINTER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MINTER_ROLE'));
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

    // describe('Mint', () => {
    //   it('Mints NFT Correctly.', async () => {
    //     const name = await raffleNFT.mintNft();
    //     const symbol = await raffleNFT.symbol();
    //     const owner = await raffleNFT.getOwner();
    //     const tokenCounter = await raffleNFT.getTokenCounter();
    //     const tokenUri = await raffleNFT.getTokenUri(0);
    //     assert.equal(name, 'RaffleERC721');
    //     assert.equal(symbol, 'RAFFLE_WINNER');
    //     assert.equal(owner, deployer.address);
    //     assert.equal(tokenCounter, 0);
    //     assert(tokenUri.startsWith('ipfs://'));
    //   });
    // });

      // describe("Mint NFT", () => {
      //   beforeEach(async () => {
      //       const txResponse = await basicNft.mintNft()
      //       await txResponse.wait(1)
      //   })
      //   it("Allows users to mint an NFT, and updates appropriately", async function () {
      //       const tokenURI = await basicNft.tokenURI(0)
      //       const tokenCounter = await basicNft.getTokenCounter()
      //
      //       assert.equal(tokenCounter.toString(), "1")
      //       assert.equal(tokenURI, await basicNft.TOKEN_URI())
      //   })
      //   it("Show the correct balance and owner of an NFT", async function () {
      //       const deployerAddress = deployer.address;
      //       const deployerBalance = await basicNft.balanceOf(deployerAddress)
      //       const owner = await basicNft.ownerOf("0")
      //
      //       assert.equal(deployerBalance.toString(), "1")
      //       assert.equal(owner, deployerAddress)
      //   })
      // })
    });

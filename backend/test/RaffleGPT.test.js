const { expect } = require("chai");

describe("Raffle Contract", function () {
  let RaffleContract, raffleContract, Token, token, owner, addr1, addr2, addr3;

  beforeEach(async function () {
    // Deploy your ERC20 Token contract
    Token = await ethers.getContractFactory("YourToken");
    token = await Token.deploy("Your Token", "SYM");
    await token.deployed();

    // Deploy your Raffle contract
    RaffleContract = await ethers.getContractFactory("Raffle");
    raffleContract = await RaffleContract.deploy(token.address);
    await raffleContract.deployed();

    [owner, addr1, addr2, addr3] = await ethers.getSigners();
  });

  describe("buyRaffleTokens()", function () {
    it("should buy raffle tokens correctly", async function () {
      // Setup initial conditions
      const initialTokens = ethers.utils.parseUnits("1000", "wei");
      await token.transfer(raffleContract.address, initialTokens);

      // Execute buyRaffleTokens()
      const tokenCost = await raffleContract.i_tokenCost();
      const purchaseValue = tokenCost.mul(2);
      await raffleContract.connect(addr1).buyRaffleTokens({ value: purchaseValue });

      // Check the results
      const addr1Balance = await token.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(2);

      const contractBalance = await token.balanceOf(raffleContract.address);
      expect(contractBalance).to.equal(initialTokens.sub(2));

      const addr1EtherBalance = await ethers.provider.getBalance(addr1.address);
      expect(addr1EtherBalance).to.be.lt(ethers.utils.parseEther("100").sub(purchaseValue));
    });

    it("should fail when buying less than the token cost", async function () {
      const purchaseValue = (await raffleContract.i_tokenCost()).div(2);
      await expect(raffleContract.connect(addr1).buyRaffleTokens({ value: purchaseValue })).to.be.revertedWith("Raffle__SendMoreToEnterRaffle");
    });

    it("should fail when buying partial tokens", async function () {
      const tokenCost = await raffleContract.i_tokenCost();
      const purchaseValue = tokenCost.mul(2).add(1);
      await expect(raffleContract.connect(addr1).buyRaffleTokens({ value: purchaseValue })).to.be.revertedWith("Raffle__CannotBuyPartialTokens");
    });

    it("should fail when there are not enough tokens available", async function () {
      const initialTokens = ethers.utils.parseUnits("1", "wei");
      await token.transfer(raffleContract.address, initialTokens);

      const tokenCost = await raffleContract.i_tokenCost();
      const purchaseValue = tokenCost.mul(2);
      await expect(raffleContract.connect(addr1).buyRaffleTokens({ value: purchaseValue })).to.be.revertedWith("Raffle__RaffleDoesNotHaveEnoughTokens");
    });

    //These tests cover the main scenarios for the buyRaffleTokens function,
    // including success and different failure cases.
    // Please note that you'll need to create a mock token contract (MockFailingToken)
    // that simulates a failing transfer in the last test case.
    // The mock contract should have a transfer function that always returns false.

    it("should fail when token transfer fails", async function () {
      // You can simulate a failing transfer by using a mock token contract that has a transfer function that always returns false.
      // Deploy the mock token contract and replace the original token with the mock one.
      const MockToken = await ethers.getContractFactory("MockFailingToken");
      const mockToken = await MockToken.deploy("Failing Token", "FT");
      await mockToken.deployed();
      raffleContract = await RaffleContract.deploy(mockToken.address);
      await raffleContract.deployed();

      const initialTokens = ethers.utils.parseUnits("1000", "wei");
      await mockToken.transfer(raffleContract.address, initialTokens);

      const tokenCost = await raffleContract.i_tokenCost();
      const purchaseValue = tokenCost.mul(2);
      await expect(raffleContract.connect(addr1).buyRaffleTokens({ value: purchaseValue })).to.be.revertedWith("Raffle__TransferFailed");
    });
  });
});




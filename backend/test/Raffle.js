const truffleAssert = require('truffle-assertions');

const Raffle = artifacts.require('./Raffle.sol');
const RaffleToken = artifacts.require('./RaffleToken.sol');

contract('Raffle', (accounts) => {
  let owner;
  let player1;
  let raffleInstance;
  let raffleToken;
  let eth;

  beforeEach(async () => {
    owner = accounts[0];
    player1 = accounts[1];
    raffleToken = await RaffleToken.new(2500000);
    raffleInstance = await Raffle.new(raffleToken.address);
    await raffleToken.transfer(raffleInstance.address, 1000000);
    eth = 100000000000000000; // 0.1 ether
  });

  it('Sets up the correct state', async () => {
    assert.equal(
      (await raffleToken.balanceOf(raffleInstance.address)).toString(),
      1000000,
    );
  });

  it('Only owner can open raffle', async () => {
    await truffleAssert.reverts(
      raffleInstance.openRaffle({ from: player1 }),
      'Ownable: caller is not the owner',
      'Only owner can open raffle',
    );
  });

  // it("Only owner can pickWinner", async () => {
  //   await truffleAssert.reverts(
  //       raffleInstance.pickWinner(),
  //       "Ownable: caller is not the owner",
  //       "Only owner can open raffle"
  //   );
  // });

  it('Cannot open already open raffle', async () => {
    await truffleAssert.fails(
      raffleInstance.openRaffle(),
      truffleAssert.ErrorType.REVERT,
      'Raffle already open',
      'raffle already open',
    );
  });

  it('Can buyRaffleTokens()', async () => {
    await raffleInstance.buyRaffleTokens({ from: player1, value: eth });
    assert.equal(
      (await raffleToken.balanceOf(raffleInstance.address)).toString(),
      999900,
    );
    assert.equal((await raffleToken.balanceOf(player1)).toString(), '100');
    assert.equal(await web3.eth.getBalance(raffleInstance.address), eth);

    // Buy more and decrement and increment
    await raffleInstance.buyRaffleTokens({ from: player1, value: eth });
    assert.equal(
      (await raffleToken.balanceOf(raffleInstance.address)).toString(),
      999800,
    );
    assert.equal((await raffleToken.balanceOf(player1)).toString(), '200');
    assert.equal(
      await web3.eth.getBalance(raffleInstance.address),
      '200000000000000000',
    );
  });

  it('Enters raffle', async () => {
    // buy 300
    await raffleInstance.buyRaffleTokens({ from: player1, value: eth });
    await raffleInstance.buyRaffleTokens({ from: player1, value: eth });
    await raffleInstance.buyRaffleTokens({ from: player1, value: eth });

    // approve 200
    await raffleToken.increaseAllowance(raffleInstance.address, 100, {
      from: player1,
    });
    await raffleToken.increaseAllowance(raffleInstance.address, 100, {
      from: player1,
    });

    assert.equal(
      (await raffleToken.allowance(player1, raffleInstance.address)).toString(),
      200,
    );

    await raffleInstance.enterRaffle(100, { from: player1 });

    assert.equal(
      (await raffleToken.allowance(player1, raffleInstance.address)).toString(),
      100,
    );
    assert.equal((await raffleToken.balanceOf(player1)).toString(), 200);
    assert.equal(
      await web3.eth.getBalance(raffleInstance.address),
      300000000000000000,
    );
  });

  it('Picks a winner', async () => {
    // buy 300
    await raffleInstance.buyRaffleTokens({ from: player1, value: eth });
    await raffleInstance.buyRaffleTokens({ from: player1, value: eth });
    await raffleInstance.buyRaffleTokens({ from: player1, value: eth });

    // approve 200
    await raffleToken.increaseAllowance(raffleInstance.address, 100, {
      from: player1,
    });
    await raffleToken.increaseAllowance(raffleInstance.address, 100, {
      from: player1,
    });

    await raffleInstance.enterRaffle(100, { from: player1 });

    assert.equal(await raffleInstance.players(0), player1);
    assert.equal(
      await web3.eth.getBalance(raffleInstance.address),
      300000000000000000,
    );

    await raffleInstance.pickWinner();

    assert.equal((await raffleInstance.raffle_state()).toString(), 1);
    assert.equal(await raffleInstance.lastWinner(), player1);
    assert.equal(await web3.eth.getBalance(raffleInstance.address), 0);
  });

  it('closeRaffle resets the state', async () => {
    await raffleInstance.buyRaffleTokens({ from: player1, value: eth });
    await raffleToken.approve(raffleInstance.address, 100, {
      from: player1,
    });
    await raffleInstance.enterRaffle(100, { from: player1 });

    await raffleInstance.closeRaffle();

    assert.equal((await raffleInstance.raffle_state()).toString(), 1);

    await truffleAssert.reverts(
      raffleInstance.players(0),
      null,
      'Players in not reset on raffle close',
    );
  });

  // it("only owner can deliver an item.", async () => {
  //   await raffleInstance.createItem(itemName, itemPrice, {
  //     from: owner,
  //   });
  //   const paidItem = await itemManagerInstance.triggerPayment(0, {
  //     from: owner,
  //     value: itemPrice,
  //   });
  //
  //   await truffleAssert.fails(
  //     itemManagerInstance.triggerDelivery(0, {
  //       from: notOwner,
  //     }),
  //     truffleAssert.ErrorType.REVERT,
  //     null,
  //     "Only Owner can deliver an item"
  //   );
  // });
  //
  // it("should create an item.", async () => {
  //   const res = await itemManagerInstance.createItem(itemName, itemPrice, {
  //     from: owner,
  //   });
  //
  //   // test event
  //   assert.equal(res.logs[0].args._itemIndex, 0, "Its not the first item");
  //   assert.equal(res.logs[0].args.step, 0, "Step should be 0");
  //
  //   // test stored item
  //   const storedItem = await itemManagerInstance.items(0);
  //   assert.equal(
  //     storedItem._item,
  //     res.logs[0].args._itemAddress,
  //     "event _itemAddress is not the same as the created item address"
  //   );
  //   assert.equal(
  //     storedItem._identifier,
  //     itemName,
  //     "_identifier is not correct"
  //   );
  //   assert.equal(storedItem._itemPrice, itemPrice, "_itemPrice is not correct");
  //   assert.equal(storedItem._state, 0, "_state is not correct");
  // });
  //
  // it("should update item on payment", async () => {
  //   await itemManagerInstance.createItem(itemName, itemPrice, {
  //     from: owner,
  //   });
  //   const paidItem = await itemManagerInstance.triggerPayment(0, {
  //     from: owner,
  //     value: itemPrice,
  //   });
  //   console.log(paidItem.logs);
  //   //test event
  //   assert.equal(paidItem.logs[0].args._itemIndex, 0, "Its not the first item");
  //   assert.equal(paidItem.logs[0].args.step, 1, "Step should be 1");
  //
  //   // test stored item
  //   const storedItem = await itemManagerInstance.items(0);
  //   assert.equal(storedItem._state, 1, "_state is not correct");
  // });
  //
  // it("should update item on delivery", async () => {
  //   await itemManagerInstance.createItem(itemName, itemPrice, {
  //     from: owner,
  //   });
  //   await itemManagerInstance.triggerPayment(0, {
  //     from: owner,
  //     value: itemPrice,
  //   });
  //   const deliveredItem = await itemManagerInstance.triggerDelivery(0, {
  //     from: owner,
  //   });
  //
  //   //test event
  //   assert.equal(
  //     deliveredItem.logs[0].args._itemIndex,
  //     0,
  //     "Its not the first item"
  //   );
  //   assert.equal(deliveredItem.logs[0].args.step, 2, "Step should be 2");
  //
  //   // test stored item
  //   const storedItem = await itemManagerInstance.items(0);
  //   assert.equal(storedItem._state, 2, "_state is not correct");
  // });
  //
  // it("should fail when paid when already delivered", async () => {
  //   await itemManagerInstance.createItem(itemName, itemPrice, {
  //     from: owner,
  //   });
  //   await itemManagerInstance.triggerPayment(0, {
  //     from: owner,
  //     value: itemPrice,
  //   });
  //   await itemManagerInstance.triggerDelivery(0, {
  //     from: owner,
  //   });
  //
  //   await truffleAssert.fails(
  //     itemManagerInstance.triggerPayment(0, {
  //       from: owner,
  //       value: itemPrice,
  //     }),
  //     truffleAssert.ErrorType.REVERT,
  //     null,
  //     "Should fail when paying when already delivered"
  //   );
  // });
  //
  // it("should fail when delivery when not paid", async () => {
  //   await itemManagerInstance.createItem(itemName, itemPrice, {
  //     from: owner,
  //   });
  //   await truffleAssert.fails(
  //     itemManagerInstance.triggerDelivery(0, {
  //       from: owner,
  //     }),
  //     truffleAssert.ErrorType.REVERT,
  //     null,
  //     "Should fail when delivery when not paid"
  //   );
  // });
});

// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.4.22 <0.9.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol';
import '@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol';
import '@chainlink/contracts/src/v0.8/KeeperCompatible.sol';
import '@chainlink/contracts/src/v0.8/KeeperCompatible.sol';
import 'hardhat/console.sol';

import './Events.sol';
import './RaffleToken.sol';

error Raffle__TransferFailed();
error Raffle__SendMoreToEnterRaffle();
error Raffle__CannotBuyPartialTokens();
error Raffle__RaffleDoesNotHaveEnoughTokens();
error Raffle__NotOpen();
error Raffle__AllReadyOpen();
error Raffle__UpkeepNotNeeded(
    uint256 curretnBalance,
    uint256 numPlayers,
    uint256 raffelState
);

contract Raffle is
    Ownable,
    Events,
    VRFConsumerBaseV2,
    KeeperCompatibleInterface
{
    enum RAFFLE_STATE {
        OPEN,
        CLOSED,
        CALCULATING_WINNER
    }
    RAFFLE_STATE private s_raffleState;
    RaffleToken public token;

    // can be used but not needed for solidity > 0.8+
    using SafeMath for uint256;

    /* State vars */
    uint256 private immutable i_entranceFee;

    struct Player {
        address addr;
        uint256 totalEntered;
    }
    Player public player;
    mapping(address => Player) public players;
    address payable[] private s_players;

    /* State variables */
    // Chainlink VRF Variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private i_gasLane;
    uint64 private i_subscriptionId;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private i_callbackGasLimit;
    uint32 private constant NUM_WORDS = 1;

    // raffle variables
    uint256 private constant _PRIZE_FUND = 1000;
    address private s_owner;
    address private s_lastWinner;
    uint256 private s_lastTimeStamp;
    uint256 private i_keepersUpdateInterval;
    address payable[] public s_playersAddresses;

    constructor(
        address tokenAddress,
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        uint256 entranceFee,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        uint256 keepersUpdateInterval
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        token = RaffleToken(tokenAddress);
        s_owner = msg.sender;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_entranceFee = entranceFee;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        s_raffleState = RAFFLE_STATE.OPEN;
        s_lastTimeStamp = block.timestamp;
        i_keepersUpdateInterval = keepersUpdateInterval;
        s_raffleState = RAFFLE_STATE.OPEN;
    }

    // modifiers
    modifier raffleIsOpen() {
        if (s_raffleState != RAFFLE_STATE.OPEN) {
            revert Raffle__NotOpen();
        }
        _;
    }

    function setPlayer(address addr, uint256 amount) private raffleIsOpen {
        // TODO - check how we store players
        s_playersAddresses.push(payable(addr));
        player = Player(addr, amount);
        players[addr] = player;
    }

    function updatePlayer(address addr, uint256 amount) private raffleIsOpen {
        // TODO - check how we store players
        player = players[addr];
        player.totalEntered = player.totalEntered + amount;
        players[addr] = player;
    }

    function closeRaffle() public onlyOwner raffleIsOpen {
   // TODO - is there a better ay to reset the array?
        s_playersAddresses = new address payable[](0);
        s_raffleState = RAFFLE_STATE.CLOSED;
    }

    function openRaffle() public onlyOwner {
        if (s_raffleState == RAFFLE_STATE.CLOSED) {
            revert Raffle__AllReadyOpen();
        }
        s_raffleState = RAFFLE_STATE.OPEN;
    }

    function buyRaffleTokens()
        external
        payable
        raffleIsOpen
        returns (uint256 tokenAmount)
    {

        // 1 ether == 1e18 wei — 1,000,000,000,000,000,000 wei

        // 1 gwei (shannon) == 1e9 wei — 1,000,000,000

        // 1 ether == 1e9 gwei — 1,000,000,000

        // Cost per token =  1e6 gwei - 1,000,000 gwei = 1e15 wei == 1e-6 ether - 0.001 ether = ~£1.36

        uint256 tokenCost = 1e6 gwei;
        // buy 1 or more tokens
        if(msg.value < tokenCost){
            revert Raffle__SendMoreToEnterRaffle();
        }

        uint256 amountToBuy = msg.value.div(tokenCost);

        console.log('amountToBuy',amountToBuy);

        // Make sure we are buying whole tokens
        if(amountToBuy.mod(1) == 0){
            revert Raffle__CannotBuyPartialTokens();
        }

        // check there is enough tokens available
        if(token.balanceOf(address(this)) >= amountToBuy)   {
            revert Raffle__RaffleDoesNotHaveEnoughTokens();
        }

        // Contract A calls Contract B
        // _transfer(RaffleContract, account[1], amountToBuy);
        // msg.sender is different from msg.sender in the erc20 as its the raffleContract in erc20
        bool sent = token.transfer(msg.sender, amountToBuy);
        if(sent){
            revert Raffle__TransferFailed();
        }

        emit BoughtTokens(msg.sender, amountToBuy, msg.value);

        return amountToBuy;
    }

    //TODO - Enter raffle
    function enterRaffle(
        uint256 raffleTokensAmountToEnter
    ) external raffleIsOpen {
        uint256 playerBalance = token.balanceOf(msg.sender);
        require(
            playerBalance >= 0,
            'You need to approve raffleTokens from the raffle contract first'
        );
        require(
            raffleTokensAmountToEnter >= 100,
            'Minimum 100 RaffleTokens to enter'
        );

        // does not work
        // token.approve(address(this), amountToEnter)
        // because Raffle calls raffleTokens and msg.sender becomes Raffle in raffleTokens.approve
        // not the msg.sender of the call to enterRaffle()
        // Contract A calls Contract B

        // so bought them and then send back to enter the raffle.
        token.transferFrom(
            msg.sender,
            address(this),
            raffleTokensAmountToEnter
        );

        if (players[msg.sender].totalEntered > 0) {
            updatePlayer(msg.sender, raffleTokensAmountToEnter);
        } else {
            // new player
            setPlayer(msg.sender, raffleTokensAmountToEnter);
        }

        emit Log(
            msg.sender,
            players[msg.sender].totalEntered,
            'Raffle Entered'
        );
    }

    // TODO calldata or memory?
    function pickWinner(uint256[] memory randomWords) public raffleIsOpen onlyOwner {
        s_raffleState = RAFFLE_STATE.CALCULATING_WINNER;
        emit CalculatingWinner();

        console.log('randomWords', randomWords[0]);

        //calculating
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address payable lastWinner = s_players[indexOfWinner];
        s_lastWinner = lastWinner;

        // reset
        s_raffleState = RAFFLE_STATE.OPEN;
        s_players = new address payable[](0);
        s_lastTimeStamp = block.timestamp;

        uint256 winnings = address(this).balance;

        //TODO TAKE 10% FEE

        // TODO check this is cheaper to transfer this way
        // or payable(s_lastWinner).transfer(address(this).balance * 1);
        (bool success, ) = lastWinner.call{value: winnings}('');
        if (!success) {
            revert Raffle__TransferFailed();
        }

        emit WinnerDeclared(s_lastWinner, winnings);
    }

    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        bool isOpen = RAFFLE_STATE.OPEN == s_raffleState;
        bool timePassed = (block.timestamp - s_lastTimeStamp) >
            i_keepersUpdateInterval;
        bool hasPLayers = s_players.length > 0;
        bool hasBalance = address(this).balance > 0;

        // upkeepNeeded automatically returned as defined bool upkeepNeeded in return
        upkeepNeeded = (timePassed && isOpen && hasBalance && hasBalance);
        return (upkeepNeeded, '0x0');
    }

    // Just changing this function from requestRandomWords to performUpkeep
    // function requestRandomWords() external onlyOwner {
    function performUpkeep(bytes calldata performData) external override {
        ///We highly recommend revalidating the upkeep in the performUpkeep function
        (bool upKeepNeeded, ) = checkUpkeep('');
        if (!upKeepNeeded) {
            revert Raffle__UpkeepNotNeeded(
                address(this).balance,
                s_players.length,
                uint256(s_raffleState)
            );
        }
        // Will revert if subscription is not set and funded.
        s_raffleState = RAFFLE_STATE.CALCULATING_WINNER;
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );

        emit RequestedRaffleWinner(requestId);
    }

    // Chainlink VRF Callback for getting the random number
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        pickWinner(randomWords);
    }

    // pure and views getters
    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayer(uint256 i) public view returns (address) {
        return s_players[i];
    }

    function getLastWinner() public view returns (address) {
        return s_lastWinner;
    }

    function getRaffleState() public view returns (RAFFLE_STATE) {
        return s_raffleState;
    }

    function getNumWords() public pure returns (uint256) {
        return NUM_WORDS;
    }

    function getNumberOfPlayers() public view returns (uint256) {
        return s_players.length;
    }

    function getLatestTimestamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    function getRequestConfirmations() public pure returns (uint256) {
        return REQUEST_CONFIRMATIONS;
    }

    function getRaffleKeeperInterval() public view returns (uint256) {
        return i_keepersUpdateInterval;
    }

    function getLastTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    receive() external payable {}

    fallback() external payable {}
}

// cmds

// const raffle  = await Raffle.deployed()
// const raffleToken  = await RaffleToken.deployed()

// web3.eth.getBalance(raffle.address);  // no eth
// raffleToken.balanceOf(raffle.address) // gives raffle quota 1000000

// await raffleToken.totalSupply() // gives max coins 2500000

// raffleToken.balanceOf(accounts[1])  0

// raffle.buyRaffleTokens({ from:accounts[1], value:"100000000000000000"})

// must approve from the token first.
// raffleToken.allowance(accounts[1], raffle.address) // 0
// raffleToken.approve(raffle.address, "100", { from:accounts[1] }); // owner => (spender => amount)
// raffleToken.allowance(accounts[1], raffle.address) // 100

// Now enter and use the transferFrom
// const res = await raffle.enterRaffle("100", { from:accounts[1] })

// raffle.playersEnteredBalance[accounts[1]]

// raffle.pickWinner()

// Other
// res.logs[1].args.amount

// fromWei converts any wei value into a ether value.
// const amountToBuy =  web3.utils.fromWei("100000000000000000")

// RaffleToken.allowance(accounts[1], Raffle.address)

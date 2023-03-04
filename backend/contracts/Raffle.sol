// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.4.22 <0.9.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/utils/structs/EnumerableMap.sol';

import '@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol';
import '@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol';
import '@chainlink/contracts/src/v0.8/KeeperCompatible.sol';
import '@chainlink/contracts/src/v0.8/KeeperCompatible.sol';
import 'hardhat/console.sol';

import './Events.sol';
import './RaffleToken.sol';

error Raffle__TransferFailed();

// buy tokens
error Raffle__SendMoreToEnterRaffle();
error Raffle__CannotBuyPartialTokens();
error Raffle__RaffleDoesNotHaveEnoughTokens();

// enter
error Raffle__YouNeedToBuyMoreTokens();
error Raffle__YouNeedToApproveRaffleTokens();
error Raffle__MinimumOneTokenToEnter();
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
    using EnumerableMap for EnumerableMap.AddressToUintMap;

    /* State vars */
    uint256 private immutable i_tokenCost;
    mapping(uint256 => EnumerableMap.AddressToUintMap) private s_games_players;
    uint256 private s_gameID = 0;

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

    constructor(
        address tokenAddress,
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        uint256 tokenCost,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        uint256 keepersUpdateInterval
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        token = RaffleToken(tokenAddress);
        s_owner = msg.sender;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_tokenCost = tokenCost;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        s_raffleState = RAFFLE_STATE.OPEN;
        s_lastTimeStamp = block.timestamp;
        i_keepersUpdateInterval = keepersUpdateInterval;
    }

    // modifiers
    modifier raffleIsOpen() {
        console.log('s_raffleState: %s', uint(s_raffleState));
        if (s_raffleState != RAFFLE_STATE.OPEN) {
            revert Raffle__NotOpen();
        }
        _;
    }

    function setPlayer(address addr, uint256 amount) private raffleIsOpen {
        getPlayers().set(addr, amount);
    }

    function updatePlayer(address addr, uint256 amount) private raffleIsOpen {
        uint256 totalEntered = getPlayers().get(addr);
        getPlayers().set(addr, totalEntered.add(amount));
    }

    function openRaffle() public onlyOwner {
        if (s_raffleState == RAFFLE_STATE.CLOSED) {
            revert Raffle__AllReadyOpen();
        }
        s_gameID = s_gameID += 1;
        s_raffleState = RAFFLE_STATE.OPEN;
        console.log('Raffle Open with gameID: %s', s_gameID);
    }

    function closeRaffle() public onlyOwner {
        s_raffleState = RAFFLE_STATE.CLOSED;
        console.log('Raffle Closed');
    }

    function getPlayers()
        internal
        view
        returns (EnumerableMap.AddressToUintMap storage)
    {
        return s_games_players[s_gameID];
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

        // Cost per token =  1e6 gwei = 1e15 wei == 1e-3 ether - 0.001 ether = ~£1.36

        // buy 1 or more tokens
        if (msg.value < i_tokenCost) {
            revert Raffle__SendMoreToEnterRaffle();
        }

        uint256 amountToBuy = msg.value.div(i_tokenCost);

        // Make sure we are buying whole tokens
        if (amountToBuy.mod(i_tokenCost) == 0) {
            revert Raffle__CannotBuyPartialTokens();
        }

        // Check there is enough tokens available
        if (token.balanceOf(address(this)) <= amountToBuy) {
            revert Raffle__RaffleDoesNotHaveEnoughTokens();
        }

        // Contract A calls Contract B
        // _transfer(RaffleContract, account[1], amountToBuy);
        // msg.sender is different from msg.sender in the erc20 as its the raffleContract in erc20
        bool sent = token.transfer(msg.sender, amountToBuy);

        if (!sent) {
            revert Raffle__TransferFailed();
        }

        emit BoughtTokens(msg.sender, amountToBuy, msg.value);

        return amountToBuy;
    }

    function enterRaffle(
        uint256 raffleTokensAmountToEnter
    ) external raffleIsOpen {
        // sent enough tokens to enter
        console.log('raffleTokensAmountToEnter', raffleTokensAmountToEnter);
        if (raffleTokensAmountToEnter < 1) {
            revert Raffle__MinimumOneTokenToEnter();
        }

        // Check have bought some tokens
        uint256 playerBalance = token.balanceOf(msg.sender);
        console.log('playerBalance', playerBalance);
        if (playerBalance <= 0) {
            revert Raffle__YouNeedToBuyMoreTokens();
        }

        // Check have approved the raffle contract to use there tokens
        uint256 allowance = token.allowance(msg.sender, address(this));
        console.log('token.allowance', allowance);
        if (allowance <= 0) {
            revert Raffle__YouNeedToApproveRaffleTokens();
        }

        // Enter raffle
        token.transferFrom(
            msg.sender,
            address(this),
            raffleTokensAmountToEnter
        );

        if (getPlayers().contains(msg.sender)) {
            updatePlayer(msg.sender, raffleTokensAmountToEnter);
        } else {
            // new player
            setPlayer(msg.sender, raffleTokensAmountToEnter);
        }

        console.log('ENTERED with', getPlayers().get(msg.sender));

        uint256 newPlayerBalance = token.balanceOf(msg.sender);
        console.log('newPlayerBalance', newPlayerBalance);
        uint256 newAllowance = token.allowance(msg.sender, address(this));
        console.log('newAllowance', newAllowance);
        emit EnteredRaffle(msg.sender, getPlayers().get(msg.sender));
    }

    // TODO calldata or memory?
    function pickWinner(
        uint256[] memory randomWords
    ) public raffleIsOpen onlyOwner returns (uint256) {
        s_raffleState = RAFFLE_STATE.CALCULATING_WINNER;
        emit CalculatingWinner();

        console.log('randomWords', randomWords[0]);
        console.log('getNumberOfPlayers', getNumberOfPlayers());

        //calculating
        uint256 indexOfWinner = randomWords[0] % getNumberOfPlayers();

        console.log('indexOfWinner', indexOfWinner);
        (address lastWinner, uint256 amount) = getPlayers().at(indexOfWinner);

        console.log('lastWinner', lastWinner, amount);
        s_lastWinner = lastWinner;

        closeRaffle();

        s_lastTimeStamp = block.timestamp;

        //TAKE 10% FEE
        uint256 pot = address(this).balance;
        uint256 winnings = pot.div(10).mul(9);
        uint256 raffleFee = pot.div(10).mul(1);

        console.log('pot', pot);
        console.log('winnings', winnings);
        console.log('raffleCut', raffleFee);

        // TODO check this is cheaper to transfer this way
        // or payable(s_lastWinner).transfer(address(this).balance * 1);
        (bool success, ) = lastWinner.call{value: winnings}('');
        if (!success) {
            revert Raffle__TransferFailed();
        }
        (bool raffleFeeSuccess, ) = s_owner.call{value: raffleFee}('');
        if (!raffleFeeSuccess) {
            revert Raffle__TransferFailed();
        }

        emit WinningsSent(s_lastWinner, winnings);
        emit RaffleFeeSent(s_owner, raffleFee);

        return winnings;
    }

    // Chainlink VRF Callback for getting the random number
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        pickWinner(randomWords);
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
        bool hasPLayers = getNumberOfPlayers() > 0;
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
                getNumberOfPlayers(),
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

    // pure and views getters
    function getTokenCost() public view returns (uint256) {
        return i_tokenCost;
    }

    function getPlayer(uint256 i) public view returns (address) {
        (address player, uint256 amount) = getPlayers().at(i);
        return player;
    }

    function getNumberOfPlayers() public view returns (uint256) {
        EnumerableMap.AddressToUintMap storage players = getPlayers();
        return players.length();
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

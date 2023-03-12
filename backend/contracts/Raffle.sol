// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.4.22 <0.9.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/utils/structs/EnumerableMap.sol';

import '@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol';
import '@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol';

import '@chainlink/contracts/src/v0.8/AutomationCompatible.sol';

import '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol';

import 'hardhat/console.sol';

import './Events.sol';
import './RaffleNFT.sol';
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
    AutomationCompatible,
    IERC721Receiver
{
    enum RAFFLE_STATE {
        OPEN,
        CALCULATING_WINNER,
        CLOSED
    }
    // can be used but not needed for solidity > 0.8+
    using SafeMath for uint256;
    using EnumerableMap for EnumerableMap.AddressToUintMap;

    RaffleToken public token;
    RaffleNFT public raffleNFT;
    RAFFLE_STATE private s_raffleState;
    uint256 private immutable i_tokenCost;
    mapping(uint256 => EnumerableMap.AddressToUintMap) private s_games_players;
    uint256 private s_gameID = 0;
    address private s_owner;
    address private s_lastWinner;
    uint256 private s_lastDrawTimeStamp;
    uint256 private i_automationUpdateInterval;
    uint256 private startEndGameGas;
    uint256 private finishEndGameGas;

    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private i_gasLane;
    uint64 private i_subscriptionId;
    uint16 private constant VRF_REQUEST_CONFIRMATIONS = 3;
    uint32 private i_callbackGasLimit;
    uint32 private constant VRF_NUM_WORDS = 1;

    constructor(
        address tokenAddress,
        address raffleNFTAddress,
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        uint256 tokenCost,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        uint256 automationUpdateInterval
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        token = RaffleToken(tokenAddress);
        raffleNFT = RaffleNFT(raffleNFTAddress);
        s_owner = msg.sender;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_tokenCost = tokenCost;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        s_raffleState = RAFFLE_STATE.OPEN;
        s_lastDrawTimeStamp = block.timestamp;
        i_automationUpdateInterval = automationUpdateInterval;
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes memory data
    ) public pure returns (bytes4) {
        // Implement your logic here
        // Return the ERC721_RECEIVED value to indicate that the transfer was successful
        return
            bytes4(
                keccak256('onERC721Received(address,address,uint256,bytes)')
            );
    }

    // modifiers
    modifier raffleIsOpen() {
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
        if (s_raffleState != RAFFLE_STATE.CLOSED) {
            revert Raffle__AllReadyOpen();
        }

        s_gameID = s_gameID += 1;
        s_raffleState = RAFFLE_STATE.OPEN;
    }

    function closeRaffle() public onlyOwner {
        s_raffleState = RAFFLE_STATE.CLOSED;
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
        if (raffleTokensAmountToEnter < 1) {
            revert Raffle__MinimumOneTokenToEnter();
        }

        // Check have bought some tokens
        uint256 playerBalance = token.balanceOf(msg.sender);
        if (playerBalance <= 0) {
            revert Raffle__YouNeedToBuyMoreTokens();
        }

        // Check have approved the raffle contract to use there tokens
        uint256 allowance = token.allowance(msg.sender, address(this));
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

        uint256 newPlayerBalance = token.balanceOf(msg.sender);
        uint256 newAllowance = token.allowance(msg.sender, address(this));
        emit EnteredRaffle(msg.sender, getPlayers().get(msg.sender));
    }

    // TODO calldata or memory?
    function pickWinner(uint256[] memory randomWords) public returns (uint256) {
        //calculating
        uint256 indexOfWinner = randomWords[0] % getNumberOfPlayers();
        (address winner, uint256 amount) = getPlayers().at(indexOfWinner);

        s_raffleState = RAFFLE_STATE.CLOSED;
        s_lastWinner = winner;

        //TAKE 10% FEE
        uint256 pot = address(this).balance;
        uint256 winnings = pot.div(10).mul(9);
        uint256 raffleFee = pot.div(10).mul(1);

        // TODO check this is cheaper to transfer this way
        // or payable(s_lastWinner).transfer(address(this).balance * 1);
        (bool success, ) = s_lastWinner.call{value: winnings}('');
        if (!success) {
            revert Raffle__TransferFailed();
        }
        (bool raffleFeeSuccess, ) = s_owner.call{value: raffleFee}('');
        if (!raffleFeeSuccess) {
            revert Raffle__TransferFailed();
        }

        raffleNFT.mintNft(s_lastWinner);

        s_lastDrawTimeStamp = block.timestamp;
        emit WinningsSent(s_lastWinner, winnings);
        emit RaffleFeeSent(s_owner, raffleFee);

        finishEndGameGas = gasleft();

        return winnings;
    }

    function canMakeRaffleDraw()
        private
        view
        onlyOwner
        returns (bool triggerRaffleDaw)
    {
        bool isOpen = RAFFLE_STATE.OPEN == s_raffleState;

        bool timePassed = isEnoughTimePassedToDraw();
        bool hasPLayers = getNumberOfPlayers() > 0;
        bool hasBalance = address(this).balance > 0;
        triggerRaffleDaw = (timePassed && isOpen && hasBalance && hasBalance);

        return triggerRaffleDaw;
    }

    // checkData can be used for control what is checked
    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (bool triggerRaffleDaw, bytes memory /* performData */)
    {
        triggerRaffleDaw = canMakeRaffleDraw();
        return (triggerRaffleDaw, '0x0');
    }

    // performData can be used to pass in data to the performUpkeep function
    function performUpkeep(bytes calldata performData) external override {
        //Recommended to rerevalidate the checkUpkeep in the performUpkeep function
        // after callback

        if (!canMakeRaffleDraw()) {
            revert Raffle__UpkeepNotNeeded(
                address(this).balance,
                getNumberOfPlayers(),
                uint256(s_raffleState)
            );
        }

        // Start raffle draw.
        s_raffleState = RAFFLE_STATE.CALCULATING_WINNER;
        emit CalculatingWinner();

        // start gase calculation for VRF callback
        startEndGameGas = gasleft();
        // Will revert if subscription is not set and funded.
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            VRF_REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            VRF_NUM_WORDS
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
    function getGameID() public view returns (uint256) {
        return s_gameID;
    }

    function getTokenCost() public view returns (uint256) {
        return i_tokenCost;
    }

    function getPlayer(uint256 i) public view returns (address) {
        (address player, uint256 amount) = getPlayers().at(i);
        return player;
    }

    function getPlayerBalance(address player) public view returns (uint256) {
        EnumerableMap.AddressToUintMap storage players = getPlayers();
        if (players.contains(player)) {
            return players.get(player);
        }
        return 0;
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

    function getAutomationInterval() public view returns (uint256) {
        return i_automationUpdateInterval;
    }

    function getLastDrawTimeStamp() public view returns (uint256) {
        return s_lastDrawTimeStamp;
    }

    function getNextDrawTimeStamp() public view returns (uint256) {
        return getLastDrawTimeStamp() + getAutomationInterval();
    }

    function getCountDownToDrawTimeStamp() public view returns (uint256) {
        if (getNextDrawTimeStamp() > block.timestamp) {
            return getNextDrawTimeStamp().sub(block.timestamp);
        }
        return 0;
    }

    function isEnoughTimePassedToDraw() public view returns (bool) {
        return
            (block.timestamp - getLastDrawTimeStamp()) >
            i_automationUpdateInterval;
    }

    function getNumWords() public pure returns (uint256) {
        return VRF_NUM_WORDS;
    }

    function getRequestConfirmations() public pure returns (uint256) {
        return VRF_REQUEST_CONFIRMATIONS;
    }

    function getEndGameGasCost() public view returns (uint256) {
        return startEndGameGas.sub(finishEndGameGas);
    }

    receive() external payable {}

    fallback() external payable {}
}

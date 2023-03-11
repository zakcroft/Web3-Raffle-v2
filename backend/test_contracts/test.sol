// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.4.22 <0.9.0;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol';

//import '@chainlink/contracts/src/v0.8/AutomationCompatible.sol';

import '@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol';
import '@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol';

import '@openzeppelin/contracts/utils/Counters.sol';

import 'hardhat/console.sol';

contract RaffleNFTTEST is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private s_tokenCounter;
    address public s_owner;
    string public constant TOKEN_URI =
        'ipfs://bafybeifdj4gp7bxo4zd2jh6h6al4etoa3fcifhxgpk5pafquxxhevhut24/?filename=happy.json';

    constructor() ERC721('Smile', 'HAPPY WINNER') {
        s_owner = msg.sender;
    }

    function mintNft() public {
        console.log('msg.sender', msg.sender);
        _safeMint(msg.sender, s_tokenCounter.current());
        s_tokenCounter.increment();
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        // require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return TOKEN_URI;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter.current();
    }
}

contract RaffleTEST is
    VRFConsumerBaseV2,
    //    AutomationCompatible,
    IERC721Receiver
{
    RaffleNFTTEST public raffleNFT;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private i_gasLane;
    uint64 private i_subscriptionId;
    uint16 private constant VRF_REQUEST_CONFIRMATIONS = 3;
    uint32 private i_callbackGasLimit;
    uint32 private constant VRF_NUM_WORDS = 1;

    constructor(
        address raffleNFTAddress,
        address vrfCoordinatorV2,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        uint256 automationUpdateInterval
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        console.log('vrfCoordinatorV2==', vrfCoordinatorV2);
        raffleNFT = RaffleNFTTEST(raffleNFTAddress);
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        //        s_raffleState = RAFFLE_STATE.OPEN;
        //        s_lastDrawTimeStamp = block.timestamp;
        //i_automationUpdateInterval = automationUpdateInterval;
    }

    function makeNFT() public {
        raffleNFT.mintNft();
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes memory data
    ) public returns (bytes4) {
        // Implement your logic here
        // Return the ERC721_RECEIVED value to indicate that the transfer was successful
        return
            bytes4(
                keccak256('onERC721Received(address,address,uint256,bytes)')
            );
    }

    //    function checkUpkeep(
    //        bytes calldata checkData
    //    ) external returns (bool upkeepNeeded, bytes memory performData) {
    //        return (true, "0x0");
    //    }

    function performUpkeep(bytes calldata performData) external {
        console.log('performData');
        console.log(
            'i_gasLane',
            '0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c'
        );
        console.log('i_subscriptionId', i_subscriptionId);
        console.log('VRF_REQUEST_CONFIRMATIONS', VRF_REQUEST_CONFIRMATIONS);
        console.log('i_callbackGasLimit', i_callbackGasLimit);
        console.log('VRF_NUM_WORDS', VRF_NUM_WORDS);
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc,
            i_subscriptionId,
            VRF_REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            VRF_NUM_WORDS
        );
        console.log('requestId', requestId);
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        makeNFT();
    }
}

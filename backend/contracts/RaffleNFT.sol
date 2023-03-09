// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

import 'hardhat/console.sol';

contract RaffleNFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private s_tokenCounter;
    address public s_owner;
    string public constant TOKEN_URI =
        'ipfs://bafybeifdj4gp7bxo4zd2jh6h6al4etoa3fcifhxgpk5pafquxxhevhut24/?filename=happy.json';

    constructor() ERC721('Smile', 'HAPPY WINNER') {
        s_owner = msg.sender;
    }

    function mintNft() public {
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

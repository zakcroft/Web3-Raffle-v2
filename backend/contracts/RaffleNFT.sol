// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

import 'hardhat/console.sol';

contract RaffleNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private s_tokenCounter;
    address public s_owner;
    string public constant TOKEN_URI =
        'ipfs://bafybeifdj4gp7bxo4zd2jh6h6al4etoa3fcifhxgpk5pafquxxhevhut24/?filename=happy.json';

    uint256 private startMintGas;
    uint256 private finishMintGas;

    constructor() ERC721('Smile', 'HAPPY WINNER') {
        s_owner = msg.sender;
    }

    function mintNft(address to) public {
        startMintGas = gasleft();
        uint256 tokenId = s_tokenCounter.current();
        s_tokenCounter.increment();
        _safeMint(to, tokenId);
        finishMintGas = gasleft();
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

    function getMintGasCost() public view returns (uint256) {
        return startMintGas - finishMintGas;
    }
}

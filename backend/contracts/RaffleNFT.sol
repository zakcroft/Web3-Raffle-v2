// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

import 'hardhat/console.sol';

contract RaffleNFT is ERC721URIStorage, ERC721Enumerable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');

    using Counters for Counters.Counter;
    Counters.Counter private s_tokenCounter;
    address public s_owner;
    string public constant TOKEN_URI =
        'ipfs://bafybeifdj4gp7bxo4zd2jh6h6al4etoa3fcifhxgpk5pafquxxhevhut24/?filename=happy.json';

    uint256 private startMintGas;
    uint256 private finishMintGas;

    constructor() ERC721('Smile', 'HAPPY WINNER') {
        s_owner = msg.sender;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function mintNft(address to) public onlyRole(MINTER_ROLE) {
        startMintGas = gasleft();
        uint256 tokenId = s_tokenCounter.current();
        s_tokenCounter.increment();
        _safeMint(to, tokenId);
       // _setTokenURI(tokenId, tokenURI);
        finishMintGas = gasleft();
    }

    function tokenURI(
        uint256 tokenId
    ) public pure override(ERC721, ERC721URIStorage) returns (string memory) {
        // require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return TOKEN_URI;
    }

    function grantMinterRole(
        address minter
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(MINTER_ROLE, minter);
    }

    // getters
    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter.current();
    }

    function getMintGasCost() public view returns (uint256) {
        return startMintGas - finishMintGas;
    }

    // overrides
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, 1);
    }

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
}

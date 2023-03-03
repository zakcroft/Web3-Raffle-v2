// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.4.22 <0.9.0;

contract Events {
    event SoldTokens(
        address buyer,
        uint256 amountOfETH,
        uint256 amountOfTokens
    );

    event Log(address addr, uint256 amount, string msg);

    event RequestedRaffleWinner(uint256 indexed requestId);

    event RaffleEnter(address indexed player);
    event BoughtTokens(address player, uint256 amount, uint256 cost);

    event EnteredRaffle(address player, uint256 amount);

    event CalculatingWinner();
    event WinnerDeclared(address indexed winner, uint256 indexed amountWon);
}

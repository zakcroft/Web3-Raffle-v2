// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.4.22 <0.9.0;

contract Events {
    event SoldTokens(
        address buyer,
        uint256 amountOfETH,
        uint256 amountOfTokens
    );

    event Log(address addr, uint256 amount, string msg);

    event CalculatingWinner();
    event RequestedRaffleWinner(uint256 indexed requestId);

    event RaffleEnter(address indexed player);
    event BoughtTokens(address player, uint256 amount, uint256 cost);

    event EnteredRaffle(address player, uint256 amount);

    event WinningsSent(address indexed winner, uint256 indexed amountWon);
    event RaffleFeeSent(address indexed winner, uint256 indexed raffeFee);
}

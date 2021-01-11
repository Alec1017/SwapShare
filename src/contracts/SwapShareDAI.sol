// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title Testnet Dai
 * @dev ERC20 minting logic
 * Sourced from OpenZeppelin and thoroughly butchered to remove security guards.
 * Anybody can mint - STRICTLY FOR TEST PURPOSES
 */
contract SwapShareDAI is ERC20 {
    uint public amountToMint = 1000;

    constructor() public ERC20("SwapShareDAI", "sDAI") {}

    function mint(address recipient) public {
        _mint(recipient, amountToMint * 10 ** uint(decimals()));
    }
}
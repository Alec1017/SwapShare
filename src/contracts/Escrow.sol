// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import "@openzeppelin/contracts/math/SafeMath.sol";

contract Escrow {
    using SafeMath for uint256;

    mapping(address => uint256) public deposits;

    // param: payee - person receiving the funds
    function deposit(address payee) public payable {
        require(msg.value >= 1000);

        deposits[payee] = deposits[payee].add(msg.value);
    }

    // Fetches funds from deposit account and sends to the payee
    function withdraw(address payable recipient) public {
        require(deposits[recipient] > 0);

        uint256 payment = deposits[recipient];
        deposits[recipient] = 0;
        recipient.transfer(payment);
    }
}
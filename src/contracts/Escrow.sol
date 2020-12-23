// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";

contract Escrow {
    using SafeMath for uint256;

    struct Transaction {
        uint256 expiration;
        uint256 amount;
    }

    mapping(address => Transaction[]) public deposits;

    // param: payee - person receiving the funds
    function deposit(address payee, uint256 expirationTimestamp) public payable {
        require(msg.value >= 1000, "Must send at least 1000 wei");

        deposits[payee].push(
            Transaction(expirationTimestamp, msg.value)
        );
    }

    // Returns a list of Transaction for the given address
    function getAllDeposits(address payee) public view returns(Transaction[] memory) {
        return deposits[payee];
    }

    // If able, withdraws the money in escrow to the owner
    function Withdraw(address payable recipient, uint transactionIndex) public {
        Transaction memory transaction = deposits[recipient][transactionIndex];
        uint256 expiration = transaction.expiration;
        uint256 amount = transaction.amount;

        require(expiration <= block.timestamp);
        
        for (uint i = transactionIndex; i < deposits[recipient].length - 1; i++) {
            deposits[recipient][i] = deposits[recipient][i + 1];
        }
        delete deposits[recipient][deposits[recipient].length - 1];
        deposits[recipient].pop();
        
        recipient.transfer(amount);
    }
}
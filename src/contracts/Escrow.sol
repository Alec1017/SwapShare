// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Escrow {
    using SafeMath for uint256;

    struct BorrowTransaction {
        uint256 expiration;
        uint256 amount;
    }

    struct LoanTransaction {
        uint256 expiration;
        uint256 amount;
    }

    IERC20 private _token;

    mapping(address => uint[]) public borrowerToTransactionIndex;
    mapping(address => uint[]) public loanerToTransactionIndex;

    BorrowTransaction[] public borrowTransactions;
    LoanTransaction[] public loanTransactions;

    uint borrowTransactionLength;
    uint loanTransactionLength;

    constructor (address token) public {
        _token = IERC20(token);
        borrowTransactionLength = 0;
        loanTransactionLength = 0;
    }


    function borrowerCollateralDeposit(uint256 expirationTimestamp, uint amount) public {
        _token.transferFrom(msg.sender, address(this), amount);

        // There is a new borrow transaction so we increment
        // Then add the new index to the address's array of transactions
        borrowTransactionLength++;
        borrowerToTransactionIndex[msg.sender].push(borrowTransactionLength);

        borrowTransactions.push(
            BorrowTransaction(expirationTimestamp, amount)
        );
    }

    function refundCollateralDeposit(address payable payee, uint transactionIndex) public {

    }

    // function borrowerCollateralDeposit(address payee, uint256 expirationTimestamp) public payable {}

    // // param: payee - person receiving the funds
    // function deposit(address payee, uint256 expirationTimestamp) public payable {
    //     require(msg.value >= 1000, "Must send at least 1000 wei");


    //     // If the user has made previous txs, find their index and add a transaction
    //     if(addressToDeposits[payee].exists) {
    //         deposits[addressToDeposits[payee].index].push(
    //             Transaction(expirationTimestamp, msg.value)
    //         );
    //     } 
    //     // Otherwise, create a new mapping and create a new transaction array at the proper index
    //     else {
    //         uint newIndex = deposits.length;

    //         addressToDeposits[payee] = AddressLocation(newIndex, true);

    //         Transaction[] storage txs;
    //         txs.push(Transaction(expirationTimestamp, msg.value));

    //         deposits.push(txs);
    //     }
    // }

    // // Returns a list of Transaction for the given address
    // function getAddressDeposits(address payee) public view returns(Transaction[] memory) {
    //     uint index = addressToDeposits[payee].index;

    //     return deposits[index];
    // }

    // function getAllDeposits() public view returns(Transaction[] memory) {
    //     Transaction[] storage txs;

    //     for (uint i = 0; i < deposits.length; i++) {
    //         for (uint j = 0; j < deposits[i].length; j++) {
    //             Transaction memory t = deposits[i][j];
    //             txs.push(t);
    //         }
    //     }

    //     return txs;
    // }

    // // If able, withdraws the money in escrow to the owner
    // function Withdraw(address payable recipient, uint transactionIndex) public {
    //     uint index = addressToDeposits[recipient].index;

    //     Transaction memory transaction = deposits[index][transactionIndex];

    //     // Transaction memory transaction = deposits[recipient][transactionIndex];
    //     uint256 expiration = transaction.expiration;
    //     uint256 amount = transaction.amount;

    //     require(expiration <= block.timestamp);

    //     for (uint i = transactionIndex; i < deposits[index].length - 1; i++) {
    //         deposits[index][i] = deposits[index][i + 1];
    //     }
    //     delete deposits[index][deposits[index].length - 1];
    //     deposits[index].pop();
        
    //     recipient.transfer(amount);


        
        // for (uint i = transactionIndex; i < deposits[recipient].length - 1; i++) {
        //     deposits[recipient][i] = deposits[recipient][i + 1];
        // }
        // delete deposits[recipient][deposits[recipient].length - 1];
        // deposits[recipient].pop();
        
        // recipient.transfer(amount);
    //}
}
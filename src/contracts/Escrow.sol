// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Escrow {
    using SafeMath for uint256;
    
    enum LoanState { REQUESTED, FULFILLED, SETTLED, DEFAULTED }

    struct Loan {
        address payable borrower;
        address payable lender;

        uint256 index;
        uint256 expiration;
        uint256 daiAmount;
        uint256 ethAmount;
        uint256 ethPlusInterest;

        uint interestRate;

        LoanState state;
    }

    struct BorrowTransaction {
        address payable borrower;
        address payable fulfilledBy; 

        uint256 index;
        uint256 expiration;
        uint256 daiAmount;
        uint256 ethRequested;
        uint interestRate;
        bool fulfilled;
        bool valid;
    }

    struct LoanTransaction {
        address loaner;
        uint256 index;
        uint256 expiration;
        uint256 ethAmount;
        bool active;
    }

    IERC20 private _token;

    mapping(address => uint[]) public addressLoansIndex;

    mapping(address => uint[]) public borrowerToTransactionIndex;
    mapping(address => uint[]) public loanerToTransactionIndex;

    Loan[] public loans;
 
    BorrowTransaction[] public borrowTransactions;
    LoanTransaction[] public loanTransactions;

    uint loanLength;

    uint borrowTransactionLength;
    uint loanTransactionLength;

    constructor (address token) public {
        _token = IERC20(token);
        loanLength = 0;
        borrowTransactionLength = 0;
        loanTransactionLength = 0;
    }


    function borrowerCollateralDeposit(uint256 expirationTimestamp, uint256 daiSupplied, uint256 ethRequested, uint interestRate) public {
        _token.transferFrom(msg.sender, address(this), daiSupplied);

        // Add the new index to the address's array of transactions
        borrowerToTransactionIndex[msg.sender].push(borrowTransactionLength);

        borrowTransactions.push(
            BorrowTransaction(
                msg.sender,
                address(0),
                borrowTransactionLength, 
                expirationTimestamp, 
                daiSupplied,
                ethRequested,
                interestRate,
                false,
                true
            )
        );

        borrowTransactionLength++;
    }

    function refundCollateralDeposit(uint transactionIndex) public {
        uint bTransactionIndex = borrowerToTransactionIndex[msg.sender][transactionIndex];

        // Make sure we can withdraw
        require(borrowTransactions[bTransactionIndex].fulfilled == false);

        // Send tokens and zero-out the transaction
        _token.transfer(msg.sender, borrowTransactions[bTransactionIndex].daiAmount);
        borrowTransactions[bTransactionIndex].valid = false;

    }

    // Retrieves all borrow requests for a single address
    function getAddressBorrowRequests(address borrower) public view returns(BorrowTransaction[] memory) {
        uint borrowLength = borrowerToTransactionIndex[borrower].length;
        BorrowTransaction[] memory txs = new BorrowTransaction[](borrowLength);

        for (uint i = 0; i < borrowLength; i++) {
            uint borrowIndex = borrowerToTransactionIndex[borrower][i];

            if (borrowTransactions[borrowIndex].valid) {
                txs[i] = borrowTransactions[borrowIndex];
            }
        }

        return txs;
    }

    // Retrieves all borrow requests, except those made by the given address
    function getAllBorrowRequests(address requestor) public view returns(BorrowTransaction[] memory) {
        BorrowTransaction[] memory txs = new BorrowTransaction[](borrowTransactionLength);

        for (uint i = 0; i < borrowTransactions.length; i++) {
            if (borrowTransactions[i].valid && !borrowTransactions[i].fulfilled && borrowTransactions[i].borrower != requestor) {
                txs[i] = borrowTransactions[i];
            }
        }

        return txs;
    }

    function fulfillLoan(uint borrowIndex) public payable {
        // Update the borrow transaction
        borrowTransactions[borrowIndex].fulfilled = true;
        borrowTransactions[borrowIndex].fulfilledBy = msg.sender;

        // Disperse the ETH funds to the borrower
        borrowTransactions[borrowIndex].borrower.transfer(msg.value);

        // Create a new loan transaction
         // Add the new index to the address's array of transactions
        loanerToTransactionIndex[msg.sender].push(loanTransactionLength);

        loanTransactions.push(
            LoanTransaction(
                msg.sender,
                loanTransactionLength, 
                borrowTransactions[borrowIndex].expiration,
                msg.value,
                true
            )
        );

        loanTransactionLength++;
    }

    function getAddressFulfilledLoans(address loaner) public view returns(LoanTransaction[] memory) {
        uint loanLength = loanerToTransactionIndex[loaner].length;
        LoanTransaction[] memory txs = new LoanTransaction[](loanLength);

        for (uint i = 0; i < loanLength; i++) {
            uint loanIndex = loanerToTransactionIndex[loaner][i];

            if (loanTransactions[loanIndex].active) {
                txs[i] = loanTransactions[loanIndex];
            }
        }

        return txs;
    }

    function repayLoan(uint borrowIndex) public payable {

        require(borrowTransactions[borrowIndex].expiration <= block.timestamp);

        // Return DAI to borrower
        _token.transfer(
            borrowTransactions[borrowIndex].borrower, 
            borrowTransactions[borrowIndex].daiAmount
        );
        borrowTransactions[borrowIndex].valid = false;

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
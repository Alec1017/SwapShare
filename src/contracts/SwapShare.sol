// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SwapShare {
    using SafeMath for uint256;
    
    enum LoanState { 
        // Borrower has requested a loan
        REQUESTED, 
        
        // Borrower requested a loan and then canceled it
        CANCELED, 
        
        // A loan was requested and a lender fulfilled the loan
        FULFILLED, 
        
        // A loan was requested, fulfilled, and the borrower repaid the lender 
        SETTLED, 
        
        // A loan was requested, fulfilled, and the borrower failed to repay before expiration
        DEFAULTED 
    }

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

    IERC20 private _token;

    mapping(address => uint[]) private _addressBorrowIndex;
    mapping(address => uint[]) private _addressLendIndex;

    Loan[] private _loans;

    uint private _loansLength;


    constructor (address token) public {
        _token = IERC20(token);
        _loansLength = 0;
    }

    // Create a new loan request
    function requestLoan(uint256 expirationTimestamp, uint256 daiAmount, uint256 ethAmount, uint interestRate) public {
        // Transfer DAI tokens to this contract
        _token.transferFrom(msg.sender, address(this), daiAmount);

        // Add the new index to the address's array of loans
        _addressBorrowIndex[msg.sender].push(_loansLength);

        // Create new loan transaction and add it to all loans
        _loans.push(
            Loan(
                msg.sender,
                address(0),
                _loansLength, 
                expirationTimestamp, 
                daiAmount,
                ethAmount,
                ethAmount.add(ethAmount.mul(interestRate).div(100)),
                interestRate,
                LoanState.REQUESTED
            )
        );

        _loansLength++;
    }


    // Refund the collateral deposit for a requested loan
    function cancelRequestedLoan(uint loanIndex) public {
        // Ensure loan is in a REQUESTED state
        require(_loans[loanIndex].state == LoanState.REQUESTED);

        // Ensure loan belongs to msg.sender
        require(_loans[loanIndex].borrower == msg.sender);

        // Refund collateral DAI tokens
        // Then, cancel the loan
        _token.transfer(msg.sender, _loans[loanIndex].daiAmount);
        _loans[loanIndex].state = LoanState.CANCELED;
    }


    // Get all loans for a borrower in the requested or fulfilled state
    function getAddressBorrows(address walletAddr) public view returns(Loan[] memory) {
        uint numLoans = _addressBorrowIndex[walletAddr].length;
        Loan[] memory requests = new Loan[](numLoans);

        for (uint i = 0; i < numLoans; i++) {
            uint loanIndex = _addressBorrowIndex[walletAddr][i];

            if (_loans[loanIndex].state == LoanState.REQUESTED && _loans[loanIndex].state == LoanState.FULFILLED) {
                requests[i] = _loans[loanIndex];
            }
        }

        return requests;
    }


    // Get all loans in a REQUESTED state
    function getAllRequests(address walletAddr) public view returns(Loan[] memory) {
        Loan[] memory requests = new Loan[](_loansLength);

        for (uint i = 0; i < _loansLength; i++) {
            if (_loans[i].state == LoanState.REQUESTED && _loans[i].borrower != walletAddr) {
                requests[i] = _loans[i];
            }
        }

        return requests;
    }


    // Fulfill a requested loan
    function fulfillLoan(uint loanIndex) public payable {
        // Ensure loan is not fulfilled by the loan requestor
        require(_loans[loanIndex].borrower != msg.sender);

        // Ensure loan is currently in a REQUESTED STATE
        require(_loans[loanIndex].state == LoanState.REQUESTED);

        // Disperse the ETH funds to the borrower
        _loans[loanIndex].borrower.transfer(msg.value);

        // Update the loan to FULFILLED state
        _loans[loanIndex].state = LoanState.FULFILLED;
        _loans[loanIndex].lender = msg.sender;

        // Track this wallet as the lender for this loan
        _addressLendIndex[msg.sender].push(loanIndex);
    }


    // Retrieves all loans that the given wallet address has fulfilled
    function getAddressFulfilled(address walletAddr) public view returns(Loan[] memory) {
        uint numLoans = _addressLendIndex[walletAddr].length;
        Loan[] memory fulfilledLoans = new Loan[](numLoans);

        for (uint i = 0; i < numLoans; i++) {
            uint loanIndex = _addressLendIndex[walletAddr][i];

            if (_loans[loanIndex].state == LoanState.FULFILLED) {
                fulfilledLoans[i] = _loans[loanIndex];
            }
        }

        return fulfilledLoans;
    }


    // Repay a loan to the lender
    function repayLoan(uint loanIndex) public payable {
        // Ensure the loan has not exceeded its default window
        require(_loans[loanIndex].expiration > block.timestamp);

        // Ensure the borrower owns this loan
        require(_loans[loanIndex].borrower == msg.sender);

        // Ensure repayed loan is of the sufficient amount
        require(msg.value >= _loans[loanIndex].ethPlusInterest);

        // Transfer ETH from borrower to lender
        _loans[loanIndex].lender.transfer(msg.value);

        // Return DAI to borrower
        _token.transfer(
            _loans[loanIndex].borrower, 
            _loans[loanIndex].daiAmount
        );

        // Mark this loan as SETTLED
        _loans[loanIndex].state = LoanState.SETTLED;
    }


    // Allow the lender to claim the collateral of a defaulted loan
    function claimDefaultedLoan(uint loanIndex) public {
        // Ensure the loan has exceeded its default window
        require(_loans[loanIndex].expiration <= block.timestamp);

        // Ensure the claimer is the lender
        require(_loans[loanIndex].lender == msg.sender);

        // Ensure the loan is in a fulfilled state
        require(_loans[loanIndex].state == LoanState.FULFILLED);

        // Send DAI to lender
        _token.transfer(
            _loans[loanIndex].lender, 
            _loans[loanIndex].daiAmount
        );

        // Mark this loan as DEFAULTED
        _loans[loanIndex].state = LoanState.DEFAULTED;
    }
}
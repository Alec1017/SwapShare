import React, { useEffect, useState } from 'react'

import { Body } from './index'
import BorrowRequest from './BorrowRequest'
import { LOAN_STATE } from '../Constants'

import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'


const SwapShare = ({web3, account, swapShareContract, DAIContract}) => {
  const [fulfilledLoans, setFulfilledLoans] = useState(null)
  const [allRequests, setAllRequests] = useState(null)
  const [borrowTransactions, setBorrowTransactions] = useState(null)
  const [updateRequests, setUpdateRequests] = useState(true)

  useEffect(() => {
    if (updateRequests) {
      getAddressBorrows()
      getAllRequests()
      getAddressFulfilledLoans()
      setUpdateRequests(false)
    }
  }, [updateRequests])

  useEffect(() => {
    if (borrowTransactions && borrowTransactions.length == 0) {
      setBorrowTransactions(null)
    }
  }, [borrowTransactions])

  useEffect(() => {
    if (allRequests && allRequests.length == 0) {
      setAllRequests(null)
    }
  }, [allRequests])

  useEffect(() => {
    if (fulfilledLoans && fulfilledLoans.length == 0) {
      setFulfilledLoans(null)
    }
  }, [fulfilledLoans])

  function getAllRequests() {
    swapShareContract.methods
      .getAllRequests(account)
      .call()
      .then(result => {
        let transactions = [];
        result.map(value => {
          if (value['valid']) {
            const expiration = new Date(parseInt(value['expiration']) * 1000)
            
            transactions.push({
              'index': value['index'],
              'expirationDate': expiration.toDateString(),
              'expirationTime': expiration.toLocaleTimeString(),
              'daiAmount': web3.utils.fromWei(value['daiAmount'], 'ether'),
              'ethAmount': web3.utils.fromWei(value['ethAmount'], 'ether'),
              'ethPlusInterest': web3.utils.fromWei(value['ethPlusInterest'], 'ether'),
              'interestRate': value['interestRate'],
              'state': value['state']
            })
          }
        })
        setAllRequests(transactions)
      })
  }

  function getAddressBorrows() {
    swapShareContract.methods
      .getAddressBorrows(account)
      .call()
      .then(result => {
        let transactions = [];
        result.map(value => {
          if (value['valid']) {
            const expiration = new Date(parseInt(value['expiration']) * 1000)
            const now = new Date()

            transactions.push({
              'index': value['index'],
              'expirationDate': expiration.toDateString(),
              'expirationTime': expiration.toLocaleTimeString(),
              'daiAmount': web3.utils.fromWei(value['daiAmount'], 'ether'),
              'ethAmount': web3.utils.fromWei(value['ethAmount'], 'ether'),
              'ethPlusInterest': web3.utils.fromWei(value['ethPlusInterest'], 'ether'),
              'interestRate': value['interestRate'],
              'state': value['state'],
              'hasExpired': expiration < now
            })
          }
        })
        setBorrowTransactions(transactions)
      })
  }

  function getAddressFulfilledLoans() {
    swapShareContract.methods
      .getAddressFulfilled(account)
      .call()
      .then(result => {
        let transactions = [];
        result.map(value => {
          if (value['valid']) {
            const expiration = new Date(parseInt(value['expiration']) * 1000)
            const now = new Date()

            transactions.push({
              'index': value['index'],
              'expirationDate': expiration.toDateString(),
              'expirationTime': expiration.toLocaleTimeString(),
              'daiAmount': web3.utils.fromWei(value['daiAmount'], 'ether'),
              'ethAmount': web3.utils.fromWei(value['ethAmount'], 'ether'),
              'ethPlusInterest': web3.utils.fromWei(value['ethPlusInterest'], 'ether'),
              'interestRate': value['interestRate'],
              'state': value['state'],
              'hasExpired': expiration < now
            })
          }
        })
        setFulfilledLoans(transactions)
      })
  }


  const cancelBorrowRequest = (index) => () => {
    swapShareContract.methods
        .cancelRequestedLoan(index)
        .send({from: account})
        .then(() => getAddressBorrows())
  }  

  const fulfillLoan = (index, amount) => () => {
    const ethAmount = web3.utils.toWei(amount, 'ether').toString()

    swapShareContract.methods
      .fulfillLoan(index)
      .send({
        from: account,
        value: ethAmount
      })
      .then(() => {
        getAllRequests()
        getAddressFulfilledLoans()
      })
  }

  const payBackLoan = (index, amount)  => () => {
    const ethAmount = web3.utils.toWei(amount, 'ether').toString()

    swapShareContract.methods
      .repayLoan(index)
      .send({
        from: account,
        value: ethAmount
      })
      .then(() => getAddressBorrows())
  }

  const claimCollateral = (index) => () => {
    swapShareContract.methods
      .claimDefaultedLoan(index)
      .send({
        from: account
      })
      .then(() => getAddressFulfilledLoans())
  }

  return (
    <div style={{display: 'flex', backgroundColor: '#282c34', justifyContent: 'space-between'}}>
      <Body>
        {allRequests &&
          <div className="mr-4">
            <div className="mb-4">Open Loan Requests</div>
            {allRequests.map((value, index) => (
                <Card className="mb-3" style={{color: '#282c34', minWidth: '20rem'}} key={index}>
                    <Card.Header>{value.ethAmount} ETH requested</Card.Header>
                    <Card.Body>
                        <Card.Title>Posted collateral: {value.daiAmount} DAI</Card.Title>
                        <Card.Text>Offered interest rate: {value.interestRate}%</Card.Text>
                        <Card.Text>Total to be paid back: {value.ethPlusInterest} ETH</Card.Text>
                        <Card.Text>Loan will be paid in full by:</Card.Text>
                        <Card.Text>
                            Date: {value.expirationDate}<br />
                            Time: {value.expirationTime}
                        </Card.Text>
                        <Button variant='success' onClick={fulfillLoan(value.index, value.ethAmount)}>
                          fulfill loan
                        </Button>
                    </Card.Body>
                </Card>
            ))}
            </div>
        }
      </Body>
      <Body>
        <BorrowRequest 
          account={account} 
          swapShareContract={swapShareContract} 
          daiContract={DAIContract} 
          setUpdateRequests={setUpdateRequests} 
        />
        {fulfilledLoans && 
          <div className="ml-4 mt-4">
            <div className="mb-4">Loans You have Fulfilled</div>
            {fulfilledLoans.map((value, index) => (
              <Card className="mb-3" style={{color: '#282c34', minWidth: '20rem'}} key={index}>
                  <Card.Header>{value.ethAmount} ETH requested</Card.Header>
                  <Card.Body>
                      <Card.Title>Posted collateral: {value.daiAmount} DAI</Card.Title>
                      <Card.Text>Offered interest rate: {value.interestRate}%</Card.Text>
                      <Card.Text>Total to be paid back: {value.ethPlusInterest} ETH</Card.Text>
                      <Card.Text>Loan will be paid in full by:</Card.Text>
                      <Card.Text>
                          Date: {value.expirationDate}<br />
                          Time: {value.expirationTime}
                      </Card.Text>
                      <div>
                        <Button 
                            variant={value.hasExpired ? 'success' : 'secondary'} 
                            disabled={!value.hasExpired}
                            onClick={claimCollateral(value.index)}
                        >
                          {value.hasExpired ? 'claim collateral' : 'active'}
                        </Button>
                      </div>
                  </Card.Body>
              </Card>
            ))}
          </div>
        }
      </Body>
      <Body>
        {borrowTransactions &&
          <div className="ml-4">
            <div className="mb-4">Borrow Requests</div>
            {borrowTransactions.map((value, index) => (
                <Card className="mb-3" style={{color: '#282c34', minWidth: '20rem'}} key={index}>
                    <Card.Header>{value.ethAmount} ETH requested</Card.Header>
                    <Card.Body>
                        <Card.Title>Posted collateral: {value.daiAmount} DAI</Card.Title>
                        <Card.Text>Offered interest rate: {value.interestRate}%</Card.Text>
                        <Card.Text>Total to be paid back: {value.ethPlusInterest} ETH</Card.Text>
                        <Card.Text>Loan will be paid in full by:</Card.Text>
                        <Card.Text>
                            Date: {value.expirationDate}<br />
                            Time: {value.expirationTime}
                        </Card.Text>
                        <div>
                          {!value.hasExpired && 
                            <Button 
                              variant={value.state == LOAN_STATE.requested ? 'danger' : 'success'} 
                              disabled={value.state == LOAN_STATE.fulfilled}
                              onClick={cancelBorrowRequest(value.index)}
                            >
                              {value.state == LOAN_STATE.requested ? 'cancel request' : 'active'}
                            </Button>
                          }
                          {value.state == LOAN_STATE.fulfilled &&
                            <Button 
                              variant={value.hasExpired ? "danger" : "primary"} 
                              className="ml-2"
                              disabled={value.hasExpired}
                              onClick={payBackLoan(value.index, value.ethPlusInterest)}
                            >
                              {value.hasExpired ? 'Loan has Defaulted' : 'Pay back loan'}
                            </Button>
                          }
                        </div>
                    </Card.Body>
                </Card>
            ))}
          </div>
        }
      </Body>
    </div>
  );
}

export default SwapShare

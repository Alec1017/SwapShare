import React, { useEffect, useState } from 'react'


import { Body } from './index'
import BorrowRequest from './BorrowRequest'

import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'


const SwapShare = ({web3, account, swapShareContract, DAIContract}) => {
  const [fulfilledLoans, setFulfilledLoans] = useState(null)
  const [allRequests, setAllRequests] = useState(null)
  const [borrowTransactions, setBorrowTransactions] = useState(null)
  const [updateRequests, setUpdateRequests] = useState(true)

  useEffect(() => {
    if (updateRequests) {
      getBorrowTransactions()
      getAllBorrowRequests()
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

  function getAllBorrowRequests() {
    swapShareContract.methods
      .getAllBorrowRequests(account)
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
                'ethRequested': web3.utils.fromWei(value['ethRequested'], 'ether'),
                'interestRate': value['interestRate'],
                'fulfilled': value['fulfilled']
            })
          }
        })
        setAllRequests(transactions)
      })
  }

  function getBorrowTransactions() {
    swapShareContract.methods
      .getAddressBorrowRequests(account)
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
                'ethRequested': web3.utils.fromWei(value['ethRequested'], 'ether'),
                'interestRate': value['interestRate'],
                'fulfilled': value['fulfilled']
            })
          }
        })
        setBorrowTransactions(transactions)
      })
  }


  const cancelBorrowRequest = (index) => () => {
    swapShareContract.methods
        .refundCollateralDeposit(index)
        .send({from: account})
        .then(() => getBorrowTransactions())
  }  

  const fulfillLoan = (index, amount) => () => {
    const ethAmount = web3.utils.toWei(amount, 'ether').toString()

    swapShareContract.methods
      .fulfillLoan(index)
      .send({
        from: account,
        value: ethAmount
      })
      .then(() => getAllBorrowRequests())
  }

  return (
    <div style={{display: 'flex', backgroundColor: '#282c34', justifyContent: 'space-between'}}>
      <Body>
        {allRequests &&
          <div className="mr-4">
            <div className="mb-4">Open Loan Requests</div>
            {allRequests.map((value, index) => (
                <Card className="mb-3" style={{color: '#282c34', minWidth: '20rem'}} key={index}>
                    <Card.Header>{value.ethRequested} ETH requested</Card.Header>
                    <Card.Body>
                        <Card.Title>Posted collateral: {value.daiAmount} DAI</Card.Title>
                        <Card.Text>Offered interest rate: {value.interestRate}%</Card.Text>
                        <Card.Text>Total to be paid back: {
                          (Number(value.ethRequested) * (Number(value.interestRate) / 100)) + Number(value.ethRequested)
                        } ETH</Card.Text>
                        <Card.Text>Loan will be paid in full by:</Card.Text>
                        <Card.Text>
                            Date: {value.expirationDate}<br />
                            Time: {value.expirationTime}
                        </Card.Text>
                        <Button variant='success' onClick={fulfillLoan(value.index, value.ethRequested)}>
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
      </Body>
      <Body>
        {borrowTransactions &&
          <div className="ml-4">
            <div className="mb-4">Borrow Requests</div>
            {borrowTransactions.map((value, index) => (
                <Card className="mb-3" style={{color: '#282c34', minWidth: '20rem'}} key={index}>
                    <Card.Header>{value.ethRequested} ETH requested</Card.Header>
                    <Card.Body>
                        <Card.Title>Posted collateral: {value.daiAmount} DAI</Card.Title>
                        <Card.Text>Offered interest rate: {value.interestRate}%</Card.Text>
                        <Card.Text>Total to be paid back: {
                          (Number(value.ethRequested) * (Number(value.interestRate) / 100)) + Number(value.ethRequested)
                        } ETH</Card.Text>
                        <Card.Text>Loan will be paid in full by:</Card.Text>
                        <Card.Text>
                            Date: {value.expirationDate}<br />
                            Time: {value.expirationTime}
                        </Card.Text>
                        <div>
                          <Button 
                              variant={value.fulfilled ? 'success' : 'danger'} 
                              disabled={value.fulfilled}
                              onClick={cancelBorrowRequest(value.index)}
                          >
                            {value.fulfilled ? 'active' : 'cancel request'}
                          </Button>
                          <Button className="ml-2" variant="primary">Pay back loan</Button>
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

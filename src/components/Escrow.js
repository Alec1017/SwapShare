import React, { useEffect, useState } from 'react'


import { Body } from './index'
import BorrowRequest from './BorrowRequest'

import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'


const Escrow = ({web3, account, escrowContract, DAIContract}) => {
  const [borrowTransactions, setBorrowTransactions] = useState(null)
  const [updateRequests, setUpdateRequests] = useState(true)

  useEffect(() => {
    if (updateRequests) {
      getBorrowTransactions()
      setUpdateRequests(false)
    }
  }, [updateRequests])

  useEffect(() => {
    if (borrowTransactions && borrowTransactions.length == 0) {
      setBorrowTransactions(null)
    }
  }, [borrowTransactions])

  function getBorrowTransactions() {
    escrowContract.methods
      .getAddressBorrowRequests()
      .call()
      .then(result => {
        let transactions = [];
        result.map(value => {
          if (value['valid']) {
            const expiration = new Date(parseInt(value['expiration']) * 1000)
            console.log(value)
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
    escrowContract.methods
        .refundCollateralDeposit(index)
        .send({from: account})
        .then(() => getBorrowTransactions())
  }  


  return (
    <div style={{display: 'flex', backgroundColor: '#282c34', justifyContent: 'center'}}>
      <Body>
        <BorrowRequest 
          account={account} 
          escrowContract={escrowContract} 
          daiContract={DAIContract} 
          setUpdateRequests={setUpdateRequests} 
        />
      </Body>
      <Body>
        {borrowTransactions &&
          <div className="ml-4">
            <div className="mb-2">Borrow Requests</div>
            {borrowTransactions.map((value, index) => (
                <Card className="mb-3" style={{color: '#282c34', minWidth: '25rem'}} key={index}>
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
                        <Button 
                            variant={value.fulfilled ? 'success' : 'danger'} 
                            disabled={value.fulfilled}
                            onClick={cancelBorrowRequest(value.index)}
                        >
                            {value.fulfilled ? 'active' : 'cancel request'}
                        </Button>
                    </Card.Body>
                </Card>
            ))}
            </div>
        }
      </Body>
    </div>
  );
}

export default Escrow

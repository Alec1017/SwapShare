import React, { useEffect, useState } from 'react'

import { Container, Title } from './index'
import BorrowRequest from './BorrowRequest'
import LoanCard from './LoanCard'
import { LOAN_STATE } from '../Constants'

import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'


const SwapShare = ({web3, account, swapShareContract, DAIContract}) => {
  const [fulfilledLoans, setFulfilledLoans] = useState(null)
  const [borrowTransactions, setBorrowTransactions] = useState(null)
  const [updateRequests, setUpdateRequests] = useState(true)


  // Data is refreshed when the user switches accounts
  useEffect(() => {
    if (!updateRequests) {
      getAddressBorrows()
      getAddressFulfilledLoans()
    }
  }, [account])

  useEffect(() => {
    if (updateRequests) {
      getAddressBorrows()
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
    if (fulfilledLoans && fulfilledLoans.length == 0) {
      setFulfilledLoans(null)
    }
  }, [fulfilledLoans])

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
    <Container>
      <div style={{display: 'flex', backgroundColor: '#282c34', justifyContent: 'space-between'}}>
        <Col className="mx-4" md={3}>
          <Title className="mb-4">Loans You have Fulfilled</Title>
          {fulfilledLoans
            ? <div>
                {fulfilledLoans.map((value, index) => (
                  <LoanCard data={value} index={index}>
                    <Button 
                        variant={value.hasExpired ? 'success' : 'secondary'} 
                        disabled={!value.hasExpired}
                        onClick={claimCollateral(value.index)}
                    >
                      {value.hasExpired ? 'claim collateral' : 'active'}
                    </Button>   
                  </LoanCard>
                ))}
              </div>
            : <div style={{height: '10rem', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#6c757d'}}>Nothing to display</div>
          }
        </Col>

        <Col className="mx-4" md={3}>
          <BorrowRequest 
            account={account} 
            swapShareContract={swapShareContract} 
            daiContract={DAIContract} 
            setUpdateRequests={setUpdateRequests} 
          />
        </Col>

        <Col className="mx-4" md={3}>
          <Title className="mb-4">Borrow Requests</Title>
          {borrowTransactions
            ? <div>
                {borrowTransactions.map((value, index) => (
                  <LoanCard data={value} index={index}>
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
                  </LoanCard>
                ))}
              </div>
            : <div style={{height: '10rem', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#6c757d'}}>Nothing to display</div>
          }
        </Col>
      </div>
    </Container>
  );
}

export default SwapShare

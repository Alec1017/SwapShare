import React, { useEffect, useState } from 'react'

import { Container, Title } from './index'
import BorrowRequest from './BorrowRequest'
import LoanCard from './LoanCard'
import LoadingModal from './LoadingModal'
import { LOAN_STATE, TIME_SECONDS } from '../Constants'

import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'


const SwapShare = ({web3, account, swapShareContract, DAIContract}) => {
  const [fulfilledLoans, setFulfilledLoans] = useState(null)
  const [borrowTransactions, setBorrowTransactions] = useState(null)
  const [updateRequests, setUpdateRequests] = useState(true)

  const [loadingCancel, setLoadingCancel] = useState(false)
  const [loadingRepay, setLoadingRepay] = useState(false)
  const [loadingClaim, setLoadingClaim] = useState(false)


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
            const expirationDelta = parseInt(value['expirationDelta'])
            const now = new Date()

            const numDays = Math.floor(expirationDelta / TIME_SECONDS.day)
            const remainingHours = expirationDelta - (numDays * TIME_SECONDS.day)

            const numHours = Math.floor(remainingHours / TIME_SECONDS.hour)
            const remainingMinutes = remainingHours - (numHours * TIME_SECONDS.hour)

            const numMinutes = Math.floor(remainingMinutes / TIME_SECONDS.minute)

            transactions.push({
              'index': value['index'],
              'expirationDate': (value['state'] == LOAN_STATE.fulfilled ? expiration.toDateString() : ''),
              'expirationTime': (value['state'] == LOAN_STATE.fulfilled ? expiration.toLocaleTimeString() : ''),
              'loanDuration': {days: numDays, hours: numHours, minutes: numMinutes},
              'daiAmount': web3.utils.fromWei(value['daiAmount'], 'ether'),
              'ethAmount': web3.utils.fromWei(value['ethAmount'], 'ether'),
              'ethPlusInterest': web3.utils.fromWei(value['ethPlusInterest'], 'ether'),
              'interestRate': value['interestRate'],
              'state': value['state'],
              'hasExpired': (value['state'] == LOAN_STATE.fulfilled && (expiration < now))
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
            const expirationDelta = parseInt(value['expirationDelta'])
            const now = new Date()

            const numDays = Math.floor(expirationDelta / TIME_SECONDS.day)
            const remainingHours = expirationDelta - (numDays * TIME_SECONDS.day)

            const numHours = Math.floor(remainingHours / TIME_SECONDS.hour)
            const remainingMinutes = remainingHours - (numHours * TIME_SECONDS.hour)

            const numMinutes = Math.floor(remainingMinutes / TIME_SECONDS.minute)

            transactions.push({
              'index': value['index'],
              'expirationDate': (value['state'] == LOAN_STATE.fulfilled ? expiration.toDateString() : ''),
              'expirationTime': (value['state'] == LOAN_STATE.fulfilled ? expiration.toLocaleTimeString() : ''),
              'loanDuration': {days: numDays, hours: numHours, minutes: numMinutes},
              'daiAmount': web3.utils.fromWei(value['daiAmount'], 'ether'),
              'ethAmount': web3.utils.fromWei(value['ethAmount'], 'ether'),
              'ethPlusInterest': web3.utils.fromWei(value['ethPlusInterest'], 'ether'),
              'interestRate': value['interestRate'],
              'state': value['state'],
              'hasExpired': (value['state'] == LOAN_STATE.fulfilled && (expiration < now))
            })
          }
        })
        setFulfilledLoans(transactions)
      })
  }


  const cancelBorrowRequest = (index) => () => {
    setLoadingCancel(true)

    swapShareContract.methods
        .cancelRequestedLoan(index)
        .send({from: account})
        .then(() => {
          setLoadingCancel(false)
          getAddressBorrows()
        })
        .catch(e => {
          setLoadingCancel(false)
        })
  }  


  const payBackLoan = (index, amount)  => () => {
    const ethAmount = web3.utils.toWei(amount, 'ether').toString()

    setLoadingRepay(true)

    swapShareContract.methods
      .repayLoan(index)
      .send({
        from: account,
        value: ethAmount
      })
      .then(() => {
        getAddressBorrows()
        setLoadingRepay(false)
      })
      .catch(e => {
        console.error(e)
        setLoadingRepay(false)
      })
  }

  const claimCollateral = (index) => () => {
    setLoadingClaim(true)

    swapShareContract.methods
      .claimDefaultedLoan(index)
      .send({
        from: account
      })
      .then(() => {
        getAddressFulfilledLoans()
        setLoadingClaim(false)
      })
      .catch(e => {
        console.error(e)
        setLoadingClaim(false)
      })
  }

  return (
    <Container>
      <div style={{display: 'flex', backgroundColor: '#282c34', justifyContent: 'space-between'}}>
        <Col className="mx-4" md={3}>
          <Title className="mb-4">Loans You have Fulfilled</Title>
          {fulfilledLoans
            ? <div>
                {fulfilledLoans.map((value, index) => (
                  <LoanCard data={value} key={index}>
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
                  <LoanCard data={value} key={index}>
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
      <div>
        <LoadingModal show={loadingCancel}>
          <div style={{textAlign: 'center'}}>Awaiting blockchain cancel confirmation...</div>
        </LoadingModal>
        <LoadingModal show={loadingRepay}>
          <div style={{textAlign: 'center'}}>Awaiting blockchain repayment confirmation...</div>
        </LoadingModal>
        <LoadingModal show={loadingClaim}>
          <div style={{textAlign: 'center'}}>Awaiting blockchain claim confirmation...</div>
        </LoadingModal>
      </div>
    </Container>
  );
}

export default SwapShare

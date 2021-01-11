import React, { useEffect, useState } from 'react'

import { Container, Title } from './index'
import LoanCard from './LoanCard'
import LoadingModal from './LoadingModal'
import { LOAN_STATE, TIME_SECONDS } from '../Constants'

import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'

const OpenLoans = ({ web3, account, swapShareContract }) => {
    const [openLoans, setOpenLoans] = useState(null)

    const [loadingFulfill, setLoadingFulfill] = useState(false)

    useEffect(() => {
        getAllOpenLoans()
    }, [account])

    useEffect(() => {
        if (openLoans && openLoans.length === 0) {
            setOpenLoans(null)
        }
    }, [openLoans])

    const getAllOpenLoans = () => {
        swapShareContract.methods
          .getAllRequests(account)
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
            setOpenLoans(transactions)
          })
      }

      const fulfillLoan = (index, amount) => () => {
        const ethAmount = web3.utils.toWei(amount, 'ether').toString()
        setLoadingFulfill(true)
    
        swapShareContract.methods
          .fulfillLoan(index)
          .send({
            from: account,
            value: ethAmount
          })
          .then(() => {
            setLoadingFulfill(false)
            getAllOpenLoans()
          })
          .catch(e => {
            console.error(e)
            setLoadingFulfill(false)
          })
      }

    return (
      <Container>
        <Col className="mx-auto" md={4}>
          <Title className="mb-4">Open Loan Requests</Title>
          {openLoans
            ? <div>
                {openLoans.map((value, index) => (
                  <LoanCard data={value} key={index}>
                    <Button variant='success' onClick={fulfillLoan(value.index, value.ethAmount)}>
                        fulfill loan
                    </Button>
                  </LoanCard>
                ))}
                </div>
            : <div style={{height: '10rem', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#6c757d'}}>
                No loans to display at this time
              </div>
          }
        </Col>
        <div>
          <LoadingModal show={loadingFulfill}>
            <div style={{textAlign: 'center'}}>Awaiting blockchain fulfill confirmation...</div>
          </LoadingModal>
        </div>
      </Container>
    )
  }

export default OpenLoans
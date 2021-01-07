import React, { useEffect, useState } from 'react'

import { Container, Title } from './index'
import LoanCard from './LoanCard'

import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'

const OpenLoans = ({ web3, account, swapShareContract }) => {
    const [openLoans, setOpenLoans] = useState(null)

    useEffect(() => {
        getAllOpenLoans()
    }, [])

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
            setOpenLoans(transactions)
          })
      }

      const fulfillLoan = (index, amount) => () => {
        const ethAmount = web3.utils.toWei(amount, 'ether').toString()
    
        swapShareContract.methods
          .fulfillLoan(index)
          .send({
            from: account,
            value: ethAmount
          })
          .then(() => getAllOpenLoans())
      }

    return (
      <Container>
        <Col className="mx-auto" md={4}>
          <Title className="mb-4">Open Loan Requests</Title>
          {openLoans
            ? <div>
                {openLoans.map((value, index) => (
                  <LoanCard data={value} index={index}>
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
      </Container>
    )
  }

export default OpenLoans
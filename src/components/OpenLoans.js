import React, { useEffect, useState } from 'react'

import { Splash, Title } from './index'

import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'

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
        <Splash>
            <div className="mr-4">
                <Title className="mb-4">Open Loan Requests</Title>
                {openLoans
                    ? <div>
                        {openLoans.map((value, index) => (
                            <Card className="mb-4" style={{color: '#282c34', minWidth: '20rem'}} key={index}>
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
                    : <div style={{height: '10rem', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#6c757d'}}>
                        No loans to display at this time
                        </div>
                }
            </div>
        </Splash>
    )
  }

export default OpenLoans
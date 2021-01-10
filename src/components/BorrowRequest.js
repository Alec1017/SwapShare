import React, { useState, useEffect, useRef } from 'react'
import BigNumber from "bignumber.js"

import { Title } from './index'

import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

const BorrowRequest = ({ account, swapShareContract, daiContract, setUpdateRequests }) => {
    const [validated, setValidated] = useState(false)
    const [approved, setApproved] = useState(false)
    const approvalAmount = new BigNumber('1000e+18').toFixed()

    const [daiAmount, setDaiAmount] = useState('')
    const [ethAmount, setEthAmount] = useState('')
    const [loanDuration, setLoanDuration] = useState({
                                                days:    '',
                                                hours:   '',
                                                minutes: ''
                                            })
    const [interestRate, setInterestRate] = useState('3')


    const handleSubmit = (event) => {
        const form = event.currentTarget;

        const loanDays = loanDuration.days == '' ? 0 : parseInt(loanDuration.days)
        const loanHours = loanDuration.hours == '' ? 0 : parseInt(loanDuration.hours)
        const loanMinutes = loanDuration.minutes == '' ? 0 : parseInt(loanDuration.minutes)
       
        let now = new Date()
        let timeDelta = new Date()
        timeDelta.setDate(timeDelta.getDate() + loanDays)
        timeDelta.setHours(timeDelta.getHours() + loanHours)
        timeDelta.setMinutes(timeDelta.getMinutes() + loanMinutes)

        let expirationDelta = parseInt((timeDelta.getTime() / 1000) - (now.getTime() / 1000))
    
        if (form.checkValidity() === false) {
          event.stopPropagation();
        } else {
            setValidated(true);
            submitBorrowRequest(expirationDelta)
        }

        event.preventDefault()
      };

    const handleChange = setFunc => e => {
        setFunc(e.target.value)
    }

    function submitBorrowRequest(expirationDelta) {
        let amountToSend = new BigNumber(`${daiAmount}e+18`).toFixed()
        let ethRequested = new BigNumber(`${ethAmount}e+18`).toFixed()

        if (approved) {
            sendDAI(expirationDelta, amountToSend, ethRequested, interestRate)
        } else {
            daiContract.methods
            .approve(swapShareContract._address, approvalAmount)
            .send({from: account})
            .then(() => {
                setApproved(true)
                sendDAI(expirationDelta, amountToSend, ethRequested, interestRate)
            })
            .catch(e => console.error(e))
        }
    }

    function sendDAI(expiration, amount, ethRequested, interestRate) {
        swapShareContract.methods
            .requestLoan(expiration, amount, ethRequested, interestRate)
            .send({from: account})
            .then(() => setUpdateRequests(true))
    }

    return (
        <Form noValidate validated={validated} onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column'}}>
            <Form.Label>
                <Title>Create a Borrow Request</Title>
            </Form.Label>

            <Form.Group>
                <Form.Text className="text-muted mb-2" style={{fontSize: '1.1rem'}}>ETH to request</Form.Text>
                <Form.Control placeholder="ETH amount" value={ethAmount} onChange={handleChange(setEthAmount)} required />
                <Form.Control.Feedback type="invalid">
                    Please specify ETH.
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group>
                <Form.Text className="text-muted mb-2" style={{fontSize: '1.1rem'}}>DAI to store as collateral</Form.Text>
                <Form.Control placeholder="DAI amount" value={daiAmount} onChange={handleChange(setDaiAmount)} required />
                <Form.Control.Feedback type="invalid">
                    Please specify DAI.
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group>
                <Form.Text className="text-muted mb-2" style={{fontSize: '1.1rem'}}>Interest rate that you will borrow at: {interestRate}%</Form.Text>
                <Form.Control value={interestRate} onChange={handleChange(setInterestRate)} type="range" min="1" max="20" required />
            </Form.Group>

            <Form.Group>
                <Form.Text className="text-muted mb-2" style={{fontSize: '1.1rem'}}>Duration of loan before expiration</Form.Text>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <div style={{width: '6rem'}}>   
                        <Form.Control 
                            style={{textAlign: 'center'}} 
                            placeholder="0"
                            value={loanDuration.days} 
                            onChange={e => {
                                // let days = e.target.value == '' ? '0' : e.target.value
                                setLoanDuration({...loanDuration, days: e.target.value})
                            }} />
                        <Form.Text style={{textAlign: 'center'}}>Days</Form.Text>
                    </div>
                    <div style={{width: '6rem'}}>   
                        <Form.Control 
                            style={{textAlign: 'center'}} 
                            placeholder="0"
                            value={loanDuration.hours} 
                            onChange={e => {
                                // let hours = e.target.value == '' ? '0' : e.target.value
                                setLoanDuration({...loanDuration, hours: e.target.value})
                            }} />
                        <Form.Text style={{textAlign: 'center'}}>Hours</Form.Text>
                    </div>
                    <div style={{width: '6rem'}}>   
                        <Form.Control 
                            style={{textAlign: 'center'}} 
                            placeholder="0"
                            value={loanDuration.minutes} 
                            onChange={e => {
                                // let minutes = e.target.value == '' ? '0' : e.target.value
                                setLoanDuration({...loanDuration, minutes: e.target.value})
                            }} />
                        <Form.Text style={{textAlign: 'center'}}>Minutes</Form.Text>
                    </div>
                </div>
                <Form.Control.Feedback type="invalid">
                    Please specify a correct duration.
                </Form.Control.Feedback>
            </Form.Group>

            <Button className="mt-4" variant="light" type="submit">Submit</Button>
        </Form>
    );
  }

export default BorrowRequest
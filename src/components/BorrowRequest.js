import React, { useState } from 'react'
import Flatpickr from "react-flatpickr"
import BigNumber from "bignumber.js"

import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

const BorrowRequest = ({ account, swapShareContract, daiContract, setUpdateRequests }) => {
    const [validated, setValidated] = useState(false)
    const [approved, setApproved] = useState(false)
    const approvalAmount = new BigNumber('1000e+18').toFixed()

    const [daiAmount, setDaiAmount] = useState('')
    const [ethAmount, setEthAmount] = useState('')
    const [expirationDate, setExpirationDate] = useState(null)
    const [interestRate, setInterestRate] = useState('')

    const handleSubmit = (event) => {
        const form = event.currentTarget;

        if (form.checkValidity() === false) {
          event.stopPropagation();
        } else {
            setValidated(true);
            submitBorrowRequest()
        }

        event.preventDefault()
      };

    const handleChange = setFunc => e => {
        setFunc(e.target.value)
    }

    function submitBorrowRequest() {
        let amountToSend = new BigNumber(`${daiAmount}e+18`).toString()
        let ethRequested = new BigNumber(`${ethAmount}e+18`).toString()

        if (approved) {
            sendDAI(expirationDate, amountToSend, ethRequested, interestRate)
        } else {
            daiContract.methods
            .approve(swapShareContract._address, approvalAmount)
            .send({from: account})
            .then(() => {
                setApproved(true)
                sendDAI(expirationDate, amountToSend, ethRequested, interestRate)
            })
            .catch(e => console.error(e))
        }
    }

    function sendDAI(expiration, amount, ethRequested, interestRate) {
        swapShareContract.methods
            .borrowerCollateralDeposit(expiration, amount, ethRequested, interestRate)
            .send({from: account})
            .then(() => setUpdateRequests(true))
    }

    return (
        <Form noValidate validated={validated} onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column'}}>
            <Form.Label>Create a Borrow Request</Form.Label>

            <Form.Group>
                <Form.Text className="text-muted">ETH to request</Form.Text>
                <Form.Control placeholder="ETH amount" value={ethAmount} onChange={handleChange(setEthAmount)} required />
                <Form.Control.Feedback type="invalid">
                    Please specify ETH.
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group>
                <Form.Text className="text-muted">DAI to store as collateral</Form.Text>
                <Form.Control placeholder="DAI amount" value={daiAmount} onChange={handleChange(setDaiAmount)} required />
                <Form.Control.Feedback type="invalid">
                    Please specify DAI.
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group>
                <Form.Text className="text-muted">Interest rate that you will borrow at</Form.Text>
                <Form.Control placeholder="Interest rate" value={interestRate} onChange={handleChange(setInterestRate)} required />
                <Form.Control.Feedback type="invalid">
                    Please specify an interest rate
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group>
                <Form.Text className="text-muted">Date and time that loan must be paid by</Form.Text>
                <Flatpickr className="mt-2"
                    options={{ 
                        minDate: "2017-01-01",
                        enableTime: true,
                        dateFormat: "M d, Y  h:i K",
                        defaultDate: "today",
                        minDate: "today" 
                    }}
                    onChange={date => {
                        let utcTimestamp = date[0].getTime() / 1000
                        setExpirationDate(utcTimestamp)
                    }}
                />
            </Form.Group>

            <Button className="mt-2" variant="light" type="submit">Submit</Button>
        </Form>
    );
  }

export default BorrowRequest
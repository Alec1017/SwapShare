import React, { useState, useEffect, useRef } from 'react'
import flatpickr from "flatpickr"
import BigNumber from "bignumber.js"

import { Title } from './index'

import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

const BorrowRequest = ({ account, swapShareContract, daiContract, setUpdateRequests }) => {
    const [validated, setValidated] = useState(false)
    const [approved, setApproved] = useState(false)
    const approvalAmount = new BigNumber('1000e+18').toFixed()

    const inputRef = useRef(null)

    const [daiAmount, setDaiAmount] = useState('')
    const [ethAmount, setEthAmount] = useState('')
    const [expirationDate, setExpirationDate] = useState(null)
    const [interestRate, setInterestRate] = useState('3')


    useEffect(() => {
        flatpickr(inputRef.current, {
            enableTime: true,
            dateFormat: "M d, Y  h:i K",
            defaultDate: "today",
            minDate: "today",
            onChange: (date) => {
                console.log(date)
                let utcTimestamp = date[0].getTime() / 1000
                setExpirationDate(utcTimestamp)
            } 
        })
    }, [])

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
        let amountToSend = new BigNumber(`${daiAmount}e+18`).toFixed()
        let ethRequested = new BigNumber(`${ethAmount}e+18`).toFixed()

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
                <Form.Text className="text-muted" style={{fontSize: '1rem'}}>ETH to request</Form.Text>
                <Form.Control placeholder="ETH amount" value={ethAmount} onChange={handleChange(setEthAmount)} required />
                <Form.Control.Feedback type="invalid">
                    Please specify ETH.
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group>
                <Form.Text className="text-muted" style={{fontSize: '1rem'}}>DAI to store as collateral</Form.Text>
                <Form.Control placeholder="DAI amount" value={daiAmount} onChange={handleChange(setDaiAmount)} required />
                <Form.Control.Feedback type="invalid">
                    Please specify DAI.
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group>
                <Form.Text className="text-muted" style={{fontSize: '1rem'}}>Interest rate that you will borrow at: {interestRate}%</Form.Text>
                <Form.Control value={interestRate} onChange={handleChange(setInterestRate)} type="range" min="1" max="20" required />
            </Form.Group>

            <Form.Group>
                <Form.Text className="text-muted" style={{fontSize: '1rem'}}>Date and time that loan must be paid by</Form.Text>
                <Form.Control type="date" ref={inputRef} />
            </Form.Group>

            <Button className="mt-4" variant="light" type="submit">Submit</Button>
        </Form>
    );
  }

export default BorrowRequest
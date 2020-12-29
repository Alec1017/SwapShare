import React, { useEffect, useState } from 'react'

import Flatpickr from "react-flatpickr"
import BigNumber from "bignumber.js"


import "flatpickr/dist/themes/material_green.css";
import { Body } from './index'

import Form from 'react-bootstrap/Form'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'


const Escrow = ({web3, account, escrowContract, DAIContract}) => {
  const [daiAmount, setDaiAmount] = useState('')
  const [expirationDate, setExpirationDate] = useState(null)

  const [escrowTransactions, setEscrowTransactions] = useState(null)

  const [approved, setApproved] = useState(false)
  const approvalAmount = new BigNumber('1000e+18').toFixed()

  useEffect(() => {
    // getDeposits()
  }, [])

  // function getDeposits() {
  //   escrowContract.methods
  //   .getAllDeposits(account)
  //   .call()
  //   .then(result => {
  //       let transactions = [];
  //       result.map((value, index) => {
  //           const now = new Date()
  //           const expiration = new Date(parseInt(value[0]) * 1000)

  //           transactions.push({
  //               'index': index,
  //               'expirationDate': expiration.toDateString(),
  //               'expirationTime': expiration.toLocaleTimeString(),
  //               'amount': value[1],
  //               'claimable': (expiration <= now)
  //           })
  //       })
  //       setEscrowTransactions(transactions)
  //   })
  // }

  const handleChange = setFunc => e => {
    setFunc(e.target.value)
  }

  // const claimFunds = (index) => () => {
  //   escrowContract.methods
  //       .Withdraw(account, index)
  //       .send({from: account})
  //       .then(() => getDeposits())
  // }  

  // function approveDAI() {

  //   DAIContract.methods
  //     .approve(escrowContract._address, parseInt(daiAmount))
  //     .send({from: account})
  //     .then(() => setApproved(true))
  //     .catch(e => console.error(e));

  //   // escrowContract.methods
  //   //   .approveCollateralDeposit(parseInt(daiAmount))
  //   //   .send({from: account})
  //   //   .then(() => {
  //   //     setApproved(true)
  //   //   }).catch(error => {
  //   //     console.log(error);
  //   //   })


  //   // event.preventDefault()
  // }

  // function sendDAI(event) {
  //   // const weiAmount = web3.utils.toWei(ethAmount, 'ether');

  //   // escrowContract.methods
  //   //   .deposit(account, expirationDate)
  //   //   .send({
  //   //     from: account,
  //   //     value: weiAmount
  //   //   }).then(() => getDeposits())
  //   escrowContract.methods
  //     .borrowerCollateralDeposit(expirationDate, parseInt(daiAmount))
  //     .send({from: account})

  //   event.preventDefault()
  // }

  function approveDAI(event) {
    let amountToSend = new BigNumber(`${daiAmount}e+18`).toString()

    // DAIContract.methods
    //   .approve(escrowContract._address, amountToSend)
    //   .send({from: account})
    //   .then(() => sendDAI(expirationDate, amountToSend))
    //   .catch(e => console.error(e))

    if (approved) {
      sendDAI(expirationDate, amountToSend)
    } else {
      DAIContract.methods
      .approve(escrowContract._address, approvalAmount)
      .send({from: account})
      .then(() => {
        setApproved(true)
        sendDAI(expirationDate, amountToSend)
      })
      .catch(e => console.error(e))
    }

    event.preventDefault()
  }

  function sendDAI(expiration, amount) {
    escrowContract.methods
      .borrowerCollateralDeposit(expiration, amount)
      .send({from: account})
  }

  return (
    <div style={{display: 'flex', backgroundColor: '#282c34', justifyContent: 'center'}}>
      <Body>
        <Form className="pt-4" onSubmit={approveDAI} style={{display: 'flex', flexDirection: 'column'}}>
            <Form.Label>Send DAI to escrow</Form.Label>
            <Form.Control placeholder="DAI amount" value={daiAmount} onChange={handleChange(setDaiAmount)} />
            <Form.Text className="text-muted">Amount of DAI to store</Form.Text>
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
            <Form.Text className="text-muted">Date and time when you can withdraw again</Form.Text>
            <Button className="mt-2" variant="light" onClick={approveDAI}>Submit</Button>
           
        </Form>
      </Body>
      {/* <Body>
        {escrowTransactions &&
          <div className="ml-4" style={{height: '70vh', overflow: 'hidden', overflowY: 'scroll'}}>
            {escrowTransactions.map((value, index) => (
                <Card className="mb-3" style={{color: '#282c34'}} key={index}>
                    <Card.Header>{web3.utils.fromWei(value.amount, 'ether')} ETH</Card.Header>
                    <Card.Body>
                        <Card.Title>Funds will be locked in escrow until:</Card.Title>
                        <Card.Text>
                            Date: {value.expirationDate}<br />
                            Time: {value.expirationTime}
                        </Card.Text>
                        <Button 
                            variant={value.claimable ? 'primary' : 'secondary'} 
                            disabled={!value.claimable}
                            onClick={claimFunds(value.index)}
                        >
                            {value.claimable ? 'Claim ETH' : 'not claimable'}
                        </Button>
                    </Card.Body>
                </Card>
            ))}
            </div>
        }
      </Body> */}
    </div>
  );
}

export default Escrow

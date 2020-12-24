import React, { useEffect, useState } from 'react'

import Flatpickr from "react-flatpickr";


import "flatpickr/dist/themes/material_green.css";
import { Body } from './index'

import Form from 'react-bootstrap/Form'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'


const Escrow = ({web3, account, escrowContract}) => {
  const [ethAmount, setEthAmount] = useState('')
  const [expirationDate, setExpirationDate] = useState(null)

  const [escrowTransactions, setEscrowTransactions] = useState(null)

  useEffect(() => {
    if (escrowContract != null) {
        getDeposits()
    }
  }, [escrowContract])

  function getDeposits() {
    escrowContract.methods
    .getAllDeposits(account)
    .call()
    .then(result => {
        let transactions = [];
        result.map((value, index) => {
            const now = new Date()
            const expiration = new Date(parseInt(value[0]) * 1000)

            transactions.push({
                'index': index,
                'expirationDate': expiration.toDateString(),
                'expirationTime': expiration.toLocaleTimeString(),
                'amount': value[1],
                'claimable': (expiration <= now)
            })
        })
        setEscrowTransactions(transactions)
    })
}

  const handleChange = setFunc => e => {
    setFunc(e.target.value)
  }

  const claimFunds = (index) => () => {
    escrowContract.methods
        .Withdraw(account, index)
        .send({from: account})
        .then(() => getDeposits())
  }  

  function sendETH(event) {
    const weiAmount = web3.utils.toWei(ethAmount, 'ether');

    escrowContract.methods
      .deposit(account, expirationDate)
      .send({
        from: account,
        value: weiAmount
      }).then(() => getDeposits())

    event.preventDefault()
  }

  return (
    <div style={{display: 'flex', backgroundColor: '#282c34', justifyContent: 'center'}}>
      <Body>
        {web3 &&
          <div>
            <Form className="pt-4" onSubmit={sendETH} style={{display: 'flex', flexDirection: 'column'}}>
              <Form.Label>Send ETH to escrow</Form.Label>
              <Form.Control placeholder="ETH amount" value={ethAmount} onChange={handleChange(setEthAmount)} />
              <Form.Text className="text-muted">Amount of ETH to store</Form.Text>
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
              <Button className="mt-2" variant="light" type="submit">Submit</Button>
            </Form>
          </div>
        }
      </Body>
      <Body>
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
      </Body>
    </div>
  );
}

export default Escrow

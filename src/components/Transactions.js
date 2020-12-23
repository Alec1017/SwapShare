import React, { useEffect, useState } from 'react'

import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'

const Transactions = ({ account, web3, contract }) => {
    const [escrowTransactions, setEscrowTransactions] = useState(null)

    useEffect(async () => {
        if (account != null) {
            contract.methods
            .getAllDeposits(account)
            .call()
            .then(result => {
                console.log(result)
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
    }, [account])

    const claimFunds = (index) => () => {
        contract.methods
            .Withdraw(account, index)
            .send({from: account})
    }

    return (
        <div>
            {escrowTransactions &&
            <div>
            {escrowTransactions.map((value, index) => (
                <Card className="mt-3" style={{color: '#282c34'}} key={index}>
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

        </div>
    );
  }

export default Transactions
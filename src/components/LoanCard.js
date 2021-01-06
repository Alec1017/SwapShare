import React from 'react'

import Card from 'react-bootstrap/Card'

const LoanCard = ({ data, key, children }) => {
    return (
        <Card className="mb-4" style={{color: '#282c34', minWidth: '20rem'}} key={key}>
            <Card.Header>{data.ethAmount} ETH requested</Card.Header>
            <Card.Body>
                <Card.Title>Posted collateral: {data.daiAmount} DAI</Card.Title>
                <Card.Text>Offered interest rate: {data.interestRate}%</Card.Text>
                <Card.Text>Total to be paid back: {data.ethPlusInterest} ETH</Card.Text>
                <Card.Text>Loan will be paid in full by:</Card.Text>
                <Card.Text>
                    Date: {data.expirationDate}<br />
                    Time: {data.expirationTime}
                </Card.Text>
                { children }
            </Card.Body>
        </Card>
    )
}

export default LoanCard
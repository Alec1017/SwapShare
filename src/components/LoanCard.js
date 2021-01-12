import React, { useState } from 'react'

import { LOAN_STATE } from '../Constants'

import Card from 'react-bootstrap/Card'
import Collapse from 'react-bootstrap/Collapse'

const LoanCard = ({ data, children }) => {
    const [open, setOpen] = useState(false)

    return (
        <Card className="mb-4" style={{color: '#282c34', minWidth: '20rem'}}>
            <Card.Header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                    <div>Requested: {data.ethAmount} ETH</div>
                    <div>Collateral: {data.daiAmount} DAI</div>
                </div>
                <div 
                    style={{
                        backgroundColor: '#C0C0C0', 
                        width: '2rem', 
                        height: '2rem',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        textAlign: 'center'
                    }}
                    onClick={() => setOpen(!open)} 
                    aria-expanded={open}
                >
                    {open 
                        ? <b>-</b>
                        : <b>+</b>
                    }
                </div>
            </Card.Header>
            <Collapse in={open}>
                <div>
                    <Card.Body>
                        <div className="mb-3">Interest rate: <b>{data.interestRate}%</b></div>
                        <div className="mb-3">To be paid back: <b>{data.ethPlusInterest} ETH</b></div>
                        {data.state === LOAN_STATE.requested &&
                            <div>
                                <div>Proposed Loan Duration: </div>
                                <div className="ml-4 mb-3">
                                    <div>Days: <b>{data.loanDuration.days}</b></div>
                                    <div>Hours: <b>{data.loanDuration.hours}</b></div>
                                    <div>Minutes: <b>{data.loanDuration.minutes}</b></div>
                                </div>
                            </div> 
                        }

                        {data.state === LOAN_STATE.fulfilled &&
                            <div>
                                <div>Loan Expiration Date: </div>
                                <div className="ml-4 mb-3">
                                    <div>Date: <b>{data.expirationDate}</b></div>
                                    <div>Time: <b>{data.expirationTime}</b></div>
                                </div>
                            </div>
                        }
                    
                        { children }
                    </Card.Body>

                </div>
                
            </Collapse>
        </Card>
    )
}

export default LoanCard
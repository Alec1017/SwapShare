import React, { useState } from 'react'

import { Container, Title } from './index'

import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'

const GetRinkebyDAI = ({DAIContract, account}) => {
    const [tokenAddress, setTokenAddress] = useState(null)
    const [loading, setLoading] = useState(false)

    const mintTokens = () => {
        setLoading(true)
        setTokenAddress(null)

        DAIContract.methods
        .mint(account)
        .send({from: account})
        .then(() => {
            setTokenAddress(DAIContract._address)
            setLoading(false)
        })
    }

    return (
        <Container>
            <Col className="mx-auto" md={6} style={{textAlign: 'center'}}>
                <Title>Getting Rinkeby DAI token</Title>
                <div className="mt-4">
                    This app uses a mock DAI token, which can be minted to your account by using the button below.
                </div>
                <div className="mt-4">
                    <Button variant="light" onClick={mintTokens}>Mint 1000 DAI</Button>
                </div>
                {tokenAddress
                    ? <div className="mt-4">
                        To access the DAI token in MetaMask, import the token using this contract address:
                        <div>{tokenAddress}</div>
                      </div>
                    : <div>{loading && <div className="mt-4">Please wait up to 30 seconds while DAI is minted for you...</div>}</div>
                }
            </Col>
        </Container>
    )
}

export default GetRinkebyDAI
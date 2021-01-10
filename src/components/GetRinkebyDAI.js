import React from 'react'

import { Container, Title } from './index'
import { COMPOUND_DAI_CONTRACT } from '../Constants'

import Col from 'react-bootstrap/Col'

const GetRinkebyDAI = () => (
    <Container>
        <Col className="mx-auto" md={6} style={{textAlign: 'center'}}>
            <Title>Getting Rinkeby DAI token</Title>
            <div className="mt-4">
                This app uses the same DAI token that <a style={{color: 'white'}} href="https://compound.finance"><b>Compound.finance</b></a> uses for its DAI faucet
            </div>
            <div className="mt-4">
                This contract address below can be imported into MetaMask as a new token to access DAI:
            </div>
            <div className="mt-1">{ COMPOUND_DAI_CONTRACT }</div>
        </Col>
    </Container>
)

export default GetRinkebyDAI
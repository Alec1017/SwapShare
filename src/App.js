import React, { useEffect, useState } from 'react'
import Web3 from 'web3'

import Escrow from './abis/Escrow.json'

import './App.css'
import logo from './logo.svg'
import { Body, Header } from './components'
import WalletButton from './components/WalletButton'
import useWeb3Modal from './hooks/useWeb3Modal'

import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'


const App = () => {
  const [web3, setWeb3] = useState(null)
  const [networkID, setNetworkID] = useState(null)
  const [account, setAccount] = useState(null)
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal()

  const [escrowContract, setEscrowContract] = useState(null)

  const [ethAmount, setEthAmount] = useState('')

  useEffect(() => {
    if (provider != null) {
      window.ethereum.autoRefreshOnNetworkChange = false

      setNetworkID(window.ethereum.networkVersion)
      window.ethereum.request({method: 'eth_requestAccounts'}).then((accounts) => {
        setAccount(accounts[0])
      })
      setWeb3(new Web3(provider))
    }
  }, [provider])


  useEffect(() => {
    if (web3 != null) {
      setEscrowContract(new web3.eth.Contract(
        Escrow.abi,
        Escrow.networks[networkID].address
      ))
    }
  }, [web3])


  const handleChange = setFunc => e => {
    setFunc(e.target.value)
  }

  function sendETH(event) {
    const weiAmount = web3.utils.toWei(ethAmount, 'ether');

    escrowContract.methods
      .deposit(account)
      .send({
        from: account,
        value: weiAmount
      })

    event.preventDefault()
  }

  function withdrawETH() {
    escrowContract.methods
      .withdraw(account)
      .send({from: account})
  }

  return (
    <div className="App">
      <Header>
        <div className="mr-2">{account}</div>
        <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
      </Header>
      <Body>
        <img src={logo} className="App-logo" alt="logo" />
        {web3 &&
          <div>
            <Form className="pt-4" onSubmit={sendETH}>
              <Form.Label>Send ETH to escrow</Form.Label>
              <Form.Control placeholder="ETH amount" value={ethAmount} onChange={handleChange(setEthAmount)} />
              <Form.Text className="text-muted">Your ETH will not be lost</Form.Text>
              <Button className="mt-2" variant="light" type="submit">Submit</Button>
              <Button className="ml-2 mt-2" variant="primary" onClick={withdrawETH}>Withdraw ETH</Button>
            </Form>
          </div>
        }
      </Body>

    </div>
  );
}

export default App;

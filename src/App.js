import React, { useEffect, useState } from 'react'
import Web3 from 'web3'
import Flatpickr from "react-flatpickr";

import Escrow from './abis/Escrow.json'

import './App.css'
import "flatpickr/dist/themes/material_green.css";
import logo from './logo.svg'
import { Body, Header } from './components'
import WalletButton from './components/WalletButton'
import Transactions from './components/Transactions'
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
  const [expirationDate, setExpirationDate] = useState(null)

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
      .deposit(account, expirationDate)
      .send({
        from: account,
        value: weiAmount
      })

    event.preventDefault()
  }

  return (
    <div className="App">
      <Header>
        <div className="mr-2">{account}</div>
        <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
      </Header>
      <div style={{display: 'flex', 
                   backgroundColor: '#282c34',
                   justifyContent: 'center'}}>

      
      <Body>
        <img src={logo} className="App-logo" alt="logo" />
        {web3 &&
          <div>
            <Form className="pt-4" onSubmit={sendETH} style={{display: 'flex', flexDirection: 'column'}}>
              <Form.Label>Send ETH to escrow</Form.Label>
              <Form.Control placeholder="ETH amount" value={ethAmount} onChange={handleChange(setEthAmount)} />
              <Form.Text className="text-muted">Your ETH will not be lost</Form.Text>
              {/* <Button className="mt-2" variant="primary" onClick={withdrawETH}>Withdraw ETH</Button> */}
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
        {escrowContract &&
          <Transactions account={account} web3={web3} contract={escrowContract} />
        }
      </Body>
      </div>

    </div>
  );
}

export default App;

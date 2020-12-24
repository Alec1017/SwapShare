import React, { useEffect, useState } from 'react'
import Web3 from 'web3'

import EscrowABI from './abis/Escrow.json'

import './App.css'
import "flatpickr/dist/themes/material_green.css"
import logo from './logo.svg'

import { Header, Body } from './components'
import WalletButton from './components/WalletButton'
import Escrow from './components/Escrow'

import useWeb3Modal from './hooks/useWeb3Modal'


const App = () => {
  const [web3, setWeb3] = useState(null)
  const [networkID, setNetworkID] = useState(null)
  const [account, setAccount] = useState(null)
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal()

  const [escrowContract, setEscrowContract] = useState(null)

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
        EscrowABI.abi,
        EscrowABI.networks[networkID].address
      ))
    }
  }, [web3])


  return (
    <div className="App">
      <Header>
        <div className="mr-2">{account}</div>
        <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
      </Header>
      {web3 && escrowContract && account
        ? <Escrow web3={web3} account={account} escrowContract={escrowContract} />
        : <Body>
            <img src={logo} className="App-logo" alt="logo" />
            <div style={{fontSize: '2rem'}}>SwapShare</div>
            <div>A direct peer-to-peer crypto lending service</div>
          </Body>
      }
    </div>
  );
}

export default App;

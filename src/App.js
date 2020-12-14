import React, { useEffect, useState } from 'react'
import Web3 from 'web3';

import SimpleSmartContract from './abis/SimpleSmartContract.json'
import logo from './logo.svg';
import './App.css';

const App = () => {
  const [web3, setWeb3] = useState({})
  const [networkID, setNetworkID] = useState(null)
  const [account, setAccount] = useState(null)

  useEffect(() => {
    // Check if the user has metamask already installed
    if (typeof window.ethereum !== 'undefined' && false) {
      connectToMetaMask()
    }
    // Lets just fallback to the ganache GUI 
    else {
      connectToGanache()
    }
  }, []) 

  useEffect(() => {
    if (account != null) {
      loadBlockchainData()
    }
  }, [account])

  async function connectToMetaMask() {
    try {
      window.ethereum.autoRefreshOnNetworkChange = false;

      setWeb3(new Web3(window.ethereum))
      setNetworkID(window.ethereum.networkVersion)
      window.ethereum.request({method: 'eth_requestAccounts'}).then((accounts) => {
        setAccount(accounts[0])
      })
    } catch (error) {
      console.error('User denied access')
    }
  }

  async function connectToGanache() {
    try {
      const ganacheInstance = new Web3('http://172.21.96.1:8545')

      ganacheInstance.eth.net.getId().then(setNetworkID)
      ganacheInstance.eth.getAccounts().then((accounts) => {
        setAccount(accounts[0])
      })
      setWeb3(ganacheInstance)
    } catch (error) {
      console.error('Unable to connect to ganache')
    }
  }

  function loadBlockchainData() {
    const SimpleSmartContractData = SimpleSmartContract.networks[networkID]

    if (SimpleSmartContractData) {
      const simpleContract = new web3.eth.Contract(SimpleSmartContract.abi, SimpleSmartContractData.address);
      simpleContract.methods.hello().call().then(console.log)
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header>
    </div>
  );
}

export default App;

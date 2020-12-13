import React, { useEffect } from 'react'
import Web3 from 'web3';

import SimpleSmartContract from './abis/SimpleSmartContract.json'
import logo from './logo.svg';
import './App.css';

const App = () => {

  useEffect(() => {
    loadWeb3()
    loadBlockchainData()
  }, [])

  function loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      window.ethereum.send('eth_requestAccounts')
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Please install an Ethereum-compatible browser or extension. Consider using MetaMask!')
    }
  }

  async function loadBlockchainData() {
    const web3 = new Web3('http://172.21.96.1:8545')
    const networkID = await web3.eth.net.getId()

    const SimpleSmartContractData = SimpleSmartContract.networks[networkID]

    if (SimpleSmartContractData) {
      const simpleContract = new web3.eth.Contract(SimpleSmartContract.abi, SimpleSmartContractData.address);
      console.log(simpleContract)
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

import React, { useEffect, useState } from 'react'
import Web3 from 'web3';

import SimpleSmartContract from './abis/SimpleSmartContract.json'
import Storage from './abis/Storage.json'
import logo from './logo.svg';
import './App.css';
import { Body, Button, Header } from "./components";
import useWeb3Modal from "./hooks/useWeb3Modal";


function WalletButton({ provider, loadWeb3Modal, logoutOfWeb3Modal }) {
  return (
    <Button
      onClick={() => {
        if (!provider) {
          loadWeb3Modal();
        } else {
          logoutOfWeb3Modal();
        }
      }}
    >
      {!provider ? "Connect Wallet" : "Disconnect Wallet"}
    </Button>
  );
}

const App = () => {
  const [web3, setWeb3] = useState({})
  const [networkID, setNetworkID] = useState(null)
  const [account, setAccount] = useState(null)
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal()
  const [blockchainMessage, setBlockchainMessage] = useState(null)
  const [storageValue, setStorageValue] = useState('')
  const [blockchainStorageValue, setBlockchainStorageValue] = useState('')

  useEffect(() => {
    if (provider != null) {
      window.ethereum.autoRefreshOnNetworkChange = false;

      setNetworkID(window.ethereum.networkVersion)
      window.ethereum.request({method: 'eth_requestAccounts'}).then((accounts) => {
        setAccount(accounts[0])
      })
    }
  }, [provider])

  useEffect(() => {
    if (account != null) {
      loadBlockchainData()
    }
  }, [account])

  async function loadBlockchainData() {
    const ganacheWeb3 = new Web3('http://172.28.208.1:7545')
    const netID = await ganacheWeb3.eth.net.getId()

    const SimpleSmartContractData = SimpleSmartContract.networks[netID]

    if (SimpleSmartContractData) {
      const simpleContract = new ganacheWeb3.eth.Contract(SimpleSmartContract.abi, SimpleSmartContractData.address);
      simpleContract.methods.hello().call().then(setBlockchainMessage)
    }
  }

  function handleChange(event) {
    setStorageValue(event.target.value)
  }

  function handleSubmit(event) {
    const ganacheWeb3 = new Web3('http://172.28.208.1:7545')

    const StorageData = Storage.networks["5777"]

    if (StorageData) {
      const storageContract = new ganacheWeb3.eth.Contract(Storage.abi, StorageData.address);
      storageContract.methods.set(storageValue).send({from: account})
    }
    event.preventDefault()
  }

  function getValue() {
    const ganacheWeb3 = new Web3('http://172.28.208.1:7545')

    const StorageData = Storage.networks["5777"]

    if (StorageData) {
      const storageContract = new ganacheWeb3.eth.Contract(Storage.abi, StorageData.address);
      storageContract.methods.data().call().then(setBlockchainStorageValue)
    }
  }

  return (
    <div className="App">
      <Header>
        <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
      </Header>
      <Body>
        <img src={logo} className="App-logo" alt="logo" />
        {account && 
          <div>Your account: {account}</div>}
        {blockchainMessage &&
          <div>The blockchain says: {blockchainMessage}</div>}
        
        {account && 
          <form onSubmit={handleSubmit}>
            <label>
              Value: 
              <input type="text" value={storageValue} onChange={handleChange} />
            </label>
            <input type="submit" value="Submit" />
          </form>
        }
        {account &&
          <Button onClick={getValue}>get value</Button>
        }
        <div>{blockchainStorageValue}</div>
      </Body>

    </div>
  );
}

export default App;

import React, { useEffect, useState } from 'react'
import Web3 from 'web3'

import SimpleSmartContract from './abis/SimpleSmartContract.json'
import Storage from './abis/Storage.json'
import logo from './logo.svg'
import './App.css'
import { Body, Button, Header } from './components'
import WalletButton from './components/WalletButton'
import useWeb3Modal from './hooks/useWeb3Modal'


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
      window.ethereum.autoRefreshOnNetworkChange = false

      setNetworkID(window.ethereum.networkVersion)
      window.ethereum.request({method: 'eth_requestAccounts'}).then((accounts) => {
        setAccount(accounts[0])
      })
      setWeb3(new Web3(provider))
    }
  }, [provider])

  useEffect(() => {
    if (account != null) {
      loadBlockchainData()
    }
  }, [account])

  async function loadBlockchainData() {
    const SimpleSmartContractData = SimpleSmartContract.networks[networkID]

    if (SimpleSmartContractData) {
      const simpleContract = new web3.eth.Contract(SimpleSmartContract.abi, SimpleSmartContractData.address)
      simpleContract.methods.hello().call().then(setBlockchainMessage)
    }
  }

  function handleChange(event) {
    setStorageValue(event.target.value)
  }

  function handleSubmit(event) {
    const StorageData = Storage.networks[networkID]

    if (StorageData) {
      const storageContract = new web3.eth.Contract(Storage.abi, StorageData.address)
      storageContract.methods.set(storageValue).send({from: account})
    }
    event.preventDefault()
  }

  function getValue() {
    const StorageData = Storage.networks[networkID]

    if (StorageData) {
      const storageContract = new web3.eth.Contract(Storage.abi, StorageData.address)
      storageContract.methods.get().call().then(setBlockchainStorageValue)
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
